import { NextApiRequest, NextApiResponse } from "next";
import { startProcess, stopProcess } from "./utils/process";
import { TerminalSession } from "../../interfaces/global";
import { delay } from "./utils/common"

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'GET') {

    let query;
    if (request) {
      query = request.query['query'];
    }
    if (query) {
      return response.status(200).json({ [query as string]: global.DATA.TERMINAL_SESSIONS.MESHCTL[query as keyof TerminalSession] });
    }

  }
  else if (request.method === 'POST') {
    const { status } = request.body;

    if (status != undefined) {
      console.log(`Trying to ${status ? "start meshctl" : "stop meshctl"}`)
      if (status === true) {
        startProcess("MESHCTL")
      }
      else {
        global.DATA.TERMINAL_SESSIONS.MESHCTL.PROCESS?.stdin?.write("discover-unprovisioned off\n")
        await delay(200)
        stopProcess("MESHCTL")
      }
      return response.status(200).json({ status: global.DATA.TERMINAL_SESSIONS.MESHCTL.STATUS });
    }
    return response.status(200).end();
  }
  else if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
}

