
import { NextApiRequest, NextApiResponse } from "next";
import {runCommand} from "./utils/runCommand"
import { updateController } from "./utils/updateData";
import { updateProcessConfig } from "./utils/process";
import { debug } from "console";
import Debug from "./utils/debug";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
    

  if (request.method === 'GET') {
    updateController()
    let query = request.query['query'];
    
    if (query){
    return response.status(200).json({ [query as string]: global.DATA.CONTROLLER[query as keyof typeof global.DATA.CONTROLLER] });
    }
    return response.status(200).json({ "MESSAGE":"provision control backend api" });
  }

  if (request.method === 'POST') {
    
    const { defaultAdapter } = request.body;
    if (defaultAdapter != undefined){
      global.DATA.CONTROLLER.DEFAULT_INDEX = defaultAdapter
      global.DATA.CONTROLLER.DEFAULT = global.DATA.CONTROLLER.LIST[defaultAdapter].Address
      global.DATA.CONTROLLER.POWER = global.DATA.CONTROLLER.LIST[defaultAdapter].Powered
      global.DATA.PROVISION.SCAN_ACTIVE = global.DATA.CONTROLLER.LIST[defaultAdapter].Discovering === "yes" ? true : false
      updateProcessConfig("MESHCTL")
      Debug.log(`Updated default adapter to ${global.DATA.CONTROLLER.LIST[defaultAdapter].Address} (${global.DATA.CONTROLLER.LIST[defaultAdapter].Name})`, "SUCCESS", "Controller");
      }

    return response.status(200).json({ "MESSAGE":"provision control backend api" });
  }
}

