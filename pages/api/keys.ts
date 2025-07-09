import { GlobalStyles } from "@mui/material";
import { NextApiRequest, NextApiResponse } from "next";

import { getKeysData } from "./utils/readProvdb"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  global.DATA.KEYS = getKeysData()

  if (request.method === 'GET') {
    let query;
    if (request){
      query = request.query['query'];
    }
    
    if (query){
    return response.status(200).json({ [query as keyof typeof global.DATA.KEYS]: global.DATA.KEYS[query as keyof typeof global.DATA.KEYS]  });
    }
    else{
      return response.status(200).json({ "keys":global.DATA.KEYS });
    }
}

  if (request.method === 'POST') {


  }
}