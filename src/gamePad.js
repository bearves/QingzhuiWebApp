/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

import React from 'react';
import { message } from 'antd';

// xbox controller key index-name map
const GamepadKeyNameMap = {
    0:  "A",   // A button 
    1:  "B",   // B button
    2:  "X",   // X button
    3:  "Y",   // Y button
    4:  "TLS", // top left shoulder 
    5:  "TRS", // top right shoulder
    6:  "BLS", // bottom left shoulder
    7:  "BRS", // bottom right shoulder
    8:  "SELECT", // select/back
    9:  "START",  // start/forward
    10: "LSP", // left stick press
    11: "RSP", // right stick press
    12: "LCU" , // left cross up
    13: "LCD" , // left cross down
    14: "LCL" , // left cross left
    15: "LCR" , // left cross right
};

const GamepadAxisNameMap = {
    0:  "LH", // left horizontal
    1:  "LV", // left vertical
    2:  "RH", // right horizontal
    3:  "RV", // right vertical
};

const GamepadUpdateInterval = 20; //ms

class Gamepad {

    constructor() {

        this.haveEvents = 'GamepadEvent' in window;
        this.haveWebkitEvents = 'WebKitGamepadEvent' in window;
        this.controllers = {};
        this.lastControllers = {};

        if (this.haveEvents) {
            console.log("Support gamepad event");
            window.addEventListener("gamepadconnected", (e)=>this.connectHandler(e));
            window.addEventListener("gamepaddisconnected", (e)=>this.disconnectHandler(e));
        } else if (this.haveWebkitEvents) {
            console.log("Support webkit gamepad event");
            window.addEventListener("webkitgamepadconnected", (e)=>this.connectHandler(e));
            window.addEventListener("webkitgamepaddisconnected", (e)=>this.disconnectHandler(e));
        } else {
            console.log("Do not support webkit gamepad event");
            setInterval(()=>this.scanGamepads(), 500); // actively scan for gamepads every 0.5 seconds
        }

        this.updateCount = 0;
        // update button and axis status every ${GamepadUpdateInterval} seconds
        setInterval(()=>this.updateStatus(), GamepadUpdateInterval); 

    }

    connectHandler(e) {
        let index = e.gamepad.index
        this.controllers[index] = e.gamepad;
        this.lastControllers[index] = {
            buttons : [],
            axes : []
        };

        if (this.onConnected) {
            this.onConnected(index);
        }
    }

    disconnectHandler(e) {
        delete this.controllers[e.gamepad.index];
        delete this.lastControllers[e.gamepad.index];
        if (this.onDisConnected) {
            this.onDisConnected(e.gamepad.index);
        }
    }

    updateStatus() {
        this.updateCount += 1;
        this.scanGamepads();
        
        for (let j in this.controllers) {
            let controller = this.controllers[j];
            let lastController = this.lastControllers[j];

            // trigger button pressed events
            for (let i = 0; i < controller.buttons.length; i++) {
                let button = controller.buttons[i];
                let lastBtn = lastController.buttons[i];

                if (!lastBtn) {
                    lastBtn = {touched : false, pressed: false, value : 0};
                }
                
                if (this.isPressed(button) && !this.isPressed(lastBtn)) {
                    if (this.onButtonPressed) {
                        // asynchronously execute     
                        setTimeout(() => {
                            this.onButtonPressed({
                                ctrlID: j,
                                buttonID: i
                            });
                        }, 0);
                    }
                }
            }
            this.storeLastButtonStatus(j);

            if (this.updateCount % 4 === 0) {
                if (lastController.axes.length > 0) {
                    for (let i = 0; i < controller.axes.length; i++) {
                        let currentValue = controller.axes[i];
                        let lastValue = lastController.axes[i];
                        if (Math.abs(currentValue - lastValue) >= 1e-3) {
                            // trigger axisChanged event every 4 loops
                            if (this.onAxisChanged) {
                                setTimeout(() => {
                                    this.onAxisChanged({
                                        ctrlID: j,
                                        axisID: i,
                                        values: controller.axes.slice()
                                    });
                                }, 0);
                            }
                            break;
                        }
                    }
                }
                this.storeLastAxisStatus(j);
            }
        }
    }

    isPressed(button) {
        let pressed = false;
        let touched = false;
        let val = 0;
        if (typeof (button) === "object") {
            pressed = button.pressed;
            if ('touched' in button) {
                touched = button.touched;
            }
            val = button.value;
        }
        else 
            val = button;
        return (pressed || touched || val > 0.5);
    }

    storeLastButtonStatus(j) {
        this.lastControllers[j].buttons = [];
        for (let k in this.controllers[j].buttons) {
            let currentBtn = this.controllers[j].buttons[k];
            let lastBtn = {};
            if (typeof (currentBtn) === "object") {
                lastBtn.pressed = currentBtn.pressed;
                if ('touched' in currentBtn) {
                    lastBtn.touched = currentBtn.touched;
                }
                lastBtn.value = currentBtn.value;
            }
            else {
                lastBtn.value = currentBtn;
            }

            this.lastControllers[j].buttons[k] = lastBtn;
        }
    }
    storeLastAxisStatus(j) {
        this.lastControllers[j].axes = this.controllers[j].axes.slice();
    }

    scanGamepads() {
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : 
            (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && (gamepads[i].index in this.controllers)) {
                this.controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }
}

class GamePadControl extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isConnected : false
        };
        this.gamepad = this.props.gamepad;
        this.gamepad.onConnected = (index) => this.connected(index);
        this.gamepad.onDisconnected = (index) => this.disconnected(index);
        this.gamepad.onButtonPressed = (buttonInfo) => this.buttonPressed(buttonInfo);
        this.gamepad.onAxisChanged = (axisInfo) => this.axisChanged(axisInfo);
    }

    connected(index) {
        this.setState({isConnected : true});
        message.info(`Gamepad ${index} connected`);
    }

    disconnected(index) {
        this.setState({isConnected : false});
        message.info(`Gamepad ${index} disconnected`);
    }

    buttonPressed(buttonInfo) {
        console.log(`Button ${buttonInfo.buttonID} pressed`);
        if (this.props.onGamepadEvent){
            this.props.onGamepadEvent({
                ctrlID : buttonInfo.ctrlID,
                buttonID : buttonInfo.buttonID,
                type : "ButtonPressed",
                axisValue : [0,0,0,0]
            });
        }
    }	

    axisChanged(axisInfo) {
        console.log(`Axis ${axisInfo.axisID} changed`);
        if (this.props.onGamepadEvent){
            this.props.onGamepadEvent({
                ctrlID : axisInfo.ctrlID,
                axisID : axisInfo.axisID,
                type : "AxisChanged",
                axisValue : axisInfo.values
            });
        }
    }

    render() {
        return (
            <React.Fragment />
        );
    }
}

export {Gamepad, GamePadControl, GamepadAxisNameMap, GamepadKeyNameMap}
