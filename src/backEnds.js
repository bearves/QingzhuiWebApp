import { webSocketClient } from './webSockClient.mjs'
import { CmdStringBuilder } from "./cmdStringBuilder.js"
import { Gamepad } from "./gamePad.js"
import { GaitParamAdjustor } from "./gaitParamAdjustor.js";

// Manage all resources for device io and communications
// e.g. Gamepads, Websockets to remote server, Audio inputs, etc.
class BackEnds {
    constructor() {
        this.gaitParamAdjustor = new GaitParamAdjustor();
        this.cmdStringBuilder = new CmdStringBuilder();
        this.gamepad = new Gamepad();
        this.webSocketClt = new webSocketClient(`wss://${window.location.hostname}/ws`);
        this.webSocketClt.init();
    }
}

let backendInstance = new BackEnds();

export {backendInstance};