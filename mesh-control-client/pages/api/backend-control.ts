import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";


if (typeof global.pythonProcess === 'undefined') {
  global.pythonProcess = null;
  global.pythonProcessPID = null;
  
}

if (typeof global.forceState === 'undefined'){
  global.forceState = null;
}

const startPythonProcess = () => {
  const pythonScriptPath = '../mesh-control-python-server/main.py';

  global.pythonProcess = spawn('python3', [pythonScriptPath]);
  global.pythonProcessPID = global.pythonProcess.pid || null;

  console.log(`Python process started with PID: ${global.pythonProcessPID}`);

  if (global.pythonProcess.stdout !== null) {
    global.pythonProcess.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  }
  if (global.pythonProcess.stderr !== null) {
    global.pythonProcess.stderr.on('data', (data) => {
      console.error(`${data}`);
    });
  }

  global.pythonProcess.on('exit', (code) => {
    console.log(`Python process exited with code: ${code}`);
    global.pythonProcess = null;
    global.pythonProcessPID = null;
    global.forceState = null;
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
      return res.status(200).json({ STATUS: global.pythonProcess != null, PID: global.pythonProcess?.pid });
    }
  }

  if (req.method === 'POST') {
    const { STATUS } = req.body;

    if (STATUS === true) {
      if (global.pythonProcess) {
        return res.status(400).json({ message: 'Python backend is already running' });
      }

      startPythonProcess();
      global.forceState = true;
      return res.status(200).json({ message: 'Python backend started' });
    } else if (STATUS === false) {
      if (!global.pythonProcess) {
        return res.status(400).json({ message: 'Python backend is not running' });
      }

      global.pythonProcess.kill('SIGINT');
      global.pythonProcess = null;
      global.pythonProcessPID = null;
      global.forceState = false;

      return res.status(200).json({ message: 'Python backend stopped' });
    }
  }
}
