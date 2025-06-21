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
    console.log({ [query]: global.DATA.CONFIG[query] })
    return response.status(200).json({ [query]: global.DATA.CONFIG[query] });
    }
    else{
      return response.status(200).json({ "keys":global.DATA.KEYS });
    }
}

  if (request.method === 'POST') {
    console.log(request.body)
    const { STATUS } = request.body;
    console.log(STATUS)


  }
}