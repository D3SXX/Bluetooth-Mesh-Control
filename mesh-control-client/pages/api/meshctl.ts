import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";


function startMeshctl(){

  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS = spawn('meshctl');
  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS_PID = global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.pid || null;

  console.log(`Mestctl process started with PID: ${global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS_PID}`);

  if (global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdout !== null) {
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  }
  if (global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stderr !== null) {
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stderr.on('data', (data) => {
      console.error(`${data}`);
    });
  }

  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.on('exit', (code) => {
    console.log(`Meshctl process exited with code: ${code}`);
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS = null;
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS_PID = null;
  });
};

function stopMeshctl(){
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.kill("SIGINT")
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS_PID = null;
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'GET') {
    
    let query;
    if (request){
      query = request.query['query'];
    }
    if (query){
      if (query === "STATUS"){
        return response.status(200).json({ [query]: global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS });
      }

    return response.status(200).json({ [query]: global.DATA.CONFIG[query] });
    }
    else{
      return response.status(200).json({ "server":global.DATA.SERVER, "controller": global.DATA.CONTROLLER, "provision": global.DATA.PROVISION, "config": global.DATA.CONFIG,"keys": global.DATA.KEYS, "terminal_sessions": global.DATA.TERMINAL_SESSIONS });
    }
    
  }
  else if (request.method === 'POST') {
    const { status } = request.body;

    if (status != undefined){
      console.log(`Trying to ${status ? "start meshctl" : "stop meshctl"}`)
      if (status === true){
        startMeshctl()
        global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS = true
      }
      else{
        stopMeshctl()
        global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS = false
      }
      return response.status(200).json({ status: global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS });
    }
    return response.status(200).end();
  }
    else if (request.method === 'OPTIONS') {
      return response.status(200).end();
  }
}
