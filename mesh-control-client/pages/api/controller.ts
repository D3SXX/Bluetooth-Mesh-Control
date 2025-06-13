import { GlobalStyles } from "@mui/material";
import { NextApiRequest, NextApiResponse } from "next";

import {getNodes, loadConfig} from "./utils/readProvdb"
import {init} from "./utils/initData"
import { NodeConfig } from "../../app/interfaces/server"

import {runCommmand} from "./utils/runCommand"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Initialize data if not initialized
      if (global["DATA"] === undefined){
        global.DATA = await init()
      }
      
      updateData()

  if (request.method === 'GET') {
    let query = request.query['query'];
    
    if (query){
    return response.status(200).json({ [query]: global.DATA.CONTROLLER[query] });
    }
    return response.status(200).json({ "MESSAGE":"provision control backend api" });
  }

  if (request.method === 'POST') {
    console.log(request.body)
    const { STATUS } = request.body;
    console.log(STATUS)


  }
}

function updateData(){
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
            }
            else{
                controllerObj["Default"] = false
            }
            
            controllers.push(controllerObj)

        }
    }

    global.DATA.CONTROLLER.LIST = controllers
    

}