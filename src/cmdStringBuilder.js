import { gaitParamModifyRule, gaitParamSettings } from "./config.js";

class CmdStringBuilder {

    actionHandler(cmdTag, param, robotData) {

        let needSend = true;
        let info = "";
        let cmdString = "";

        if (cmdTag === "jogm") {
            cmdString = "jog -m=" + param.id + " -v=" + param.vel + " -q=" + (param.start?0:1);
        }
        else if (cmdTag === "jogG") {
            cmdString = "jog -" + param.group.toUpperCase() + " -v=" + param.vel + " -q=" + (param.start?0:1);
        }
        else if (cmdTag === "hm") {
            if (param.group === "k"){
                cmdString = "fake_home";
            }
            else {
                cmdString = ("hm -" + param.group.toUpperCase());
            }
        }
        else if (cmdTag === "hmsw") {
            cmdString = ("hmsw -" + param.group.toUpperCase());
        }
        else if (cmdTag === "cq") {
            cmdString = "cq";
        }
        else if (cmdTag === "start") {
            cmdString = "start";
        }
        else if (cmdTag === "exit") {
            cmdString = "exit";
        }
        else if (cmdTag === "en") {
            cmdString = "en";
        }
        else if (cmdTag === "ds") {
            cmdString = "ds";
        }
        else if (cmdTag === "zrt") {
            cmdString = "zrt";
        }
        else if (cmdTag === "rc") {
            cmdString = "rc --hard=1";
        }
        else if (cmdTag === "tt") {
            cmdString = "tt";
        }
        else if (cmdTag === "wktd") {
            cmdString = "wktd";
        }
        else if (cmdTag === "ski") {
            cmdString = "ski";
        }
        else if (cmdTag === "nb") {
            cmdString = "nb";
        }
        else if (cmdTag === "online_gait_ctrl") {
            const [isOnlineGait, gaitName] = 
                this.getGaitNameIfOnline(robotData);

            if (isOnlineGait) {
                [needSend, cmdString, info] =
                    this.buildOnlineGaitCmd(gaitName, param);
            }
            else {
                needSend = false;
                info = "No custom gait is running";
            }
        }
        else if (cmdTag === "quit") {
            const [isOnlineGait, gaitName] = 
                this.getGaitNameIfOnline(robotData);

            if (isOnlineGait) {
                cmdString = gaitName + " --online --quit=1";
            }
            else {
                needSend = false;
                info = "No custom gait is running";
            }
        }
        else if (cmdTag === "general") {
            cmdString = param.cmdString;
        }
        else {
            info = "Unknown cmd tag: " + cmdTag;
            needSend = false;
        }

        return {needSend : needSend, cmdString : cmdString, info : info};
    }

    // return [needSend, cmdString, info]
    buildOnlineGaitCmd(gaitName, paramStates) {
        let cmdString = "";

        if (gaitName in gaitParamModifyRule && gaitName in gaitParamSettings) {
            const entryName = gaitParamModifyRule[gaitName].paramEntry;
            if (entryName in paramStates) {

                // format all param values to cmd string
                const paramValues = paramStates[entryName];
                const cmdParamList = Object.keys(gaitParamSettings[gaitName]).map(
                    (k) => {
                        const prefix = gaitParamSettings[gaitName][k].prefix;
                        const paramType = gaitParamSettings[gaitName][k].type; 
                        let value = "";
                        switch (paramType) {
                            case "b": 
                            case "i":
                                value = paramValues[k].toFixed(0);
                                break;
                            case "f":
                            default:
                                value = paramValues[k].toFixed(3);
                                break;
                        }
                        return `--${prefix}=${value}`;
                    }
                );
                cmdString = gaitName + " --online " + (cmdParamList.join(" "));
                return [true, cmdString, ""];
            }
        }
        return [false, "", "No rule for controling this gait"];
    }

    getGaitNameIfOnline(robotData) {
        if (!robotData["ROBOT_STATE"]) {
            return [false, null];
        }
        else {
            const gaitName = robotData["ROBOT_STATE"]["gait_name"];
            if (gaitName && gaitName !== "none" && gaitName !== "no") {
                    return [true, gaitName];
            }
            else {
                return [false, null];
            }
        }
    }
}

export {CmdStringBuilder}