import React from 'react';
import { Button, Space, Table, InputNumber } from 'antd';
import {
    CheckCircleTwoTone,
    InfoCircleTwoTone,
    QuestionCircleTwoTone,
    StopTwoTone
  } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';

class MotorDataTable extends React.Component {

    constructor (props) {
        super(props);

        this.maxMotorCount = 25;
        this.defaultMotorJogSpeed = 2000;
        this.state = {
            jogSpeed : Array(this.maxMotorCount)
        };
        for (let i = 0; i < this.state.jogSpeed.length; i++) {
            this.state.jogSpeed[i] = this.defaultMotorJogSpeed;
        }
        this.motorCols = [
            {
                title: 'No.',
                dataIndex: 'key',
                key: 'key',
                render: text => <b>{text}</b>,
            },
            {
                title: 'Status',
                dataIndex: 'sw',
                key: 'sw',
                width: 80,
                render: (sw) => {
                    const renderStatusIcon = (sw) => {
                        switch (parseInt(sw) & 15) {
                            case 0:
                            case 1:
                            case 3:
                                return(
                                    <StopTwoTone />
                                );
                            case 7:
                                return(
                                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                                );
                            case 8:
                                return(
                                    <InfoCircleTwoTone twoToneColor="#eb2f96" />
                                );
                            default:
                                return(
                                    <QuestionCircleTwoTone twoToneColor="#999999" />
                                );
                        }
                    };
                    
                    return (
                        <div>
                            {sw} &nbsp;
                            {renderStatusIcon(sw)}
                        </div>
                    );
                }
            },
            {
                title: 'TPos',
                dataIndex: 'tpos',
                key: 'tpos',
                width: 120,
            },
            {
                title: 'APos',
                dataIndex: 'apos',
                key: 'apos',
                width: 120,
            },
            {
                title: 'AVel',
                dataIndex: 'avel',
                key: 'avel',
                width: 120,
            },
            {
                title: 'ACur',
                dataIndex: 'acur',
                key: 'acur',
                width: 60,
            },
            {
                title: 'ATrq',
                dataIndex: 'atrq',
                key: 'atrq',
                width: 76,
            },
            {
                title: 'DIpt',
                dataIndex: 'dinpt',
                key: 'dinpt',
                width: 32,
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <Space size="small">
                        <Button onClick={() => {this.jogButtonClicked(record.key)}}>Jog</Button>
                        <Button onClick={() => {this.jogStopButtonClicked(record.key)}}>Stop</Button>
                        Spd:<InputNumber className={"motor-data-action-input"} 
                                precision="0"
                                value={this.state.jogSpeed[record.key]}
                                onChange={(value) => {this.jogSpeedInputChanged(record.key, value)}}/>
                    </Space>
                ),
            },
        ];
        this.motorPageSetting = {
            pageSize : 18,
            hideOnSinglePage : true
        };

        this.motorData = [
            {
                key: 0,
                sw: 4663,
                tpos: 398,
                apos: 396,
                avel: 301,
                acur: 91,
                atrq: 2.87,
                dinpt : 1
            },
        ];

        this.motorActionHandler = props.actionHandler;
    }

    jogButtonClicked(id) {
        console.log("Jog No." + id + " motor");
        if (this.state.jogSpeed[id] === null || isNaN(this.state.jogSpeed[id])) {
            let newSpeed = this.state.jogSpeed.slice();
            newSpeed[id] = this.defaultMotorJogSpeed;
            this.setState({ jogSpeed: newSpeed });
        } 
        if (this.motorActionHandler) 
            this.motorActionHandler("jogm", 
                {
                    id : id, 
                    vel : this.state.jogSpeed[id],
                    start : true
                }
            );
    }

    jogStopButtonClicked(id) {
        console.log("Stop jog No." + id + " motor");
        if (this.motorActionHandler) 
            this.motorActionHandler("jogm", {id : id, vel : 0, start: false});
    }

    jogSpeedInputChanged(id, value) {
        let newSpeed = this.state.jogSpeed.slice();
        newSpeed[id] = value;
        this.setState({jogSpeed: newSpeed});
    }

    updateDataSource() {
        let motorData = [];
        let robotData = this.props.robotData;
        if (!robotData["ROBOT_STATE"]) 
            return;
        for (let i = 0; i < robotData["ROBOT_STATE"]["motion_data"].length; i++) {
            let data = robotData["ROBOT_STATE"]["motion_data"][i];
            motorData.push({
                key   : i, 
                sw    : data[0],
                tpos  : data[1],
                apos  : data[2],
                avel  : data[3],
                acur  : data[4],
                dinpt : data[5],
                atrq  : data[6].toFixed(3)
            });
        }
        this.motorData = motorData.slice();
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.robotData === nextProps.robotData)
            return false;
        return true;
    }

    render() {
        this.updateDataSource();
        return (
            <Table id={"motor-data-table"}
                size={"small"}
                columns={this.motorCols}
                dataSource={this.motorData}
                pagination={this.motorPageSetting}
                bordered
            />
        );
    }
}

export {MotorDataTable};