import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";


if (typeof global.meshctlProcess === 'undefined') {
  global.meshctlProcess = null;
  global.meshctlProcessPID = null;
  
}

const startMeshctl = () => {
  

  global.meshctlProcess = spawn('meshctl');
  global.meshctlProcessPID = global.meshctlProcessPID || null;

  console.log(`Mestctl process started with PID: ${global.meshctlProcessPID}`);

  if (global.meshctlProcess.stdout !== null) {
    global.meshctlProcess.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  }
  if (global.meshctlProcess.stderr !== null) {
    global.meshctlProcess.stderr.on('data', (data) => {
      console.error(`${data}`);
    });
  }

  global.meshctlProcess.on('exit', (code) => {
    console.log(`Meshctl process exited with code: ${code}`);
    global.meshctlProcess = null;
    global.meshctlProcessPID = null;
  });
};


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    let query = req.query['query'];
    if (query === 'STATUS') {
      return res.status(200).json({ "MESSAGE":"meshctl control backend api" });
    }
    return res.status(200).json({ "MESSAGE":"meshctl control backend api" });
  }

  if (req.method === 'POST') {
    const { STATUS } = req.body;

  }
}
