import zmq
import struct
import json
import copy

class DataClient (object) :
    """
        Send cmd to dataAgent, retrieve state data from it
    """
    rbt_data_type = {
        'ROBOT_STATE' : 1,
        'CUSTOM_DATA' : 3,
        'HMI_DATA'    : 4
    }
    rbt_data_updater = {
        'ROBOT_STATE' : 'update_robot_state',
        'CUSTOM_DATA' : 'update_custom_data',
        'HMI_DATA'    : 'update_hmi_data'
    }

    def __init__(self, zmq_context, client_name):
        host_router_addr = 'tcp://127.0.0.1:5882'
        self.client_name = client_name
        self.requester_sock = zmq_context.socket(zmq.REQ)
        self.requester_sock.setsockopt(zmq.IDENTITY, bytes(client_name, 'utf-8'))
        self.requester_sock.connect(host_router_addr)
        self.robot_state_dict = RobotStateData()
        self.all_data_dict = {
            'ROBOT_STATE' : {},
            'CUSTOM_DATA' : {},
            'HMI_DATA'    : {}
        }
    
    def get_data(self):
        self.get_type_data('ROBOT_STATE')
        self.get_type_data('CUSTOM_DATA')
        self.get_type_data('HMI_DATA')
        return json.dumps(self.all_data_dict)
    
    def get_type_data(self, data_type):
        get_request = 'get ' + str(self.rbt_data_type[data_type])
        self.requester_sock.send(bytes(get_request, 'utf-8'), zmq.SNDMORE)
        self.requester_sock.send(bytes('', 'utf-8'))
        reply_header = self.requester_sock.recv()
        if (reply_header is None):
            print('reply_data is None')
        else:
            reply_content = self.requester_sock.recv()
            updater = getattr(self, self.rbt_data_updater[data_type])
            self.all_data_dict[data_type] = updater(reply_content)

    
    def update_robot_state(self, raw_data):
        # resolve data from raw bytes
        self.robot_state_dict.unpack(raw_data)
        return self.robot_state_dict.data_dict

    def update_custom_data(self, raw_data):
        try:
            json_obj = json.loads(str(raw_data, 'utf-8'))
            return json_obj if json_obj else {}
        except ValueError:
            print('Invalid custom data')
            return {}

    def update_hmi_data(self, raw_data):
        try:
            json_obj = json.loads(str(raw_data, 'utf-8'))
            return json_obj if json_obj else {}
        except ValueError:
            print('Invalid hmi data')
            return {}

    def send_cmd(self, cmd):
        print(cmd)
        self.requester_sock.send(bytes('fwd', 'utf-8'), zmq.SNDMORE)
        cmd_msg = ArisMsg(cmd)
        self.requester_sock.send(cmd_msg.get_bytes())
        reply_header = self.requester_sock.recv()
        if (reply_header is None):
            print('reply_data is None')
        else:
            reply_content = self.requester_sock.recv()

class RobotStateData(object):

    def __init__(self):
        self.data_dict = {
            'count' : 0,
            'time_stamp' : 0,
            'motion_data' : [],
            'trqsensor_data' : [],
            'imu_data' : [],
            'gait_id' : [],
            'gait_name' : []
        }
    
    def unpack(self, raw_data):
        self.unpack_time(raw_data)
        self.unpack_motion(raw_data)
        self.unpack_trqsensor(raw_data)
        self.unpack_imu(raw_data)
        self.unpack_gaitinfo(raw_data)
    
    def unpack_time(self, raw_data):
        (cnt, tstamp) = struct.unpack_from('@iq', raw_data, 0)
        self.data_dict['count'] = cnt
        self.data_dict['time_stamp'] = tstamp

    def unpack_motion(self, raw_data):
        start_offset = 16
        motion_num = 18
        self.data_dict['motion_data'] = []
        for i in range(motion_num):
            # mot_data defined as (sw, tpos, apos, avel, acur, diput, trq) 
            mot_data = list(struct.unpack_from('@iiiiiif', \
                                               raw_data, start_offset+i*7*4))
            # round last data
            mot_data[-1] = round(mot_data[-1], 4)
            self.data_dict['motion_data'].append(mot_data)
    
    def unpack_trqsensor(self, raw_data):
        start_offset = 16 + 18*7*4
        trqsensor_board_num = 3
        self.data_dict['trqsensor_data'] = []
        for i in range(trqsensor_board_num):
            # trqsr_data defined as readings[6]
            trqsr_data = struct.unpack_from('@ffffff', raw_data, start_offset+i*6*4)
            round_trq_data = [round(x, 4) for x in trqsr_data]
            self.data_dict['trqsensor_data'].append(round_trq_data)

    def unpack_imu(self, raw_data):
        start_offset = 16 + 18*7*4 + 3*6*4
        imu_num = 1
        self.data_dict['imu_data'] = []
        for i in range(imu_num):
            # imu_data defined as gyro[3], acc[3], euler[3]
            imu_data = struct.unpack_from('@fffffffff', raw_data, start_offset+i*9*4)
            round_imu_data = [round(x, 4) for x in imu_data]
            self.data_dict['imu_data'].append(round_imu_data)

    def unpack_gaitinfo(self, raw_data):
        start_offset = 16 + 18*7*4 + 3*6*4 + 1*9*4
        # gait info defined as (gait_id, gait_name[8])
        (gid, gname) = struct.unpack_from('@i8s', raw_data, start_offset)
        self.data_dict['gait_id'] = gid
        self.data_dict['gait_name'] = str(gname.split(b'\0', 1)[0], 'utf-8')

class ArisMsg(object):
    """
    Construct the aris message with a cmd string
    layout of the aris msg (in bytes):
        [msg header 40 bytes] [content string]
    """
    def __init__(self, data_string):
        self.data_bytes = bytes(data_string, 'utf-8')
        msg_len = len(data_string) + 1
        header_layout = '@iiqqqq'
        cmd_layout = '{}s'.format(msg_len)
        self.msg_layout = ''.join([header_layout, cmd_layout])
        self.msg_bytes = struct.pack(self.msg_layout, \
                                     msg_len, 0, 0, 0, 0, 0,\
                                     self.data_bytes)
    
    def get_bytes(self):
        return self.msg_bytes
    
