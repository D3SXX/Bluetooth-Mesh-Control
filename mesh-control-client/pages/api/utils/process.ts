import { TerminalSessions } from "@/interfaces/global";
import {spawn} from "child_process"
import Debug from "./debug";

const re = /\x1b\[[0-9;]*m/g;

export function startProcess(type: string){

    if (global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS === true){
        return
    }
    const process = spawn("meshctl")

    // Apply config to process

    process.stdin.write(`select ${global.DATA.CONTROLLER.DEFAULT}\nsecurity ${global.DATA.CONFIG.SECURITY_LEVEL}\n`)

    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].OUTPUT = []

    process.stdout.on("data", (data) => {
        data = data.toString().split("\n")
        
        data.forEach((element: string) => {
            if (global.DATA.SERVER.LOGS_SETTINGS.CAPTURE_PROCESSES){
                Debug.log(element.replace(re, ""), "INFO", "Process");
            }
            global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].OUTPUT.push(element.replace(re, ""))
        });
        
    })

    process.stderr.on("data", (data) => {
        global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].OUTPUT.push(data.toString())
    })

    process.on("close", () => {
        global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS = false
    })

    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS = process
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS_PID = process.pid
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS = true
}

export function stopProcess(type: string){
    
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS?.stdin?.write("exit\n")

    if (global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS === false){
        return
    }
    Debug.log(`Killing process ${global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS_PID}`, "INFO", "Process");
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS?.kill("SIGINT")
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].PROCESS_PID = null
    global.DATA.TERMINAL_SESSIONS[type as keyof typeof global.DATA.TERMINAL_SESSIONS].STATUS = false
}

export function updateProcessConfig(type: keyof TerminalSessions){
    global.DATA.TERMINAL_SESSIONS?.[type]?.PROCESS?.stdin?.write(`select ${global.DATA.CONTROLLER.DEFAULT}\nsecurity ${global.DATA.CONFIG.SECURITY_LEVEL}\n`)
}