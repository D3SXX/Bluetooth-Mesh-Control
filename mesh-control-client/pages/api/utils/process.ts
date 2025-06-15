import {spawn} from "child_process"

export function startProcess(type: string){

    if (global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS === true){
        return
    }
    const process = spawn("meshctl")

    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].OUTPUT = []

    process.stdout.on("data", (data) => {
        global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].OUTPUT.push(data)
    })

    process.stderr.on("data", (data) => {
        global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].OUTPUT.push(data)
    })

    process.on("close", () => {
        global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS = false
    })

    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS = process
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS_PID = process.pid
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS = true
}

export function stopProcess(type: string){
    
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS.stdin.write("exit\n")

    if (global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS === false){
        return
    }
    console.log(`Killing process ${global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS_PID}`)
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS.kill("SIGINT")
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS_PID = null
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS = false
}
