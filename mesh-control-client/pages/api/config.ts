import { GlobalStyles } from "@mui/material";
import { NextApiRequest, NextApiResponse } from "next";

import {getNodes, loadConfig} from "./utils/readProvdb"
import {init} from "./utils/initData"
import { NodeConfig } from "../../app/interfaces/server"
import { Global } from "@emotion/react";
import { runCommmand } from "./utils/runCommand";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Initialize data if not initialized
      if (global["DATA"] === undefined){
        global.DATA = await init()
      }
      
    if ((global["DATA"] as any)["SERVER"]["ERROR"]["STATUS"] === false){
        update_config()
    }


  if (request.method === 'GET') {
    let query = request.query['query'];
    
    if (query){
    
    return response.status(200).json({ [query]: global.DATA.CONFIG[query] });
    }
    return response.status(200).json({ "MESSAGE":"config control backend api" });
  }

  if (request.method === 'POST') {
    const { STATUS } = request.body;

  }
}

function update_config(){

  // Get data from provdb

  const obj: NodeConfig | undefined = getNodes()
  if (obj){
    global.DATA.CONFIG.NODES = obj.nodes
    global.DATA.KEYS.APPKEYS = obj.appKeys
    global.DATA.KEYS.NETKEYS = obj.netKeys
  }

  // Get version from meshctl

  const versionData = runCommmand(["version"])
  const versionArr = versionData.split("\n")

  global.DATA.SERVER.MESHCTL = versionArr[1].split(" ")[1]
  
  // Get security level from the main meshctl terminal session

  if (global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS === true){
    global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []
    
    const securityLevel = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT
    global.DATA.CONFIG.SECURITY_LEVEL = securityLevel[0]
  }

  if (global.DATA.TERMINAL_SESSIONS.CONFIG.STATUS === true){
    const config = global.DATA.TERMINAL_SESSIONS.CONFIG.OUTPUT
    global.DATA.CONFIG.CONFIG = config
  }

  if (global.DATA.TERMINAL_SESSIONS.CONFIG.STATUS === true){
    const config = runCommmand(["config"])
    global.DATA.CONFIG.CONFIG = config
  }
}