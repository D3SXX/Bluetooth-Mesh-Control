import { NextApiRequest, NextApiResponse } from "next";

import { init } from "./utils/initData";
import { updateController, updateConfig } from "./utils/updateData";

import {delay} from "./utils/common"
import { SetupData } from "../../app/interfaces/client";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");


  if (request.method === "GET") {

    if (global.DATA == undefined){
      global.DATA = await init();
      updateConfig()
      updateController()
    }

    let query = request.query["query"];
    
    if (query && typeof query === "string") {
      // Ensure query is a valid key of CONFIG
      if (query in global.DATA.CONFIG) {
        return response.status(200).json({ [query]: global.DATA.CONFIG[query as keyof typeof global.DATA.CONFIG] });
      } else {
        return response.status(400).json({ error: "Invalid query parameter" });
      }
    }
    else {
      return response.status(200).json({
        "server": global.DATA.SERVER, "controller": global.DATA.CONTROLLER, "provision": global.DATA.PROVISION, "config": global.DATA.CONFIG, "keys": global.DATA.KEYS, "terminal_sessions": global.DATA.TERMINAL_SESSIONS,
        "COMPANY_IDENTIFIERS": global.DATA.COMPANY_IDENTIFIERS,
        "MMDL_MODEL_UUIDS": global.DATA.MMDL_MODEL_UUIDS,
        "MESH_MODEL_UUIDS": global.DATA.MESH_MODEL_UUIDS,
      });
    }
  }

  if (request.method === "POST") {
    const { setupData }: { setupData: SetupData["setupData"] } = request.body;

    if (setupData) {

      const {bind, publish, subscribe, identity, beacon, heartbeat_publish, heartbeat_subscribe, relay, proxy, ttl} = setupData;
      const commandQueue = [];
      const addressQueue = [];
      const waitList = [];

      if (bind && bind.saved) {
        commandQueue.push([
          `appkey-add ${bind.appKeyIndex}`,
          `bind ${bind.unicastAddress.index} ${bind.appKeyIndex} ${bind.model.value}`,
        ]);
        waitList.push(["AppKey status Success", "Model App"]);
        addressQueue.push(bind.unicastAddress.value);
      }
      if (publish && publish.saved) {
        commandQueue.push([
          `appkey-add ${publish.appKeyIndex}`,
          `pub-set ${publish.unicastAddress.value} ${
            publish.address.value
          } ${publish.appKeyIndex} ${
            (publish.publicationPeriod.step << 2) |
            publish.publicationPeriod.res
          } ${
            (publish.retransmitionCount.cnt << 3) |
            publish.retransmitionCount.per
          } ${publish.model.value}`,
        ]);
        waitList.push(["AppKey status Success", "Publication"]);
        addressQueue.push(publish.unicastAddress.value);
      }
      if (subscribe && subscribe.saved) {
        commandQueue.push([
          `appkey-add ${subscribe.appKeyIndex}`,
          `sub-add ${subscribe.unicastAddress.value} ${subscribe.address.value} ${subscribe.model.value}`,
        ]);
        waitList.push(["AppKey status Success", "Subscription"]);
        addressQueue.push(subscribe.unicastAddress.value);
      }
      if (identity && identity.saved) {
        commandQueue.push([
          `ident-set ${identity.netKeyIndex} 0x0${identity.state}`,
        ]);
        waitList.push([`Identity state`]);
        addressQueue.push(identity.unicastAddress.value);
      }
      if (beacon && beacon.saved) {
        commandQueue.push([
          `beacon-set ${beacon.unicastAddress.value} ${beacon.state}`,
        ]);
        waitList.push([`Config Beacon Status`]);
        addressQueue.push(beacon.unicastAddress.value);
      }
      if (heartbeat_publish && heartbeat_publish.saved) {
        
        // TODO: Check conversions from specifications

        commandQueue.push([
          `hb-pub-set ${parseInt(heartbeat_publish.address.value).toString(16)} ${parseInt(heartbeat_publish.retransmitCount.value.toString(16))} ${parseInt(Number(heartbeat_publish.periodLog.value).toString())} ${parseInt(heartbeat_publish.ttl.toString())} ${heartbeat_publish.features.relay}${heartbeat_publish.features.proxy}${heartbeat_publish.features.friend}${heartbeat_publish.features.lowPower} ${heartbeat_publish.netKeyIndex}`,
        ]);
        waitList.push([`Heartbeat publish status Success`]);
        addressQueue.push(heartbeat_publish.unicastAddress.value);
      }
      
      if (heartbeat_subscribe && heartbeat_subscribe.saved) {

        // TODO: Check conversions from specifications

        commandQueue.push([
          `hb-sub-set ${parseInt(heartbeat_subscribe.unicastAddress.value).toString(16)} ${parseInt(heartbeat_subscribe.address.value).toString(16)} ${parseInt(heartbeat_subscribe.periodLog.value.toString(16))}`,
        ]);
        waitList.push([`Heartbeat subscribe status Success`]);
        addressQueue.push(heartbeat_subscribe.unicastAddress.value);
      }
      if (relay && relay.saved) {
        commandQueue.push([
          `relay-set ${relay.relay} ${parseInt(relay.count.toString(16))} ${parseInt(relay.step.toString(16))}`,
        ]);
        waitList.push([`Relay state`]);
        addressQueue.push(relay.unicastAddress.index);
      }
      if (proxy && proxy.saved) {
        commandQueue.push([
          `proxy-set ${proxy.proxy}`,
        ]);
        waitList.push([`Proxy state`]);
        addressQueue.push(proxy.unicastAddress.index);
      }
      if (ttl && ttl.saved) {
        commandQueue.push([
          `ttl-set ${parseInt(ttl.ttl.toString(16))}`,
        ]);
        waitList.push([`Default TTL`]);
        addressQueue.push(ttl.unicastAddress.index);
      }


      configureMesh(addressQueue.map(addr => String(addr)), commandQueue, waitList);
      return response.status(200).json({
        status: "success",
        message: "Initiated process",
      });
    }
  }
}

