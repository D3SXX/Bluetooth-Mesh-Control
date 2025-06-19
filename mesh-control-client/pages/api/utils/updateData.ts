import { runCommmand } from "./runCommand";
import {getNodes} from "./readProvdb"
import {delay} from "./common"

export function updateController(){
    let controllers = [];
    const controllerData = runCommmand(["list"])
    const controllerArr = controllerData.split("\n")
    
    // Collect controllers data

    for (let i = 0; i < controllerArr.length; i++){
        if (controllerArr[i].includes("Controller")){
            const obj = controllerArr[i].split(" ")
            
            // More detailed data

            const dataArr = runCommmand([`show`, `${obj[1]}`]).split("\n")
            
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
                controllerObj["Default"] = true
                global.DATA.CONTROLLER.DEFAULT = obj[1]
                global.DATA.CONTROLLER.DEFAULT_INDEX = i-1
                global.DATA.CONTROLLER.POWER = controllerObj["Powered"] === "yes" ? true : false
                const tmp = global.DATA.PROVISION.SCAN_ACTIVE
                global.DATA.PROVISION.SCAN_ACTIVE = controllerObj["Discovering"] === "yes" ? true : false
                if (tmp != global.DATA.PROVISION.SCAN_ACTIVE){
                    global.DATA.PROVISION.UNPROVISIONED_NODES = {}
                }
            }
            else{
                controllerObj["Default"] = false
            }
            
            controllers.push(controllerObj)

        }
    }

    global.DATA.CONTROLLER.LIST = controllers
    

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

  const versionData = runCommmand(["version"]);
  const versionArr = versionData.split("\n");

  global.DATA.SERVER.MESHCTL = versionArr[1].split(" ")[1];

}