import { runCommand, runSeveralCommands } from "./runCommand";
import {getNodes} from "./readProvdb"
import {delay} from "./common"
import {NodeConfig, ControllerDevice} from "../../../interfaces/global"
import Debug from "./debug";

export async function updateController(){
    let controllers = [];
    let defaultController: string = "", defaultControllerIndex, defaultControllerPower: boolean = false, defaultControllerDiscovering: boolean = false
    const controllerData = await runSeveralCommands([`select ${global.DATA.CONTROLLER.DEFAULT}`, "list"])
    const controllerArr = controllerData.split("\n")

    // Collect controllers data    

    let controllerIndex = -1;
    for (let i = 0; i < controllerArr.length; i++){
        if (controllerArr[i].includes("Controller") && !controllerArr[i-1].includes("select")){
            // Second check should prevent controller duplicates
            const obj = controllerArr[i].split(" ")
            controllerIndex++;
            // More detailed data

            const dataArr = (await runSeveralCommands([`select ${global.DATA.CONTROLLER.DEFAULT}`, `show ${obj[1]}`])).split("\n")
            
            let controllerObj: ControllerDevice = {"UUID":[], "Address":obj[1], "Name":"", "Alias":"", "Class":"", "Powered":"", "Discoverable":"", "Modalias":"", "Discovering":""}
            
            for (let k = 0; k<dataArr.length; k++){

                const re = /[ \t](\w+):[\t ](.*)/gm
                const arr = re.exec(dataArr[k])
                if (arr != null){
                    if (arr[1] === "UUID"){
                        controllerObj["UUID"].push(arr[2])
                    }
                    else{
                        controllerObj[arr[1] as keyof ControllerDevice] = arr[2] as never
                    }
                }
                
            }
            if (obj[3]){
                if (global.DATA.CONTROLLER.DEFAULT == ""){
                    defaultController = obj[1]
                    defaultControllerIndex = controllerIndex
                    defaultControllerPower = controllerObj["Powered"] === "yes" ? true : false
                    defaultControllerDiscovering = controllerObj["Discovering"] === "yes" ? true : false
            }
            }
            
            controllers.push(controllerObj)

        }
    }


    if (global.DATA.CONTROLLER.LIST.length != controllers.length){
        Debug.log("Updating controller list (different list length)", "INFO", "UpdateData");
        global.DATA.CONTROLLER.LIST = controllers
    }
    if (global.DATA.CONTROLLER.DEFAULT == ""){
        Debug.log("Setting default controller for global data object", "INFO", "UpdateData");
        global.DATA.CONTROLLER.DEFAULT = defaultController
        global.DATA.CONTROLLER.DEFAULT_INDEX = defaultControllerIndex || 0
        global.DATA.CONTROLLER.POWER = defaultControllerPower
        global.DATA.PROVISION.SCAN_ACTIVE = defaultControllerDiscovering
    }
    else{
        for (let i = 0; i < global.DATA.CONTROLLER.LIST.length; i++){
            if (global.DATA.CONTROLLER.LIST[i].Address == defaultController){
                Debug.log("Setting default controller for global data object", "INFO", "UpdateData");
                global.DATA.CONTROLLER.DEFAULT_INDEX = i
                global.DATA.CONTROLLER.POWER = defaultControllerPower
                global.DATA.PROVISION.SCAN_ACTIVE = defaultControllerDiscovering
                break
            }
        }
    }

}

export async function updateConfig() {
  // Get data from provdb

  const obj: NodeConfig | undefined = getNodes();
  if (obj) {
    global.DATA.CONFIG.NODES = {
      nodes: obj.nodes,
      appKeys: obj.appKeys,
      netKeys: obj.netKeys,
    };
    global.DATA.KEYS.APPKEYS = obj.appKeys
    global.DATA.KEYS.NETKEYS = obj.netKeys
}


  // Get version from meshctl

  const meshctlVersion = runCommand(["--version"], "meshctl");
  const meshctlVersionArr = meshctlVersion.split("\n");

  // Get version from mesh-cfgclient
  
  const meshCfgClientVersion = runCommand(["--version"], "mesh-cfgclient");
  const meshCfgClientVersionArr = meshCfgClientVersion.split("\n");

  global.DATA.SERVER.BLUEZ.MESHCTL.VERSION = meshctlVersionArr[0].split(" ")[1]
  global.DATA.SERVER.BLUEZ.MESH_CFGCLIENT.VERSION = meshCfgClientVersionArr[0].split(" ")[1]

  // Get the latest release from github

  if (global.DATA.SERVER.BLUEZ.LATEST_VERSION.VERSION === "Unknown"){
    const latestRelease = await fetch("https://api.github.com/repos/bluez/bluez/releases/latest")
    const meshctlRelease = await fetch(`https://api.github.com/repos/bluez/bluez/releases/tags/${global.DATA.SERVER.BLUEZ.MESHCTL.VERSION}`)
    const meshCfgClientRelease = await fetch(`https://api.github.com/repos/bluez/bluez/releases/tags/${global.DATA.SERVER.BLUEZ.MESH_CFGCLIENT.VERSION}`)
    const data = await latestRelease.json()
    const meshctlData = await meshctlRelease.json()
    const meshCfgClientData = await meshCfgClientRelease.json()
    if (meshctlData.message === "Not Found"){
      global.DATA.SERVER.BLUEZ.MESHCTL.IS_UNKNOWN_VERSION = true
    }
    else{
      global.DATA.SERVER.BLUEZ.MESHCTL.IS_UNKNOWN_VERSION = false
    }

    if (meshCfgClientData.message === "Not Found"){
      global.DATA.SERVER.BLUEZ.MESH_CFGCLIENT.IS_UNKNOWN_VERSION = true
    }
    else{
      global.DATA.SERVER.BLUEZ.MESH_CFGCLIENT.IS_UNKNOWN_VERSION = false
    }

    global.DATA.SERVER.BLUEZ.LATEST_VERSION.VERSION = data.tag_name || data.name
    global.DATA.SERVER.BLUEZ.LATEST_VERSION.CHANGELOG = data.body
    global.DATA.SERVER.BLUEZ.LATEST_VERSION.RELEASE_DATE = data.published_at
    global.DATA.SERVER.BLUEZ.LATEST_VERSION.RELEASE_URL = data.html_url
    global.DATA.SERVER.BLUEZ.MESHCTL.IS_NEWER_VERSION = parseFloat(global.DATA.SERVER.BLUEZ.MESHCTL.VERSION) < parseFloat(global.DATA.SERVER.BLUEZ.LATEST_VERSION.VERSION)
    global.DATA.SERVER.BLUEZ.MESH_CFGCLIENT.IS_NEWER_VERSION = parseFloat(global.DATA.SERVER.BLUEZ.MESH_CFGCLIENT.VERSION) < parseFloat(global.DATA.SERVER.BLUEZ.LATEST_VERSION.VERSION)
}

}