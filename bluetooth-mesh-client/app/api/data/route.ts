export const dynamic = 'force-dynamic' // defaults to auto
import { ChildProcessWithoutNullStreams } from 'child_process';
import {spawn} from 'node:child_process'
import { version } from 'node:os';
let process: ChildProcessWithoutNullStreams | null =  null;
let stdOutput: string[] = [];
let collectedData = {
    local:{
        meshctlVersion:"",
        adapters:"",
        netKeys:[
            {
              "index":0,
              "keyRefresh":0
            }
          ],
        appKeys:[
            {
              "index":0,
              "boundNetKey":0
            },
            {
              "index":1,
              "boundNetKey":0
            }
          ],  
    }
    

};

export async function GET(request: string) {
    console.log(request)
    const time: String = new Date().toString();
    communicateProgram("help\n");
    return new Response(time);
}

export async function POST(request: Request) {
    const receivedText = await request.text();
    console.log("Got POST request! -> " + receivedText)
    const response = await communicateProgram(receivedText);
    console.log("POST reply sent! -> " + response)
    console.log(stdOutput)
    return new Response(response);
}

async function sendToProgram(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!process) {
            console.log("spawning process!");
            process = spawn("meshctl");

            process.stdout.on('data', (data: any) => {
                const output = data.toString();
                console.log(output);
                if(!output.includes("Waiting to connect to") && !output.includes("[meshctl]")){
                    stdOutput.push(output);
                }
            });

            process.stderr.on('data', (data: any) => {
                const errorOutput = `stderr: ${data}`;
                console.error(errorOutput);
                reject(errorOutput);
            });
        } else {
            console.log("process already spawned!");
        }

        if (command) {
            process.stdin.write(command + "\n");
            setTimeout(() => {
                resolve(stdOutput[stdOutput.length-1]);
                process.kill();
            }, 3.0*1000);
        }
    });
}

async function communicateProgram(command: string): Promise <string>{
    return new Promise(async (resolve, reject) => {
    switch(command){
        case "help\n":
            sendToProgram(command);
            break;
        case "version":
            if(!collectedData.local.meshctlVersion){
                
                const reply = await getLastData(await sendToProgram(command));
                if(!reply.includes("Version")){
                    console.log("Got wrong reply for version!");
                    resolve("");
                    return;
                }
                else{
                    collectedData.local.meshctlVersion = reply;
                }
            }
            resolve(collectedData.local.meshctlVersion);
            return;
        case "list":
            if(!collectedData.local.adapters){
                const reply = await getMultipleData(await sendToProgram(command));
                resolve("");
                return;
            }
    }
    if(!process){
        console.log("Process is not initialised!")
        reject(false);
        
    }
    
    console.log("Unknown command!")
    reject(false);
});
}

async function getLastData(str:string){
    return new Promise(async (resolve, reject) => {
    try{
        const str = stdOutput[stdOutput.length-1];
        const start = str.indexOf("\n");
        const end = str.indexOf("\n",start+1);
        console.log("getLastData" + str.slice(start+1,end))
        resolve(str.slice(start+1,end));
    }
    catch(e){reject("")}
})}

async function getMultipleData(str:string){
    return new Promise(async (resolve, reject) => {
        try{
            const str = stdOutput[stdOutput.length-1];
            let start = str.indexOf("\n");
            let arr = [];
            while(str.indexOf("\n",start+1)){
                const stringStart = start+1;
                const stringEnd = str.indexOf("\n",start+1);
                arr.push(str.slice(stringStart,stringEnd));
                start = str.indexOf("\n",start+1);
                
            }
            console.log("getMultipleData" + arr)
            resolve(arr);
        }
        catch(e){reject("")}
    })}


async function tryNTimes(command:string,n: number){
    for(let i = 0; i<n;i++){
        console.log(await sendToProgram(command));
    }
    return await getLastData();
}