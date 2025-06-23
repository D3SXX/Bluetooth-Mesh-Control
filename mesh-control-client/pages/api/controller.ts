
import { NextApiRequest, NextApiResponse } from "next";
import {runCommand} from "./utils/runCommand"
import { updateController } from "./utils/updateData";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
    updateController()

  if (request.method === 'GET') {
    let query = request.query['query'];
    
    if (query){
    return response.status(200).json({ [query]: global.DATA.CONTROLLER[query] });
    }
    return response.status(200).json({ "MESSAGE":"provision control backend api" });
  }

  if (request.method === 'POST') {
    
    const { defaultAdapter } = request.body;
    if (defaultAdapter != undefined){
      runCommand([`select ${defaultAdapter}`])
    }
  
    return response.status(200).json({ "MESSAGE":"provision control backend api" });
  }
}

