import React from 'react';
import { Table, Card } from 'antd';
import 'antd/dist/antd.css';
import './index.css';

class ImuDataTable extends React.Component {

    constructor (props) {
        super(props);
        this.AccCols = [
            {
                title: 'X',
                dataIndex: 'X',
                key: 'X',
                width: 80,
            },
            {
                title: 'Y',
                dataIndex: 'Y',
                key: 'Y',
                width: 80,
            },
            {
                title: 'Z',
                dataIndex: 'Z',
                key: 'Z',
                width: 80,
            },
        ];
        this.GyroCols = this.AccCols;
        this.EulerCols = [
            {
                title: 'Roll',
                dataIndex: 'X',
                key: 'X',
                width: 80,
            },
            {
                title: 'Pitch',
                dataIndex: 'Y',
                key: 'Y',
                width: 80,
            },
            {
                title: 'Yaw',
                dataIndex: 'Z',
                key: 'Z',
                width: 80,
            },
        ]
        this.pageSetting = {
            pageSize : 10,
            hideOnSinglePage : true
        };

        this.imuData = {
            acc : [{
                X : 0.01,
                Y : -0.02,
                Z : 9.82,
                key : 1,
            }],
            gyro : [{
                X : 0.21,
                Y : -0.22,
                Z : 2.1,
                key : 1,
            }],
            euler : [{
                X : 0.21,
                Y : -0.22,
                Z : 2.1,
                key : 1,
            }],
        };

    }

    updateDataSource() {

        let robotData  = this.props.robotData;
        let imuData = {
            acc : [],
            gyro : [],
            euler : []
        };

        if (!robotData["ROBOT_STATE"]) 
            return;

        let imuCount = robotData["ROBOT_STATE"]["imu_data"].length;
        imuCount = 4;
        for (let i = 0; i < imuCount; i++) {
            // TODO : change index with i
            let data = robotData["ROBOT_STATE"]["imu_data"][0];
            imuData.gyro.push({
                key : i, 
                X   : (data[0]).toFixed(3),
                Y   : (data[1]).toFixed(3),
                Z   : (data[2]).toFixed(3),
            });
            imuData.acc.push({
                key : i, 
                X   : (data[3]).toFixed(3),
                Y   : (data[4]).toFixed(3),
                Z   : (data[5]).toFixed(3),
            });
            imuData.euler.push({
                key : i, 
                X   : (data[6]).toFixed(3),
                Y   : (data[7]).toFixed(3),
                Z   : (data[8]).toFixed(3),
            });
        }
        this.imuData = imuData;
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.robotData === nextProps.robotData)
            return false;
        return true;
    }

    render() {
        this.updateDataSource();
        return (
            <>
            <Card>
                <div className={"imu-table-title"}>Acc</div>
                <Table 
                    columns={this.AccCols} 
                    dataSource={this.imuData.acc}
                    pagination={this.pageSetting}/>
            </Card>
            <Card>
                <div className={"imu-table-title"}>Gyro</div>
                <Table 
                    columns={this.GyroCols} 
                    dataSource={this.imuData.gyro}
                    pagination={this.pageSetting}/>
            </Card>
            <Card>
                <div className={"imu-table-title"}>Euler</div>
                <Table 
                    columns={this.EulerCols} 
                    dataSource={this.imuData.euler}
                    pagination={this.pageSetting}/>
            </Card>
            </>
        );
    }

}

export {ImuDataTable};