import { spawn, spawnSync } from "child_process";
import { delay } from "./common";

export function runCommand(commandArr: string[], processName: string = "meshctl"){

  const process = spawnSync(processName, commandArr);

  return process.stdout.toString()
};

export async function runSeveralCommands(commandArr: string[], processName: string = "meshctl"): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(processName);
    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      resolve(output);
    });

    process.on('error', (error) => {
      reject(error);
    });

    for (let i = 0; i < commandArr.length; i++) {
      process.stdin.write(commandArr[i] + "\n");
    }
    process.stdin.write("exit\n");
    process.stdin.end();
  });
};