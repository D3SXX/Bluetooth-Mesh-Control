import { spawn, ChildProcess } from "child_process";
import { GlobalData } from "./interfaces/global";

declare global {
    var DATA: GlobalData;
}

export {};