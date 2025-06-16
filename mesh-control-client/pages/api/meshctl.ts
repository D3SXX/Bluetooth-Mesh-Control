import { NextApiRequest, NextApiResponse } from "next";
import { startProcess, stopProcess } from "./utils/process";

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
      return response.status(200).json({ "server":global.DATA.SERVER, "controller": global.DATA.CONTROLLER, "provision": global.DATA.PROVISION, "config": global.DATA.CONFIG,"keys": global.DATA.KEYS, "terminal_sessions": global.DATA.TERMINAL_SESSIONS,
            "COMPANY_IDENTIFIERS": global.DATA.COMPANY_IDENTIFIERS,
    "MMDL_MODEL_UUIDS": global.DATA.MMDL_MODEL_UUIDS,
    "MESH_MODEL_UUIDS": global.DATA.MESH_MODEL_UUIDS,
       });
    }
    
  }
  else if (request.method === 'POST') {
    const { status } = request.body;

    if (status != undefined){
      console.log(`Trying to ${status ? "start meshctl" : "stop meshctl"}`)
      if (status === true){
            startProcess("MESHCTL")
      }
      else{
        stopProcess("MESHCTL")
      }
      return response.status(200).json({ status: global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS });
    }
    return response.status(200).end();
  }
    else if (request.method === 'OPTIONS') {
      return response.status(200).end();
  }
}

