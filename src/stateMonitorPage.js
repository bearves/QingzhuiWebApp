import React from 'react';
import { Button, Input, Space, message, Collapse } from 'antd';
import { GaitInfoPresent } from "./gaitInfoPresent.js";
import { MotorDataTable } from "./motorDataTable.js"
import { ImuDataTable } from "./imuDataTable.js"
import { RobotBasicControlPanel } from "./robotBasicControlPanel.js";
import 'antd/dist/antd.css';
import './index.css';

const { Panel } = Collapse;

class StateMonitorPage extends React.Component {

    constructor (props) {
        super (props);
        this.state = {
            cmdText : "",
        };
    }

    emergencyStopHandler() {
        message.warn("Emegency-Stop!");
        if (this.props.actionHandler)
            this.props.actionHandler("cq", {});
    }

    sendManualCmdHandler() {
        if (this.state.cmdText && this.state.cmdText.trim()){
            const cmdString = this.state.cmdText.trim();
            if (this.props.actionHandler)
                this.props.actionHandler("general", { cmdString: cmdString });
        }
    }

    renderCmdLogs() {
        if (this.props.cmdLog && Array.isArray(this.props.cmdLog)) {
            const logs = this.props.cmdLog;
            return (
                <div id="cmd-log-area-div" >
                    <ol>
                        {logs.map((v, i) => {
                            return (<li key={i}>{v}</li>);
                        })
                        }
                    </ol>
                </div>
            );
        }
        else {
            return <React.Fragment />
        }
    }

    render () {
        return (
            <Space direction="vertical" size="small">
                <Space id="cmd-holder" size="middle">

                    <Input id="cmd-text-input"
                        placeholder="tt --online --quit=1"
                        onChange={(ev) => { this.setState({ cmdText: ev.target.value }) }}
                        onPressEnter={() => this.sendManualCmdHandler()} />
                    <Button type="primary"
                        onClick={() => this.sendManualCmdHandler()}>
                        Send command
                    </Button>
                    <Button id="emergency-stop-button" type="primary" danger
                        onClick={() => this.emergencyStopHandler()}>
                        Emergency Stop
                    </Button>
                </Space>
                <Collapse bordered defaultActiveKey={['1']} >
                    <Panel header="Robot Basic Control" key="1">
                        <RobotBasicControlPanel
                            actionHandler={
                                (cmdTag, param) => 
                                    this.props.actionHandler(cmdTag, param)
                                } 
                        />
                    </Panel>
                    <Panel id="data-panel" header="Robot Data Monitor" key="2">
                        <Space align="start">
                            <MotorDataTable 
                                actionHandler={
                                    (cmdTag, param) => 
                                        this.props.actionHandler(cmdTag, param)
                                } 
                                robotData={this.props.robotData}
                            />
                            <Space direction="vertical">
                                <GaitInfoPresent robotData={this.props.robotData}/>
                                <ImuDataTable robotData={this.props.robotData}/>
                            </Space>
                        </Space>
                    </Panel>
                    <Panel header="Cmd Logs" key="3">
                        {this.renderCmdLogs()}
                    </Panel>
                </Collapse>
            </Space>
        )
    }
}

export {StateMonitorPage};