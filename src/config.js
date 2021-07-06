const paramActions = ["setBool", "unsetBool", "setAxis", "clear", "inc", "dec", "max", "min", "setDefault"];

const gaitParamSettings = {
    // types: b for bool, i for int, f for float
    nb: {
        start: {default: 0, clear: 0, prefix: "start", type: "b"},
        stop:  {default: 0, clear: 0, prefix: "stop",  type: "b"},
        gaitMode : {default: 1, max: 3, min: 1, clear:1, delta:1, prefix: "gait_mode", type: "i"},
        stepHeight: { default: 0.08, max: 0.20, min: 0.00, clear: 0.08, delta: 0.01, prefix: "step_height", type: "f" },
        trotVelocity: { default: 0.00, max: 1.20, min: -1.20, clear: 0.00, delta: 0.3, prefix: "trot_vel", type: "f" },
        sideVelocity: { default: 0.00, max: 1.20, min: -1.20, clear: 0.00, delta: 0.3, prefix: "side_vel", type: "f" },
        duty: { default: 0.55, max: 0.70, min: 0.25, clear: 0.55, delta: 0.02, prefix: "duty", type: "f" },
    },
    tt: {
        start: {default: 0, clear: 0, prefix: "start", type: "b"},
        stop:  {default: 0, clear: 0, prefix: "stop",  type: "b"},
        stepHeight: { default: 0.12, max: 0.25, min: 0.00, clear: 0.12, delta: 0.015, prefix: "step_height", type: "f"},
        trotVelocity: { default: 0.00, max: 1.20, min: -1.20, clear: 0.00, delta: 0.20, prefix: "trot_vel", type: "f"},
        sideVelocity: { default: 0.00, max: 0.30, min: -0.30, clear: 0.00, delta: 0.15, prefix: "side_vel", type: "f"},
        turnRate: { default: 0.00, max: 0.50, min: -0.50, clear: 0.00, delta: 0.05, prefix: "turn_rate", type: "f"},
        load : {default: 9, max: 30, min: 0, clear: 0, delta: 2, prefix: "load", type: "i"},
        period : {default: 0.7, max: 1.5, min: 0.3, clear: 0.7, delta: 0.1, prefix: "period", type: "f"}
    }

};

const gaitParamModifyRule = {
    nb: {
        paramEntry: "nbParam",
        keyMap: {
            // single action 
            "A": { action: "dec", param: "stepHeight" },
            "B": { action: "inc", param: "stepHeight" },
            "X": { action: "dec", param: "duty" },
            "Y": { action: "inc", param: "duty" },
            "TLS": { action: "clear", param: "stepHeight" },

            // a list of actions to modify multiple params
            "START": [{ action: "setBool", param: "start" },
                      { action: "unsetBool", param: "stop" }],

            "SELECT" : [{action: "unsetBool", param: "start"},
                        {action: "setBool", param: "stop"}]
        },
        axisMap: {
            "LV": { action: "setAxis", param: "trotVelocity", valueMap: (x) => (-2.0 * x) },
            "LH": { action: "setAxis", param: "sideVelocity", valueMap: (x) => (-2.0 * x) },
        }
    },
    tt: {
        paramEntry: "ttParam",
        keyMap: {
            "X": { action: "dec", param: "stepHeight" },
            "Y": { action: "inc", param: "stepHeight" },
            "A": { action: "dec", param: "load" },
            "B": { action: "inc", param: "load" },
            "LSP": { action: "dec", param: "period" },
            "RSP": { action: "inc", param: "period" },
            "BLS" : { action: "dec", param: "sideVelocity"},
            "BRS" : { action: "inc", param: "sideVelocity"},

            "START": [{ action: "setBool", param: "start" },
                      { action: "unsetBool", param: "stop" }],

            "SELECT" : [{action: "unsetBool", param: "start"},
                        {action: "setBool", param: "stop"}]
        },
        axisMap: {
            "LV": { action: "setAxis", param: "trotVelocity", valueMap: (x) => (0.4*Math.round((-1.2 * x)/0.4)) },
            "RH": { action: "setAxis", param: "turnRate", valueMap: (x) => (0.1*Math.round((-0.5 * x)/0.1)) },
        }
    },
};

export {paramActions, gaitParamModifyRule, gaitParamSettings};