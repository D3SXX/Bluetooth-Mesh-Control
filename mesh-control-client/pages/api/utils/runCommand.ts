import { spawnSync } from "child_process";

export function runCommmand(commandArr){

  const process = spawnSync('meshctl', commandArr);

  return process.stdout.toString()
};
