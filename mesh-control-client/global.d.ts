declare global {
    var pythonProcess: import("child_process").ChildProcess | null;
    var pythonProcessPID: number | null;
    var forceState: bool | null;
}

export {};