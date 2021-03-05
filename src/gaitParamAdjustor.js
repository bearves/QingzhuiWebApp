import { GamepadAxisNameMap, GamepadKeyNameMap } from "./gamePad.js";
import { paramActions, gaitParamModifyRule, gaitParamSettings } from "./config.js"

class GaitParamAdjustor {

    constructor() {
        this.paramActions = paramActions;
        this.gaitParamSettings = gaitParamSettings;
        this.gaitParamModifyRule = gaitParamModifyRule;

        this.gaitParam = {};
        this.setDefaultParam();
    }

    setDefaultParam() {
        for (let gaitName in this.gaitParamSettings) {
            const paramSetting = this.gaitParamSettings[gaitName];
            const paramEntryName = this.gaitParamModifyRule[gaitName].paramEntry;
            if (!(paramEntryName in this.gaitParam)) {
                this.gaitParam[paramEntryName] = {};
            }
            for (let paramName in paramSetting) {
                this.gaitParam[paramEntryName][paramName] = paramSetting[paramName].default;
            }
        }
        console.log(this.gaitParam);
    }

    getCurrentParam() {
        return this.gaitParam;
    }

    processGamepadEvent(evt, robotData) {
        if (!robotData["ROBOT_STATE"] || 
            !robotData["ROBOT_STATE"]["gait_name"]) {
            return;
        }
            
        const gaitName = robotData["ROBOT_STATE"]["gait_name"]
        if (gaitName in this.gaitParamModifyRule) {

            const rule = this.gaitParamModifyRule[gaitName];
            let newParam = { ...this.gaitParam };
            let targetParam = newParam[rule.paramEntry];

            if (evt.type === "ButtonPressed") {
                let key = GamepadKeyNameMap[evt.buttonID];
                if (key && key in rule.keyMap) {
                    let keyActionSet = rule.keyMap[key];
                    if (Array.isArray(keyActionSet)) {
                        keyActionSet.forEach((actionSet) => {
                            this.doKeyAction(
                                actionSet,
                                targetParam,
                                this.gaitParamSettings[gaitName]
                            );
                        });
                    }
                    else {
                        this.doKeyAction(
                            keyActionSet,
                            targetParam,
                            this.gaitParamSettings[gaitName]
                        );
                    }
                }
            }
            else if (evt.type === "AxisChanged") {
                // Modify all axis-linked param since these axes 
                // can be changing all together
                for (let j in GamepadAxisNameMap) {
                    let axis = GamepadAxisNameMap[j];
                    if (axis in rule.axisMap) {
                        let axisActionSet = rule.axisMap[axis];
                        if (Array.isArray(axisActionSet)) {
                            axisActionSet.forEach((actionSet) => {
                                this.doAxisAction(
                                    actionSet,
                                    targetParam,
                                    evt.axisValue[j],
                                    this.gaitParamSettings[gaitName]
                                );
                            });
                        }
                        else {
                            this.doAxisAction(
                                axisActionSet,
                                targetParam,
                                evt.axisValue[j],
                                this.gaitParamSettings[gaitName]
                            );
                        }
                    }
                }
            }
            this.gaitParam = newParam;
        }
    }

    doKeyAction(actionSet, param, paramSettings) {
        const action = actionSet.action;
        const entry = actionSet.param;

        if (!(entry in param) || !(entry in paramSettings)) {
            return;
        }
        let settings = paramSettings[entry];

        switch(action) {
            case "setBool" :
                param[entry] = 1;
                break;
            case "unsetBool" :
                param[entry] = 0;
                break;
            case "dec" :
                param[entry] -= settings.delta;
                break;
            case "inc" :
                param[entry] += settings.delta;
                break;
            case "clear" :
                param[entry] = settings.clear;
                break;
            case "max" :
                param[entry] = settings.max;
                break;
            case "min" :
                param[entry] = settings.min;
                break;
            case "setDefault" :
                param[entry] = settings.default;
                break;
            default:
                break;
        }
        if (param[entry] < settings.min)
            param[entry] = settings.min;
        if (param[entry] > settings.max)
            param[entry] = settings.max;
    }

    doAxisAction(actionSet, param, axisValue, paramSettings) {
        const action = actionSet.action;

        // axis adjusting only support set action
        if (action !== "setAxis") {
            return;
        }

        const entry = actionSet.param;
        let valueMap = actionSet.valueMap;

        if (!(entry in param) || !(entry in paramSettings)) {
            return;
        }
        let settings = paramSettings[entry];

        param[entry] = valueMap(axisValue);

        if (param[entry] < settings.min)
            param[entry] = settings.min;
        if (param[entry] > settings.max)
            param[entry] = settings.max;
    }

}

export {GaitParamAdjustor};