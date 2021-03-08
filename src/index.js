import React from 'react';
import { render } from 'react-dom';
import { Layout, message } from 'antd';
import { GamePadControl } from "./gamePad.js"
import { backendInstance } from "./backEnds.js";
import { PageMenu } from "./pageMenu.js";
import { StateMonitorPage } from "./stateMonitorPage.js";
import { GaitControlPage } from "./gaitControlPage.js";

import { LidarMapPage, HeightMapPage, CameraPage } from "./rosControlPage.js";
import 'antd/dist/antd.css';
import './index.css';

const { Content } = Layout;

class MyApp extends React.Component {
        
    constructor (props) {
        super(props);

        this.gaitParamAdjustor = this.props.backends.gaitParamAdjustor;
        this.state = {
            robotData : {},
            pageKey : 0,
            gaitParamState : this.gaitParamAdjustor.getCurrentParam()
        };

        this.MAX_LOG_LENGTH = 100;
        this.cmdLogs = [];

        this.cmdStringBuilder = this.props.backends.cmdStringBuilder;
        this.webSocketClt = this.props.backends.webSocketClt;
        this.webSocketClt.setMessageHandler((msg) => this.messageReceived(msg));

    }

    processGamepadEvent(evt) {
        if (!evt) return;
        this.gaitParamAdjustor.processGamepadEvent(evt, this.state.robotData);

        // update param state in the app side, note that if the app is closed,
        // all param state can be lost
        this.setState({gaitParamState : this.gaitParamAdjustor.getCurrentParam()});

        // send gait control message to robot
        const ret = this.cmdStringBuilder.actionHandler(
            "online_gait_ctrl",
            this.state.gaitParamState,
            this.state.robotData
        );
        if (ret.needSend && ret.cmdString)
            this.send(ret.cmdString);
        if (ret.info)
            message.info(ret.info);

        console.log(ret.cmdString);
    }

    messageReceived(msg) {
        const robotData = JSON.parse(msg);
        this.setState({robotData : robotData});
    }

    actionHandler(cmdTag, param) {
        const ret = this.cmdStringBuilder.actionHandler(
            cmdTag, 
            param,
            this.state.robotData
        );

        if (ret.needSend && ret.cmdString){
            this.send(ret.cmdString);
            message.info("Msg sent:" + ret.cmdString);
        }

        if (ret.info)
            message.info(ret.info);

        if (cmdTag === "quit") {
            this.gaitParamAdjustor.setDefaultParam();
            this.setState(
                {gaitParamState : this.gaitParamAdjustor.getCurrentParam()}
            );
        }

    }

    send(cmd) {
        this.webSocketClt.send("fwd " + cmd);
        this.cmdLogs.unshift(cmd);
        while (this.cmdLogs.length > this.MAX_LOG_LENGTH) {
            this.cmdLogs.pop();
        }
    }

    render() {
        this.pages = [
            <StateMonitorPage
                actionHandler={
                    (cmdTag, param) =>
                        this.actionHandler(cmdTag, param)
                }
                cmdLog={this.cmdLogs}
                robotData={this.state.robotData}
            />,
            <GaitControlPage 
                actionHandler={
                    (cmdTag, param) =>
                        this.actionHandler(cmdTag, param)
                }
                robotData={this.state.robotData}
                gaitParamState={this.state.gaitParamState}
            />,
            <LidarMapPage/>,
            <CameraPage/>,
            <HeightMapPage/>
        ];
        return (
            <React.StrictMode>
                <GamePadControl
                    gamepad={this.props.backends.gamepad}
                    onGamepadEvent={(evt) => this.processGamepadEvent(evt)} />
                <Layout>
                    <PageMenu
                        pageKey={this.state.pageKey}
                        onPageSelected={(pageKey) => this.setState({ pageKey: pageKey })}
                    />
                    <Content id={"data-content"}>
                        {this.pages[this.state.pageKey]}
                    </Content>
                </Layout>
            </React.StrictMode>
        );
    }
}

render(<MyApp backends={backendInstance}/>, document.getElementById('root'));