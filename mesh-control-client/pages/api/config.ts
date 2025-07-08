import { NextApiRequest, NextApiResponse } from "next";

import { init } from "./utils/initData";
import { updateController, updateConfig } from "./utils/updateData";

import {delay} from "./utils/common"
import { SetupData } from "../../interfaces/global";
import { startProcess, stopProcess, updateProcessConfig } from "./utils/process";
import { removeNode, resetNodesList, resetAppkeysList, resetNetkeysList } from "./utils/editProvdb";
import Debug from "./utils/debug";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");


  if (request.method === "GET") {

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
    const { setupData, security, start_init }: { setupData: SetupData["setupData"], security: number, start_init: boolean } = request.body;

    if (start_init) {
      if (global.DATA && global.DATA.TERMINAL_SESSIONS && global.DATA.TERMINAL_SESSIONS.MESHCTL && global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS){
        stopProcess("MESHCTL")
      }
      global.DATA = await init()
      Debug.log("Initialized data", "SUCCESS", "Config");
      updateConfig()
      updateController()
      return response.status(200).json({
        "MESSAGE": `Config is ready`,
      });
    }

    if (security !== undefined) {
      global.DATA.CONFIG.SECURITY_LEVEL = security
      updateProcessConfig("MESHCTL")
      Debug.log(`Updated security level to ${global.DATA.CONFIG.SECURITY_LEVEL}`, "SUCCESS", "Config");
      return response.status(200).json({
        "MESSAGE": `Security level updated to ${global.DATA.CONFIG.SECURITY_LEVEL}`,
        "security": global.DATA.CONFIG.SECURITY_LEVEL
      });
    }

    if (setupData) {

      const {bind, publish, subscribe, identity, beacon, heartbeat_publish, heartbeat_subscribe, relay, proxy, ttl} = setupData;
      const commandQueue = [];
      const addressQueue = [];
      const waitList = [];

      if (bind && bind.saved) {
        Debug.log(`Adding bind for ${bind.unicastAddress.value}`, "INFO", "Config");
        commandQueue.push([
          `appkey-add ${bind.appKeyIndex}`,
          `bind ${bind.unicastAddress.index} ${bind.appKeyIndex} ${bind.model.value}`,
        ]);
        waitList.push(["AppKey status Success", "Model App"]);
        addressQueue.push(bind.unicastAddress.value);
      }
      if (publish && publish.saved) {
        Debug.log(`Adding publish for ${publish.unicastAddress.value}`, "INFO", "Config");
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
        Debug.log(`Adding subscribe for ${subscribe.unicastAddress.value}`, "INFO", "Config");
        commandQueue.push([
          `appkey-add ${subscribe.appKeyIndex}`,
          `sub-add ${subscribe.unicastAddress.value} ${subscribe.address.value} ${subscribe.model.value}`,
        ]);
        waitList.push(["AppKey status Success", "Subscription"]);
        addressQueue.push(subscribe.unicastAddress.value);
      }
      if (identity && identity.saved) {
        Debug.log(`Adding identity for ${identity.unicastAddress.value}`, "INFO", "Config");
        commandQueue.push([
          `ident-set ${identity.netKeyIndex} 0x0${identity.state}`,
        ]);
        waitList.push([`Identity state`]);
        addressQueue.push(identity.unicastAddress.value);
      }
      if (beacon && beacon.saved) {
        Debug.log(`Adding beacon for ${beacon.unicastAddress.value}`, "INFO", "Config");
        commandQueue.push([
          `beacon-set ${beacon.unicastAddress.value} ${beacon.state}`,
        ]);
        waitList.push([`Config Beacon Status`]);
        addressQueue.push(beacon.unicastAddress.value);
      }
      if (heartbeat_publish && heartbeat_publish.saved) {
        Debug.log(`Adding heartbeat publish for ${heartbeat_publish.unicastAddress.value}`, "INFO", "Config");
        // TODO: Check conversions from specifications

        commandQueue.push([
          `hb-pub-set ${parseInt(heartbeat_publish.address.value).toString(16)} ${parseInt(heartbeat_publish.retransmitCount.value.toString(16))} ${parseInt(Number(heartbeat_publish.periodLog.value).toString())} ${parseInt(heartbeat_publish.ttl.toString())} ${heartbeat_publish.features.relay}${heartbeat_publish.features.proxy}${heartbeat_publish.features.friend}${heartbeat_publish.features.lowPower} ${heartbeat_publish.netKeyIndex}`,
        ]);
        waitList.push([`Heartbeat publish status Success`]);
        addressQueue.push(heartbeat_publish.unicastAddress.value);
      }
      
      if (heartbeat_subscribe && heartbeat_subscribe.saved) {
        Debug.log(`Adding heartbeat subscribe for ${heartbeat_subscribe.unicastAddress.value}`, "INFO", "Config");
        // TODO: Check conversions from specifications

        commandQueue.push([
          `hb-sub-set ${parseInt(heartbeat_subscribe.unicastAddress.value).toString(16)} ${parseInt(heartbeat_subscribe.address.value).toString(16)} ${parseInt(heartbeat_subscribe.periodLog.value.toString(16))}`,
        ]);
        waitList.push([`Heartbeat subscribe status Success`]);
        addressQueue.push(heartbeat_subscribe.unicastAddress.value);
      }
      if (relay && relay.saved) {
        Debug.log(`Adding relay for ${relay.unicastAddress.value}`, "INFO", "Config");
        commandQueue.push([
          `relay-set ${relay.relay} ${parseInt(relay.count.toString(16))} ${parseInt(relay.step.toString(16))}`,
        ]);
        waitList.push([`Relay state`]);
        addressQueue.push(relay.unicastAddress.index);
      }
      if (proxy && proxy.saved) {
        Debug.log(`Adding proxy for ${proxy.unicastAddress.value}`, "INFO", "Config");
        commandQueue.push([
          `proxy-set ${proxy.proxy}`,
        ]);
        waitList.push([`Proxy state`]);
        addressQueue.push(proxy.unicastAddress.index);
      }
      if (ttl && ttl.saved) {
        Debug.log(`Adding ttl for ${ttl.unicastAddress.value}`, "INFO", "Config");
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
  if (request.method === "DELETE") {
    let address = request.query["address"];
    let type = request.query["type"];
    if (type == "nodes") {
      Debug.log("Resetting nodes list", "INFO", "Config");
      global.DATA.CONFIG.NODES.nodes = [];
      resetNodesList();
      Debug.log("Nodes list reset", "SUCCESS", "Config");
    }
    if (type == "appkeys") {
      Debug.log("Resetting appkeys list", "INFO", "Config");
      global.DATA.CONFIG.NODES.appKeys = [];
      resetAppkeysList();
      Debug.log("Appkeys list reset", "SUCCESS", "Config");
    }
    if (type == "netkeys") {
      Debug.log("Resetting netkeys list", "INFO", "Config");
      global.DATA.CONFIG.NODES.netKeys = [];
      resetNetkeysList();
      Debug.log("Netkeys list reset", "SUCCESS", "Config");
    }
    if (address) {
      Debug.log(`Trying to remove node for the address ${address}`, "INFO", "Config");
      for (let node of global.DATA.CONFIG.NODES.nodes) {
        if (node.configuration.elements[0].unicastAddress === address) {
          Debug.log(`Found node for the remove address ${address}`, "INFO", "Config");
          configureMesh([address], [["node-reset"]], [["reset status Success"]]);
          break;
        }
      }
      Debug.log(`Node for the address ${address} not found, cannot remove`, "ERROR", "Config");
    }
    return response.status(200).json({
      status: "success"
    });
  }
}

async function configureMesh(addressQueue: string[], commandQueue: string[][], waitList: (string)[][]) {
  function stopProcess(error = false) {
    
    if (error){
      Debug.log("stopProcess() called with error!", "ERROR", "Config");
    }
    else {
      Debug.log("Stopping configure mesh process!", "INFO", "Config");
    }

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
  async function addLog(log: string, type = "INFO") {
    global.DATA.CONFIG.PROCESS.LOGS.push(log);
    Debug.log(log, type, "Config");
  }

  if (global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS == false){
    Debug.log("Meshctl terminal session is not running, starting..", "WARNING", "Config");
    startProcess("MESHCTL")
    await delay(500)
  }

  if (global.DATA.CONTROLLER.POWER == false){
    Debug.log("Controller power is off, turning on", "WARNING", "Config");
    global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("power on\n")
    await delay(500)
  }

  const progressMax = 100.0;
  const progressIncrement = progressMax / (commandQueue.length + 2);

  global.DATA.CONFIG.PROCESS.PROGRESS = 0;
  global.DATA.CONFIG.PROCESS.ERROR = false;
  global.DATA.CONFIG.PROCESS.STATUS = true;
  global.DATA.CONFIG.PROCESS.LOGS = [];
  global.DATA.TERMINAL_SESSIONS.MESHCTL.LOCK = true;
  global.DATA.TERMINAL_SESSIONS.MESHCTL.OUTPUT = [];

 Debug.log(
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
      addLog("Success!", "SUCCESS");
    }
    if (commandQueue[0][0] == "node-reset") {
      addLog("Removing node from prov_db config");
      removeNode(addressQueue[0]);
      addLog("Node removed!", "SUCCESS");
    }
    addLog("Done all tasks!", "SUCCESS");
    stopProcess();
    return;

    
  }
  if (attempts >= 3) {
    stopProcess(true);
    addLog("Failed to configure mesh network", "ERROR");
    return
  }
}

