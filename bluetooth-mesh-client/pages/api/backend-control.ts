// backend-control.ts

import { exec, execSync } from 'child_process';

let pythonProcess = null;

export default function handler(req, res) {
  const { action } = req.body; 

  const pythonScriptPath = '../bluetooth-mesh-server-2.0/main.py';

  if (action === 'start') {
    if (pythonProcess) {
      return res.status(400).json({ message: 'Python script is already running' });
    }

    pythonProcess = exec(`python3 ${pythonScriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting Python script: ${stderr}`);
        pythonProcess = null;
        return res.status(500).json({ message: stderr });
      }
      console.log(`Python script output: ${stdout}`);
    });

    return res.status(200).json({ message: 'Python script started' });

  } else if (action === 'stop') {
    if (!pythonProcess) {
      return res.status(400).json({ message: 'Python script is not running' });
    }

    pythonProcess.kill('SIGKILL');
    pythonProcess = null;
    return res.status(200).json({ message: 'Python script stopped' });

  } else {
    return res.status(400).json({ message: 'Invalid action' });
  }
}
