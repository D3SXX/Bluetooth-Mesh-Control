import { runCommand } from "./runCommand";
import {getNodes} from "./readProvdb"
import {delay} from "./common"
import {NodeConfig} from "../../../app/interfaces/server"

export function updateController(){
    let controllers = [];
    let defaultController, defaultControllerIndex, defaultControllerPower, defaultControllerDiscovering
    const controllerData = runCommand(["list"])
    const controllerArr = controllerData.split("\n")
    
    // Collect controllers data

    for (let i = 0; i < controllerArr.length; i++){
        if (controllerArr[i].includes("Controller")){
            const obj = controllerArr[i].split(" ")
            
            // More detailed data

            const dataArr = runCommand([`show`, `${obj[1]}`]).split("\n")
            
            let controllerObj = {"UUID":[], "Address":obj[1]}
            
            for (let k = 0; k<dataArr.length; k++){

                const re = /[ \t](\w+):[\t ](.*)/gm
                const arr = re.exec(dataArr[k])
                if (arr != null){
                    if (arr[1] === "UUID"){
                        controllerObj["UUID"].push(arr[2])
                    }
                    else{
                        controllerObj[arr[1]] = arr[2]
                    }
                }
                
            }
            if (obj[3]){
                if (global.DATA.CONTROLLER.DEFAULT == ""){
                    defaultController = obj[1]
                    defaultControllerIndex = i-1
                    defaultControllerPower = controllerObj["Powered"] === "yes" ? true : false
                    defaultControllerDiscovering = controllerObj["Discovering"] === "yes" ? true : false
            }
            }
            else{
                controllerObj["Default"] = false
            }
            
            controllers.push(controllerObj)

        }
    }


    if (global.DATA.CONTROLLER.LIST.length != controllers.length){
        console.log("Updating controller list (different list length)")
        global.DATA.CONTROLLER.LIST = controllers
    }
    if (global.DATA.CONTROLLER.DEFAULT == ""){
        console.log("Setting default controller for global data object")
        global.DATA.CONTROLLER.DEFAULT = defaultController
        global.DATA.CONTROLLER.DEFAULT_INDEX = defaultControllerIndex
        global.DATA.CONTROLLER.POWER = defaultControllerPower
        global.DATA.CONTROLLER.DISCOVERING = defaultControllerDiscovering
    }
    else{
        for (let i = 0; i < global.DATA.CONTROLLER.LIST.length; i++){
            if (global.DATA.CONTROLLER.LIST[i].Address == defaultController){
                global.DATA.CONTROLLER.DEFAULT_INDEX = i
                global.DATA.CONTROLLER.POWER = defaultControllerPower
                global.DATA.CONTROLLER.DISCOVERING = defaultControllerDiscovering
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

  const versionData = runCommand(["version"]);
  const versionArr = versionData.split("\n");

  global.DATA.SERVER.MESHCTL = versionArr[1].split(" ")[1];

}