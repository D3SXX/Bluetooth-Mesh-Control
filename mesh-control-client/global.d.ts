import { spawn, ChildProcess } from "child_process";

interface ServerData {
    STATUS: boolean;
    VERSION: string;
    NAME: string;
    ALLOW_PROCESSES: boolean;
    MESHCTL: string;
    ERROR: {
        STATUS: boolean;
        MESSAGE: string;
        TYPE: string;
        EXTRA_DATA: Record<string, any>;
    };
}

interface ControllerData {
    DEFAULT: string;
    DEFAULT_INDEX: number;
    POWER: boolean;
    LIST: Record<string, any>;
    PROCESS: {
        STATUS: boolean;
    };
}

interface ProvisionData {
    SCAN_ACTIVE: boolean;
    USE_FAILBACK_SCAN: boolean;
    UNPROVISIONED_NODES: Record<string, any>;
    PROCESS: {
        STATUS: boolean;
        PROGRESS: number;
        LOGS: any[];
        ERROR: boolean;
        START_TIME: number;
    };
}

interface ConfigData {
    SECURITY_LEVEL: string;
    NODES: any[];
    PROCESS: {
        STATUS: boolean;
        PROGRESS: number;
        LOGS: any[];
        ERROR: boolean;
    };
}

interface KeysData {
    APPKEYS: any[];
    NETKEYS: Array<{
        ASSIGNED_NODES?: string[];
        ASSIGNED_NODES_UNICAST_ADDRESS?: string[];
        [key: string]: any;
    }>;
    BIND: Record<string, {
        MODEL: string;
        APPKEY_INDEX: number;
    }>;
    PUBLISH: Record<string, {
        ADDRESS: string;
        APPKEY_INDEX: number;
        TTL: number;
    }>;
    SUBSCRIBE: Record<string, {
        ADDRESS_LIST: string[];
    }>;
}

interface TerminalSessionData {
    STATUS: boolean;
    OUTPUT: any[];
    PROCESS?: ChildProcess | null;
    PROCESS_PID?: number | null;
    LOCK: boolean;
}

interface TerminalSessionsData {
    MESHCTL: TerminalSessionData;
    CONFIG: TerminalSessionData;
    CONTROLLER: TerminalSessionData;
    PROVISION: TerminalSessionData;
    SERVER: TerminalSessionData;
}

interface GlobalData {
    SERVER: ServerData;
    CONTROLLER: ControllerData;
    PROVISION: ProvisionData;
    CONFIG: ConfigData;
    KEYS: KeysData;
    TERMINAL_SESSIONS: TerminalSessionsData;
    COMPANY_IDENTIFIERS: Record<string, any>;
    MMDL_MODEL_UUIDS: Record<string, any>;
    MESH_MODEL_UUIDS: Record<string, any>;
    TERMINAL_OUTPUT: any[];
}

declare global {
    var DATA: GlobalData;
}

export {};