import { spawnSync } from "child_process";

export function runCommmand(commandArr: string[]){

  const process = spawnSync('meshctl', commandArr);

  return process.stdout.toString()
};
