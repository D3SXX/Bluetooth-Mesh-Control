import { GlobalStyles } from "@mui/material";
import { NextApiRequest, NextApiResponse } from "next";

import { getKeysData } from "./utils/readProvdb"
import { debug } from "console";
import Debug from "./utils/debug";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'GET') {
    let query;
    if (request){
      query = request.query['query'];
    }
    if (query){
      const returnObj: Record<string, any> = {};
      if (typeof query === 'string'){
        query = [query];
      }

      for (const q of query){
        if (q in global.DATA.SERVER){
          returnObj[q] = global.DATA.SERVER[q as keyof typeof global.DATA.SERVER];
        }
      }
      return response.status(200).json(returnObj);
    }
    else{
      return response.status(200).json({ "server":global.DATA.SERVER });
    }
}

  if (request.method === 'POST') {
        const { LOGS_SETTINGS, TOAST_SETTINGS } = request.body;
        if (LOGS_SETTINGS){
          global.DATA.SERVER.LOGS_SETTINGS = LOGS_SETTINGS as any;
          Debug.log("Updated settings for logs", "SUCCESS", "Server");
          return response.status(200).json({ "status": "success", "message": "Logs settings updated", "LOGS_SETTINGS":global.DATA.SERVER.LOGS_SETTINGS });
        }
        if (TOAST_SETTINGS){
          global.DATA.SERVER.TOAST_SETTINGS = TOAST_SETTINGS as any;
          Debug.log("Updated settings for toast notifications", "SUCCESS", "Server");
          return response.status(200).json({ "status": "success", "message": "Toast notifications settings updated", "TOAST_SETTINGS":global.DATA.SERVER.TOAST_SETTINGS });
        }
        return response.status(400).json({ "error": "Invalid request body" });
  }

  if (request.method === 'DELETE') {
    const { query } = request.query;
    if (query === 'LOGS') {
      global.DATA.SERVER.LOGS = []
      return response.status(200).json({ "status": "success", "message": "Logs reset" });
    }
    else {
      return response.status(400).json({ "error": "Invalid query parameter" });
    }
  }
}