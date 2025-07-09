import { time } from "console";
import { delay } from "./common";

class Debug {
    // ANSI color codes
    private static colors = {
        INFO: '\x1b[38;5;2m',    // Dark green
        SUCCESS: '\x1b[32m', // Green
        ERROR: '\x1b[31m',   // Red  
        WARNING: '\x1b[33m', // Yellow 
        RESET: '\x1b[0m'     // Default text color
    };

    static log(message: string, type: string = "INFO", from: string = "Unknown") {

        if (message.length <= 0){
            return
        }

        const timestamp = new Date().toLocaleTimeString();
        const colorCode = this.colors[type as keyof typeof this.colors] || this.colors.INFO;
        const resetCode = this.colors.RESET;
        
        const msg = `${timestamp} - [${colorCode}${type}${resetCode}] - [${from}] - ${message}`;
        const plainMsg = `${timestamp} - [${type}] - [${from}] - ${message}`;
        
        if (global.DATA.SERVER.LOGS_SETTINGS.ENABLE_LOGS){
            if (global.DATA.SERVER.LOGS.length >= global.DATA.SERVER.LOGS_SETTINGS.LOGS_LIMIT){
                global.DATA.SERVER.LOGS.splice(0, global.DATA.SERVER.LOGS.length+1 - global.DATA.SERVER.LOGS_SETTINGS.LOGS_LIMIT);
            }
            global.DATA.SERVER.LOGS.push(plainMsg);
        }
        
        if (global.DATA.SERVER.TOAST_SETTINGS.ENABLE_TOASTS){
            this.removeOldToasts()
            if (global.DATA.SERVER.TOAST_SETTINGS.SHOW_DATA[type]){
            global.DATA.SERVER.TOASTS.push({
                ADD_TIME: new Date().toISOString(),
                TYPE: type,
                FROM: from,
                TEXT: message
            })
            }
        }
        if (global.DATA.SERVER.LOGS_SETTINGS.ENABLE_CONSOLE_LOGS){
        switch (type) {
            case "INFO":
                console.log(msg);
                break;
            case "ERROR":
                console.error(msg);
                break;
            case "WARNING":
                console.warn(msg);
                break;
            case "SUCCESS":
                console.log(msg);
                break;
            default:
                console.log(msg);
        }
        }
    }
    static removeOldToasts(){
        for (let i = 0; i < global.DATA.SERVER.TOASTS.length; i++){
            if (new Date().getTime() - new Date(global.DATA.SERVER.TOASTS[i].ADD_TIME).getTime() > global.DATA.SERVER.TOAST_SETTINGS.TIMEOUT){
                global.DATA.SERVER.TOASTS.splice(i, 1);
            }
        }
    }
    static async fakeProcess(type: string, fail: boolean = false){
        // Use only for debugging
        async function stop_provision(error = false){
            if (error){
              Debug.log("Stopping provision process with error!", "ERROR", "Provision");
            }
            else {
              Debug.log("Stopping provision process!", "INFO", "Provision");
            }
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: disabling lock")
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: stopping process")
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: Marking process error as " + error)
            global.DATA.PROVISION.PROCESS.ERROR = error
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: setting progress to 100%")
            global.DATA.PROVISION.PROCESS.PROGRESS = 100
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: setting status to false")
            global.DATA.PROVISION.PROCESS.STATUS = false
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: clearing unprovisioned nodes")
            await delay(1000)
            global.DATA.PROVISION.UNPROVISIONED_NODES = {}
            await delay(1000)
            global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: Done stopping process")
        }
            switch (type){
                case "provision":
                    global.DATA.PROVISION.SCAN_ACTIVE = false

                    global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true
                    global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []
                  
                    global.DATA.PROVISION.PROCESS.STATUS = true
                    global.DATA.PROVISION.PROCESS.ERROR = false
                    global.DATA.PROVISION.PROCESS.START_TIME = new Date().getUTCDate()
                    global.DATA.PROVISION.PROCESS.PROGRESS = 0
                    global.DATA.PROVISION.PROCESS.LOGS = []

                    global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning started")
                    await delay(200)
                    if (fail){
                        global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning: simulating failure")
                        await delay(500)
                        await stop_provision(true)
                        return
                    }
                    for (let i = 0; i < 100; i+=10){
                        global.DATA.PROVISION.PROCESS.PROGRESS = i
                        global.DATA.PROVISION.PROCESS.LOGS.push("Fake provisioning progress: " + i + "%")
                        await delay(200)
                    }
                    await delay(200)
                    await stop_provision(false)
                    break
            }
    }
}

export default Debug;