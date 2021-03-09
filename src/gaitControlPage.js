import React from 'react';
import { Space, Card, InputNumber, message } from 'antd';
import { Row, Col, PageHeader, Button } from 'antd';
import { gaitParamModifyRule, gaitParamSettings } from "./config.js";
import {
    WarningTwoTone
  } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';

class GaitControlPanel extends React.Component {

    constructor(props) {
        super(props);

        this.typePrecision = {
            "f" : 3,
            "b" : 0,
            "i" : 0
        };

        this.typeName = {
            "f" : "float",
            "b" : "bool",
            "i" : "int"
        };
    }

    quitGaitHandler() {
        message.warn("Quit Gait");
        if (this.props.actionHandler)
            this.props.actionHandler("quit", {});
    }

    render () {
        const gaitName = this.props.gaitName;
        let paramDisplay = <React.Fragment />;
        if (!(gaitName in gaitParamModifyRule)) {
            paramDisplay = (
                <div className="gait-param-row">
                    <WarningTwoTone />&nbsp;No corrspondent gait param setting for {gaitName}
                </div>
            );
        }
        else {
            const paramEntry = gaitParamModifyRule[gaitName].paramEntry;
            const params = this.props.gaitParamState[paramEntry];
            paramDisplay = Object.keys(params).map((v, i) => {
                const paramType = gaitParamSettings[gaitName][v].type;
                return (
                    <Row className="gait-param-row" key={i}>
                        <Col span={12}>
                            {v}({this.typeName[paramType]}):
                        </Col>
                        <Col span={12}>
                            <InputNumber className={"gait-control-param-input"}
                                precision={this.typePrecision[paramType]}
                                disabled={!this.props.isActive}
                                value={params[v]}
                            />
                        </Col>
                    </Row>
                );
            });
        }

        return (
            <Card
                title={
                    "Param of " + gaitName.toUpperCase() +
                    (this.props.isActive ? " (Current Gait)" : "")
                }
                className={
                    this.props.isActive ?
                        "gait-control-panel-active" :
                        "gait-control-panel"
                }
                extra={[
                    this.props.isActive ?
                        <Button key="1" type="primary" 
                            onClick={()=>{this.quitGaitHandler()}}
                        >
                            Quit
                        </Button> :
                        <React.Fragment key="1" />
                ]}
            >
                {paramDisplay}
            </Card>
        );
    }
}

class GaitControlPage extends React.Component {

    emergencyStopHandler() {
        message.warn("Emegency-Stop!");
        if (this.props.actionHandler)
            this.props.actionHandler("cq", {});
    }

    render () {
        let currentGait = "None";
        let robotData = this.props.robotData;
        if (robotData["ROBOT_STATE"] &&
            robotData["ROBOT_STATE"]["gait_name"]) {

            currentGait = robotData["ROBOT_STATE"]["gait_name"];
        }
        
        return (
            <Space direction="vertical">
                <PageHeader
                    className="gait-control-page-header"
                    title={"Gait Control Panel"}
                    extra={[
                        <Button key="1" type="primary" danger
                            onClick={()=>this.emergencyStopHandler()}
                        >
                            Emergency Stop
                        </Button>
                    ]}
                />
                <Space direction="horizontal" align="start">
                    <GaitControlPanel
                        gaitName="nb"
                        isActive={currentGait === "nb"}
                        gaitParamState={this.props.gaitParamState}
                        actionHandler={this.props.actionHandler}
                    />
                    <GaitControlPanel
                        gaitName="tt"
                        isActive={currentGait === "tt"}
                        gaitParamState={this.props.gaitParamState}
                        actionHandler={this.props.actionHandler}
                    />
                    <GaitControlPanel
                        gaitName="wktd"
                        isActive={currentGait === "wktd"}
                        gaitParamState={this.props.gaitParamState}
                        actionHandler={this.props.actionHandler}
                    />
                </Space>
            </Space>
        );
    }
}

export {GaitControlPage};