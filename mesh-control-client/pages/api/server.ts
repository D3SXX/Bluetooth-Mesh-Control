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
    return response.status(200).json({ [query as keyof typeof global.DATA.SERVER]: global.DATA.SERVER[query as keyof typeof global.DATA.SERVER]  });
    }
    else{
      return response.status(200).json({ "server":global.DATA.SERVER });
    }
}

  if (request.method === 'POST') {
        const { LOGS_SETTINGS } = request.body;
        if (LOGS_SETTINGS){
          Debug.log("Updated settings for logs", "INFO", "Server");
          global.DATA.SERVER.LOGS_SETTINGS = LOGS_SETTINGS;
        }
        return response.status(200).json({ "status": "success", "message": "Logs settings updated", "LOGS_SETTINGS":global.DATA.SERVER.LOGS_SETTINGS });
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