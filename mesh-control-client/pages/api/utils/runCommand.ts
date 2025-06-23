import { spawnSync } from "child_process";

export function runCommand(commandArr: string[]){

  const process = spawnSync('meshctl', commandArr);

  return process.stdout.toString()
};
