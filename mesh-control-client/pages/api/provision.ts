import { NextApiRequest, NextApiResponse } from "next";
import {delay} from "./utils/common"
import { updateConfig } from "./utils/updateData";
import { startProcess } from "./utils/process";
import Debug from "./utils/debug";
import { getUuidInfo, isValidRawUuid, isValidStandardUuid, rawUuidToStandard, standardUuidToRaw } from "./utils/uuid";
import { debug } from "console";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      scan_unprovisioned()
  if (request.method === 'GET') {
    let query = request.query['query'];
    let returnObj: any = {}

    if (query){
      if (typeof query == "object"){
          query.forEach(element => {
            returnObj[element] = global.DATA.PROVISION[element as keyof typeof global.DATA.PROVISION]
    });
      }
      else{
        returnObj[query] = global.DATA.PROVISION[query as keyof typeof global.DATA.PROVISION]
      }

    
    return response.status(200).json(returnObj)
     };
    
  }

  if (request.method === 'POST') {
    
    const { discovery, failback_scan_status, provision_node } = request.body;
    
    if (discovery != undefined){
      global.DATA.PROVISION.UNPROVISIONED_NODES = {}
      global.DATA.PROVISION.SCAN_ACTIVE = discovery
      if (discovery){
        Debug.log("Starting discovery", "INFO", "Provision");
        if (global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS == false){
          Debug.log("Meshctl process not running, starting for discovery", "WARNING", "Provision");
          startProcess("MESHCTL")
          await delay(500)
        }

        if (global.DATA.CONTROLLER.POWER == false){
          Debug.log("Controller power is off, turning on", "WARNING", "Provision");
          global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("power on\n")
          await delay(500)
        }
        global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("discover-unprovisioned on\n")
        global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true
      }  
      else{
        Debug.log("Stopping discovery", "INFO", "Provision");
        global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("discover-unprovisioned off\n")
        global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = false
      }
      return response.status(200).json({"status": "success", "message": `Discovery status is set to ${discovery}` });
    }
    if (provision_node != undefined){
      Debug.log(`Trying to provision node ${provision_node}`, "INFO", "Provision");
      //Debug.fakeProcess("provision", failback_scan_status)
      provision(provision_node)
      
      return response.status(201).json({
                "status": "success",
                "message": `Started provisioning for node ${provision_node}`
            });
    }

  }
}

function stop_provision(error = false){
    if (error){
      Debug.log("Stopping provision process with error!", "ERROR", "Provision");
    }
    else {
      Debug.log("Stopping provision process!", "INFO", "Provision");
    }
    global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = false
  global.DATA.PROVISION.PROCESS.STATUS = false
  global.DATA.PROVISION.PROCESS.ERROR = error
  global.DATA.PROVISION.PROCESS.PROGRESS = 100
  global.DATA.PROVISION.UNPROVISIONED_NODES = {}
  updateConfig()
}

async function update_provision(){

    let i = 0
    const maxAttemps = 100
    global.DATA.PROVISION.PROCESS.PROGRESS = 0
    while (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter(str => str.includes("Composition data for node")).length < 1){
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter(str => str.includes("Failed to connect")).length >= 1){
        Debug.log("Got 'Failed to connect' for provisioning..", "ERROR", "Provision");
        global.DATA.PROVISION.PROCESS.LOGS.push("Got 'Failed to connect' for provisioning!")
        stop_provision(true)
        return  
      }
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter(str => str.includes("Could not find device proxy")).length >= 1){
        Debug.log("Got 'Could not find device proxy' for provisioning..", "ERROR", "Provision");
        global.DATA.PROVISION.PROCESS.LOGS.push("Got 'Could not find device proxy' for provisioning!")
        stop_provision(true)
        return  
      }
      global.DATA.PROVISION.PROCESS.LOGS = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT
      await delay(500)
      i++;
      global.DATA.PROVISION.PROCESS.PROGRESS = i
      if (i > maxAttemps){
        Debug.log("Got time limit for provisioning..", "ERROR", "Provision");
        global.DATA.PROVISION.PROCESS.LOGS.push("Got time limit for provisioning!")
        stop_provision(true)
        return
      }
    
  }
  Debug.log("Provisioned node!", "INFO", "Provision");
  await delay(500)
  global.DATA.PROVISION.PROCESS.LOGS = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT
  global.DATA.PROVISION.PROCESS.LOGS.push("Succesfully provisioned node!")
  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("disconnect\n")
  stop_provision()
}

async function provision(node: string){
  if (global.DATA.PROVISION.PROCESS.STATUS){
    Debug.log("Already provisioning, returning..", "ERROR", "Provision");
    return
  }
  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("discover-unprovisioned off\n")
  global.DATA.PROVISION.SCAN_ACTIVE = false

  global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true
  global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []

  global.DATA.PROVISION.PROCESS.STATUS = true
  global.DATA.PROVISION.PROCESS.ERROR = false
  global.DATA.PROVISION.PROCESS.START_TIME = new Date().getUTCDate()

  await delay(500)
  
  global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write(`provision ${standardUuidToRaw(node)}\n`)

  update_provision()

}

function scan_unprovisioned(){
  if (global.DATA.PROVISION.SCAN_ACTIVE){
    let UUID, OOB;
    let name = "";
    let address = ""
    for (let i = 0; i < global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.length; i++){
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].includes("OOB")){
        Debug.log("Found node! (without name and address)", "INFO", "Provision");
        let data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i-1].split(" ")
        UUID = UUID = data[data.length-1]
        data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].split(" ")
        OOB = data[data.length-1]
        if (isValidRawUuid(UUID)){
          UUID = rawUuidToStandard(UUID)
        }
        else{
          Debug.log("Invalid UUID for node, skipping..", "WARNING", "Provision");
          continue
        }
        global.DATA.PROVISION.UNPROVISIONED_NODES[UUID as keyof typeof global.DATA.PROVISION.UNPROVISIONED_NODES] = {
                "name": UUID,
                "OOB": OOB,
                "address": address
    }      
      }
      
      if (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].includes("NEW")){
        Debug.log("Found node!", "INFO", "Provision");
        let data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i-2].split(" ")
        UUID = data[data.length-1]
        data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i-1].split(" ")
        OOB = data[data.length-1]
        data = global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT[i].split(" ")
        const deviceIndex = data.indexOf("Device")
        address = data[deviceIndex+1]
        for (let i = deviceIndex+2; i < data.length; i++){
          if (i == data.length){
            name += `${data[i]}`
          }
          else{
            name += `${data[i]} `
          }
          
        }
        if (isValidRawUuid(UUID)){
          UUID = rawUuidToStandard(UUID)
        }
        else{
          Debug.log("Invalid UUID for node, skipping..", "WARNING", "Provision");
          continue
        }
        global.DATA.PROVISION.UNPROVISIONED_NODES[UUID as keyof typeof global.DATA.PROVISION.UNPROVISIONED_NODES] = {
                "name": name,
                "OOB": OOB,
                "address": address
    }
        Debug.log(`Added node ${name} (${address}) to nodes list!`, "INFO", "Provision");
        global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = []
      }
    }
  }
}