import React from 'react';
import { Button, InputNumber, Space } from 'antd';
import { Menu, Dropdown } from 'antd';
import {
    DownOutlined,
  } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';

class RobotBasicControlPanel extends React.Component {
    constructor (props) {
        super(props);
        this.spaceSize = 40;

        this.defaultGroupJogSpeed = 2000;
        this.state = {
            groupJogSpeed : this.defaultGroupJogSpeed,
            groupJogState : {f: false, s: false, t: false}
        };

        this.gaitMenu = (
            <Menu onClick={(e) => this.customGaitActionHandler(e)}>
                <Menu.Item key="tt">
                    TT
                </Menu.Item>
                <Menu.Item key="nb">
                    NB
                </Menu.Item>
                <Menu.Item key="ski">
                    SKI
                </Menu.Item>
                <Menu.Item key="wktd">
                    WKTD
                </Menu.Item>
          </Menu>
        );
        this.hmswMenu = (
            <Menu onClick={(e) => this.hmswActionHandler(e)}>
                <Menu.Item key="hmsw-f">
                    HMSW -F
                </Menu.Item>
                <Menu.Item key="hmsw-s">
                    HMSW -S
                </Menu.Item>
                <Menu.Item key="hmsw-t">
                    HMSW -T
                </Menu.Item>
          </Menu>
        );
        this.hmMenu = (
            <Menu onClick={(e) => this.hmActionHandler(e)}>
                <Menu.Item key="hm-f">
                    HM -F
                </Menu.Item>
                <Menu.Item key="hm-s">
                    HM -S
                </Menu.Item>
                <Menu.Item key="hm-t">
                    HM -T
                </Menu.Item>
          </Menu>
        );
    }

    customGaitActionHandler(e) {
        console.log(e.key);
        if (this.props.actionHandler) {
            this.props.actionHandler(e.key);
        }
    }

    jogActionHandler(cmdTag) {
        return (
            (e) => {
                if (typeof (this.state.groupJogSpeed) === "undefined" ||
                    this.state.groupJogSpeed === null ||
                    isNaN(this.state.groupJogSpeed)) {

                    this.setState({ groupJogSpeed: this.defaultGroupJogSpeed });
                }

                // flip the jogging state
                let gkey = cmdTag.charAt(cmdTag.length - 1);
                if (typeof(gkey) === "undefined") 
                    return;
                let newJogingState = this.state.groupJogState;
                newJogingState[gkey] = !newJogingState[gkey];
                this.setState({groupJogState : newJogingState});

                if (this.props.actionHandler) {
                    this.props.actionHandler(
                        "jogG", { vel: this.state.groupJogSpeed, 
                                  group : gkey,
                                  start : this.state.groupJogState[gkey] });
                }
                
            }
        );
    }

    hmswActionHandler(e) {
        console.log(e.key);
        if (this.props.actionHandler) {
            let gkey = (e.key).charAt((e.key).length - 1);
            this.props.actionHandler(
                "hmsw", 
                {group : gkey}
            );
        }
    }

    hmActionHandler(e) {
        console.log(e.key);
        if (this.props.actionHandler) {
            let gkey = (e.key).charAt((e.key).length - 1);
            this.props.actionHandler(
                "hm", 
                {group : gkey}
            );
        }
    }

    basicGaitActionHandler(cmdTag) {
        return(
        (e) => {
            console.log(cmdTag);
            if (this.props.actionHandler) {
                this.props.actionHandler(cmdTag);
            }
        });
    }

    jogSpeedChanged(value) {
        this.setState({ groupJogSpeed: value });
    }

    jogButtonText(jogState) {
        return (!jogState) ? "JOG" : "JOG STOP";
    }

    render() {
        return (
            <Space size="small" direction="vertical">
                <Space size={this.spaceSize}>
                    <Button className={"basic-cmd-button"} onClick={this.basicGaitActionHandler("en")}>EN</Button>
                    <Button className={"basic-cmd-button"} onClick={this.basicGaitActionHandler("ds")}>DS</Button>
                    <Button className={"basic-cmd-button"} onClick={this.basicGaitActionHandler("zrt")}>ZRT</Button>
                    <Dropdown overlay={this.hmMenu} className={"basic-cmd-button"}>
                        <Button>HM<DownOutlined />  </Button>
                    </Dropdown>
                    <Dropdown overlay={this.hmswMenu} className={"basic-cmd-button"}>
                        <Button>HMSW<DownOutlined />  </Button>
                    </Dropdown>
                    <Button className={"basic-cmd-button"} onClick={this.basicGaitActionHandler("rc")}>RC HARD</Button>
                    <Dropdown overlay={this.gaitMenu} className={"basic-cmd-button"}>
                        <Button type="primary">My Gait <DownOutlined />  </Button>
                    </Dropdown>
                </Space>
                <Space size={this.spaceSize}>
                    <Button className={"basic-cmd-button"} onClick={this.jogActionHandler("jog-f")}>{this.jogButtonText(this.state.groupJogState["f"])} -F</Button>
                    <Button className={"basic-cmd-button"} onClick={this.jogActionHandler("jog-s")}>{this.jogButtonText(this.state.groupJogState["s"])} -S</Button>
                    <Button className={"basic-cmd-button"} onClick={this.jogActionHandler("jog-t")}>{this.jogButtonText(this.state.groupJogState["t"])} -T</Button>
                    <div className={"basic-cmd-button"} align="center">JOG Speed: </div>
                    <InputNumber className={"basic-cmd-button"} precision="0" value={this.state.groupJogSpeed} onChange={(value) => this.jogSpeedChanged(value)}/>
                    <Button className={"basic-cmd-button"} onClick={this.basicGaitActionHandler("cq")}>CQ</Button>
                    <Button className={"basic-cmd-button"} onClick={this.basicGaitActionHandler("quit")}>QUIT</Button>
                </Space>
            </Space>
        );

    }

}

export {RobotBasicControlPanel};