async function configureMesh(addressQueue: string[], commandQueue: string[][], waitList: (string)[][]) {
  function stopProcess(error = false) {
    console.log("stopProcess() called!")
    if (global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin) {
      global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write(
        "\nback\ndisconnect\n"
      );
    }
    global.DATA.CONFIG.PROCESS.PROGRESS = 100;
    global.DATA.CONFIG.PROCESS.ERROR = error;
    global.DATA.CONFIG.PROCESS.STATUS = false;
    global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = false;
  }
  async function executeCommand(command: string, timeout: number, waitFor: string) {
    if (global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin) {
      global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS.stdin.write(command);
    }
    while (global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT.filter((str) => str.includes(waitFor as string)).length < 1) {
      await delay(50);
      timeout -= 50;
      if (timeout <= 0) {
        return false;
      }
    }
    global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = [];
    return true;
  }
  async function addLog(log: string) {
    global.DATA.CONFIG.PROCESS.LOGS.push(log);
  }

  if (global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS == false){
    console.log("Meshctl terminal session is not running, returning..")
    return
  }

  const progressMax = 100.0;
  const progressIncrement = progressMax / (commandQueue.length + 2);

  global.DATA.CONFIG.PROCESS.PROGRESS = 0;
  global.DATA.CONFIG.PROCESS.ERROR = false;
  global.DATA.CONFIG.PROCESS.STATUS = true;
  global.DATA.CONFIG.PROCESS.LOGS = [];
  global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true;
  global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = [];

  global.DATA.CONFIG.PROCESS.LOGS.push(
    "Trying to connect to the mesh network (3 attempts)"
  );

  let attempts = 0;

  while (attempts < 3) {
    attempts++;
    addLog("Attempt " + (attempts) + " of 3")
    addLog("Trying to reset the controller");
    if (await executeCommand("\nback\ndisconnect\npower off\n", 5000, "Powered: no") === false){continue}
    if (await executeCommand("power on\n", 5000, "Powered: yes") === false){continue}
    global.DATA.CONFIG.PROCESS.PROGRESS += progressIncrement;
    addLog("Trying to connect to the mesh network");
    if (await executeCommand("connect\n", 10000, "Mesh session is open") === false){continue}
    global.DATA.CONFIG.PROCESS.PROGRESS += progressIncrement;
    addLog("Connected to the mesh network");
    addLog("Opening configuration menu");
    if (await executeCommand("menu config\n", 1000, "Available commands:") === false){continue}
    addLog("Configuration menu is open");
    for (let addressIndex = 0; addressIndex < addressQueue.length; addressIndex++) {
      addLog("Trying to put target on node " + addressQueue[addressIndex]);
      if (await executeCommand("target " + addressQueue[addressIndex] + "\n", 1000, "Configuring node " + addressQueue[addressIndex]) === false){continue}
      addLog("Configuring node " + addressQueue[addressIndex]);
      for (let commandIndex = 0; commandIndex < commandQueue[addressIndex].length; commandIndex++) {
        addLog("Trying to " + commandQueue[addressIndex][commandIndex]);
        if (await executeCommand(commandQueue[addressIndex][commandIndex] + "\n", 5000, waitList[addressIndex][commandIndex] as string) === false){continue}
        addLog(waitList[addressIndex][commandIndex]);
        global.DATA.CONFIG.PROCESS.PROGRESS += progressIncrement;
      }
      addLog("Success!");
    }
    addLog("Done all tasks!");
    stopProcess();
    return;

    
  }
  if (attempts >= 3) {
    stopProcess(true);
    addLog("Failed to configure mesh network");
    return
  }
}

