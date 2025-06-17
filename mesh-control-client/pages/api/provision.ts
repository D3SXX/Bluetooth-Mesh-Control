import { GlobalStyles } from "@mui/material";
import { NextApiRequest, NextApiResponse } from "next";

import {getNodes, loadConfig} from "./utils/readProvdb"
import {init} from "./utils/initData"
import { NodeConfig } from "../../app/interfaces/server"
import { Global } from "@emotion/react";


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Initialize data if not initialized
      if (global["DATA"] === undefined){
        global.DATA = await init()
      }
      scan_unprovisioned()
  if (request.method === 'GET') {
    let query = request.query['query'];
    let returnObj = {}

    if (query){
      if (typeof query == "object"){
          query.forEach(element => {
            returnObj[element] = global.DATA.PROVISION[element]
    });
      }
      else{
        returnObj[query] = global.DATA.PROVISION[query]
      }

    
    return response.status(200).json(returnObj)
     };
    
  }

  if (request.method === 'POST') {
    console.log(request.body)
    const { discovery, failback_scan_status, provision_node } = request.body;
    if (discovery != undefined){
      // Commented for debug purposes
      global.DATA.PROVISION.UNPROVISIONED_NODES = {}
      global.DATA.PROVISION.SCAN_ACTIVE = discovery
      if (discovery){
        global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("discover-unprovisioned on\n")
        global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true
      }
      else{
        global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("discover-unprovisioned off\n")
        global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = false
      }
      return response.status(200).json({"status": "success", "message": `Discovery status is set to ${discovery}` });
    }
    if (provision_node != undefined){
      console.log(`Trying to provision node ${provision_node}`);
      provision(provision_node)
      
      
      return response.status(201).json({
                "status": "success",
                "message": `Started provisioning for node ${provision_node}`
            });
    }


  }
}

function stop_provision(error = false){
    console.log("Stopping provision process, error = " + error)
    global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = false
  global.DATA.PROVISION.PROCESS.STATUS = false
  global.DATA.PROVISION.PROCESS.ERROR = error
  global.DATA.PROVISION.PROCESS.PROGRESS = 100

}

async function update_provision(){

    let i = 0
    const maxAttemps = 100
    global.DATA.PROVISION.PROCESS.PROGRESS = 0
    while (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter(str => str.includes("Composition data for node")).length < 1){
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter(str => str.includes("Services resolved no")).length >= 1){
        console.log("Got 'services resolved no' for provisioning..")
        global.DATA.PROVISION.PROCESS.LOGS.push("Got 'services resolved no' for provisioning!")
        stop_provision(true)
        return  
      }
      global.DATA.PROVISION.PROCESS.LOGS = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT
      await delay(500)
      i++;
      global.DATA.PROVISION.PROCESS.PROGRESS = i
      if (i > maxAttemps){
        console.log("Got time limit for provisioning..")
        global.DATA.PROVISION.PROCESS.LOGS.push("Got time limit for provisioning!")
        stop_provision(true)
        return
      }
    
  }
  console.log("Provisioned node!")
  await delay(500)
  global.DATA.PROVISION.PROCESS.LOGS = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT
  global.DATA.PROVISION.PROCESS.LOGS.push("Succesfully provisioned node!")
  global.DATA.PROVISION.PROCESS.LOGS = global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("disconnect\n")
  stop_provision()
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function provision(node: string){
  if (global.DATA.PROVISION.PROCESS.STATUS){
    console.log("Already provisioning, returning..")
    return
  }
  if (global.DATA.PROVISION.SCAN_ACTIVE){
    global.DATA.PROVISION.SCAN_ACTIVE = false
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("discover-unprovisioned off\n")   
  }
  if (global.DATA.CONTROLLER.POWER == false){
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write("power on\n")
  }
  global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true
  global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []

  global.DATA.PROVISION.PROCESS.STATUS = true
  global.DATA.PROVISION.PROCESS.ERROR = false
  global.DATA.PROVISION.PROCESS.START_TIME = new Date().getUTCDate()

  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write(`provision ${node}\n`)

  update_provision()

}

function scan_unprovisioned(){
  if (global.DATA.PROVISION.SCAN_ACTIVE){
    let UUID, OOB;
    let name = "";
    let address = ""
    for (let i = 0; i < global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.length; i++){
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].includes("OOB")){
        console.log("Found node! (without name and address)")
        let data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i-1].split(" ")
        UUID = UUID = data[data.length-1]
        data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].split(" ")
        OOB = data[data.length-1]
        global.DATA.PROVISION.UNPROVISIONED_NODES[UUID] = {
                "name": UUID,
                "OOB": OOB,
                "address": address
    }      
      }
      
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].includes("NEW")){
        console.log("Found node!")
        let data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i-2].split(" ")
        UUID = data[data.length-1]
        data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i-1].split(" ")
        OOB = data[data.length-1]
        data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].split(" ")
        const deviceIndex = data.indexOf("Device")
        address = data[deviceIndex+1]
        console.log(data)
        for (let i = deviceIndex+2; i < data.length; i++){
          if (i == data.length){
            name += `${data[i]}`
          }
          else{
            name += `${data[i]} `
          }
          
        }
        global.DATA.PROVISION.UNPROVISIONED_NODES[UUID] = {
                "name": name,
                "OOB": OOB,
                "address": address
    }
        console.log(global.DATA.PROVISION.UNPROVISIONED_NODES)
        console.log(UUID, OOB, name, address)
        global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []
      }
    }
    

  }
  else{
    
  }

}