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
        await update_config()
    }


  if (request.method === 'GET') {
    let query = request.query['query'];
    
    if (query){
    
    return response.status(200).json({ [query]: global.DATA.CONFIG[query] });
    }
    return response.status(200).json({ "MESSAGE":"config control backend api" });
  }

  if (request.method === 'POST') {
    const { setupData } = request.body;

    const commandListBind = [`appkey-add ${setupData["bind"]["appKeyIndex"]}`, `bind ${setupData["bind"]["unicastAddress"]["index"]} ${setupData["bind"]["appKeyIndex"]} ${setupData["bind"]["model"]["value"]}`]
    const waitListBind = [false, "Model App"]
    const commandListPublish = [`appkey-add ${setupData["publish"]["appKeyIndex"]}`,
                                  `pub-set ${setupData["publish"]["unicastAddress"]["value"]} ${setupData["publish"]["address"]["value"]} ${setupData["publish"]["appKeyIndex"]} ${hex((setupData["publish"]["publicationPeriod"]["step"] << 2) | setupData["publish"]["publicationPeriod"]["res"])} ${hex((setupData["publish"]["retransmitionCount"]["cnt"] << 3) | setupData["publish"]["retransmitionCount"]["per"])} ${setupData["publish"]["model"]["value"]}`]
    const waitListPublish = [false, "Publication"]
    const commandListSubscribe = [`appkey-add ${setupData["subscribe"]["appKeyIndex"]}`,
                                    `sub-add ${setupData["subscribe"]["unicastAddress"]["value"]} ${setupData["subscribe"]["address"]["value"]} ${setupData["subscribe"]["model"]["value"]}`]
    const waitListSubscribe = [false, "Subscription"]

    const commandQueue = []
    const addressQueue = []
    const waitList = []

    if (setupData.bind.saved){
      commandQueue.push(commandListBind)
      waitList.push(waitListBind)
      addressQueue.push(setupData.bind.unicastAddress.value)
    }
    if (setupData.publish.saved){
      commandQueue.push(commandListPublish)
      waitList.push(waitListPublish)
      addressQueue.push(setupData.publish.unicastAddress.value)
    }
    if (setupData.subscrive.saved){
      commandQueue.push(commandListSubscribe)
      waitList.push(waitListSubscribe)
      addressQueue.push(setupData.subscribe.unicastAddress.value)
    }

  }
}

async function configureMesh(addressQueue, commandQueue, waitList){
  function stopProcess(error = false){
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("\nback\ndisconnect\n")
    global.DATA.CONFIG.PROCESS.PROGRESS = 100
    global.DATA.CONFIG.PROCESS.ERROR = error
    global.DATA.CONFIG.PROCESS.STATUS = false
    global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = false
  }
  if (global.DATA.CONFIG.PROCESS.STATUS = true){
    return;
  }
  const progressMax = 100
  const progressIncrement = 100.0 / (commandQueue.length + 1)

    global.DATA.CONFIG.PROCESS.PROGRESS = 0
    global.DATA.CONFIG.PROCESS.ERROR = false
    global.DATA.CONFIG.PROCESS.STATUS = true
    global.DATA.CONFIG.PROCESS.LOGS = []
    global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true

    global.DATA.CONFIG.PROCESS.LOGS.push("Trying to connect to the mesh network (3 attempts)")

    let attempts = 0

    while (attempts < 3){
      
      global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("\nback\ndisconnect\n")
      await delay(100)

      global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("connect\n")

      let i = 0
      while (global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.OUTPUT.filter(str => str.includes("Mesh session is open")).length < 1 ){
        if (global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.OUTPUT.filter(str => str.includes("Failed to start discovery")).length >= 1){
          stopProcess(true)
        }
        await delay(50)
        i++
        if (i >= 50){
          break
        }
      }
      if (i >= 50){
      attempts++
      }
      else{
        break
      }
    }
    if (attempts >= 3){
      stopProcess(true)
    }

    global.DATA.CONFIG.PROCESS.PROGRESS += progressIncrement




}

async function update_config(){

  // Get data from provdb

  const obj: NodeConfig | undefined = getNodes()
  if (obj){
    global.DATA.CONFIG.NODES = {
      nodes: obj.nodes,
      appKeys: obj.appKeys,
      netKeys: obj.netKeys,
    }
  }

  // Get version from meshctl

  const versionData = runCommmand(["version"])
  const versionArr = versionData.split("\n")

  global.DATA.SERVER.MESHCTL = versionArr[1].split(" ")[1]
  
  // Get security level from the main meshctl terminal session

  if (global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS === true && global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK === false){
    global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("security\n")
    while(true){
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter(str => str.includes("Provision Security Level")).length >= 1){
        break;
      }
      await delay(1000)
    }

    const securityLevelData = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.length - 2].split(" ")
    global.DATA.CONFIG.SECURITY_LEVEL = Number(securityLevelData[5])
  }

}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}