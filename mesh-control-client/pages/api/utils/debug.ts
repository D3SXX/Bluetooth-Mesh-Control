class Debug {
    // ANSI color codes
    private static colors = {
        INFO: '\x1b[32m',    // Green
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
            default:
                console.log(msg);
        }
        }
    }
}

export default Debug;