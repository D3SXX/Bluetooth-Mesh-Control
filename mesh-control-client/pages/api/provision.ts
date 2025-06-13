import { GlobalStyles } from "@mui/material";
import { NextApiRequest, NextApiResponse } from "next";

import {getNodes, loadConfig} from "./utils/readProvdb"
import {init} from "./utils/initData"
import { NodeConfig } from "../../app/interfaces/server"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Initialize data if not initialized
      if (global["DATA"] === undefined){
        global.DATA = await init()
      }
      

  if (request.method === 'GET') {
    let query = request.query['query'];
    
    if (query){
    return response.status(200).json({ [query]: global.DATA.PROVISION[query] });
    }
    return response.status(200).json({ "MESSAGE":"provision control backend api" });
  }

  if (request.method === 'POST') {
    console.log(request.body)
    const { STATUS } = request.body;
    console.log(STATUS)


  }
}

function update_config(){
  const obj: NodeConfig = getNodes()
  (global["DATA"] as any)["CONFIG"]["NODES"] = obj.nodes
  (global["DATA"] as any)["CONFIG"]["APPKEYS"] = obj.appKeys
  (global["DATA"] as any)["CONFIG"]["NETKEYS"] = obj.netKeys

}