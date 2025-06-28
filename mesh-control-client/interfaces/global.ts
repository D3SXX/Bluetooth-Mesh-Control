import { spawn, ChildProcess } from "child_process";

interface ServerError {
    EXTRA_DATA: Record<string, unknown>;
    STATUS: boolean;
    MESSAGE?: string | null;
    TYPE?: string | null;
}

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

interface Server {
    ALLOW_PROCESSES: boolean;
    ERROR: ServerError;
    MESHCTL: string;
    NAME: string;
    STATUS?: string;
    VERSION: string;
}

export interface ControllerDevice {
    UUID: string[];
    Address: string;
    Name: string;
    Alias: string;
    Class: string;
    Powered: string;
    Discoverable: string;
    Modalias: string;
    Discovering: string;
    Default: boolean;
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

interface Controller {
    DEFAULT: string;
    DEFAULT_INDEX: number;
    POWER: boolean;
    LIST: ControllerDevice[];
    PROCESS: {
        STATUS: boolean;
    };
}

interface NodeElement {
    elementIndex: number;
    location: string;
    models: string[];
    modelsName: string[];
}

interface NodeConfigurationElement {
    elementIndex: number;
    unicastAddress: string;
    models?: {
        bind?: number[];
        modelId?: string;
        publish?: {
            address: string;
            index: string;
            ttl: number;
        };
        subscribe?: string[];
    }[];
}

interface NodeComposition {
    cid: string;
    cidName: string;
    crpl: string;
    elements: NodeElement[];
    features: {
        friend: boolean;
        lpn: boolean;
        proxy: boolean;
        relay: boolean;
    };
    pid: string;
    vid: string;
}

interface Node {
    IVindex: number;
    composition: NodeComposition;
    configuration: {
        elements: NodeConfigurationElement[];
        netKeys: string[];
        appKeys: string[];
        defaultTTL?: number;
    };
    deviceKey: string;
    sequenceNumber: number;
}

export interface NodesConfig {
    nodes: Node[];
    appKeys: AppKey[];
    netKeys: NetKey[];
}

interface ProcessStatus {
    ERROR: boolean;
    LOGS: string[];
    PROGRESS: number;
    STATUS: boolean;
}

interface ProvisionProcess {
    ERROR: boolean;
    LOGS: string[];
    PROGRESS: number;
    START_TIME: number;
    STATUS: boolean;
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

interface Provision {
    PROCESS: ProvisionProcess;
    SCAN_ACTIVE: boolean;
    UNPROVISIONED_NODES: Record<string, unknown>;
    USE_FAILBACK_SCAN: boolean;
}

export interface Config {
    NODES: NodesConfig;
    PROCESS: ProcessStatus;
    SECURITY_LEVEL: number;
}

export interface AppKey {
    boundNetKey: number;
    index: number;
    key: string;
}

interface NetKey {
    index: number;
    key: string;
    keyRefresh: number;
    ASSIGNED_NODES?: string[];
    ASSIGNED_NODES_UNICAST_ADDRESS?: string[];
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

interface Keys {
    APPKEYS: AppKey[];
    NETKEYS: NetKey[];
    BIND?: Bind;
    PUBLISH?: Record<string, Publish>;
    SUBSCRIBE?: Record<string, Subscribe>;
}

interface Bind {
    [key: string]: {
        APPKEY_INDEX?: number;
        MODEL?: string;
    };
}

interface Publish {
    ADDRESS?: string;
    APPKEY_INDEX?: number;
    TTL?: number;
}

interface Subscribe {
    ADDRESS_LIST?: string[];
}

interface TerminalSessionData {
    STATUS: boolean;
    OUTPUT: any[];
    PROCESS?: ChildProcess | null;
    PROCESS_PID?: number | null;
    LOCK: boolean;
}

export interface TerminalSession {
    STATUS: boolean;
    OUTPUT: string[];
    PROCESS?: any;
    PROCESS_PID?: string;
    LOCK?: boolean;
}

interface TerminalSessionsData {
    MESHCTL: TerminalSessionData;
    CONFIG: TerminalSessionData;
    CONTROLLER: TerminalSessionData;
    PROVISION: TerminalSessionData;
    SERVER: TerminalSessionData;
}

export interface TerminalSessions {
    MESHCTL: TerminalSession;
    CONFIG: TerminalSession;
    CONTROLLER: TerminalSession;
    PROVISION: TerminalSession;
    SERVER: TerminalSession;
}

interface CompanyIdentifier {
    value: number;
    name: string;
}

interface ModelUUID {
    name: string;
    uuid: number;
    type: string;
}

export interface SetupData {
    setupData: {
        bind?: {
            unicastAddress: { index: number; value: string };
            model: {
                index: number;
                value: string;
            };
            appKeyIndex: number;
            saved: boolean;
        };
        publish?: {
            unicastAddress: { index: number; value: string };
            model: {
                index: number;
                value: string;
            };
            address: {
                type: string;
                value: string;
            };
            publicationPeriod: {
                step: number;
                res: number;
            };
            retransmitionCount: {
                cnt: number;
                per: number;
            };
            appKeyIndex: number;
            saved: boolean;
        };
        subscribe?: {
            unicastAddress: { index: number; value: string };
            model: {
                index: number;
                value: string;
            };
            address: {
                type: string;
                value: string;
            };
            appKeyIndex: number;
            saved: boolean;
        };
        identity?: {
            saved: boolean;
            unicastAddress: { index: number; value: string };
            netKeyIndex: number;
            state: number;
        };
        beacon?: {
            saved: boolean;
            unicastAddress: { index: number; value: string };
            state: number;
        };
        heartbeat_publish?: {
            saved: boolean;
            unicastAddress: { index: number; value: string };
            address: {
                type: string;
                value: string;
            };
            relay: number;
            retransmitCount: {
                value: number;
                label: string;
            };
            periodLog: {
                value: number;
                label: string;
            };
            ttl: number;
            features: {
                relay: boolean;
                proxy: boolean;
                friend: boolean;
                lowPower: boolean;
            };
            netKeyIndex: number;
        };
        heartbeat_subscribe?: {
            saved: boolean;
            count: {
                value: number;
                label: string;
            };
            minHops: {
                value: number;
                label: string;
            };
            maxHops: {
                value: number;
                label: string;
            };
            unicastAddress: { index: number; value: string };
            address: {
                type: string;
                value: string;
            };
            periodLog: {
                value: number;
                label: string;
            };
        };
        relay?: {
            saved: boolean;
            unicastAddress: { index: number; value: string };
            count: number;
            step: number;
            relay: boolean;
        };
        proxy?: {
            saved: boolean;
            unicastAddress: { index: number; value: string };
            proxy: boolean;
        };
        ttl?: {
            saved: boolean;
            unicastAddress: { index: number; value: string };
            ttl: number;
        };
    };
}

export interface NodeConfig {
    STATUS: boolean;
    nodes: Node[];
    appKeys: AppKey[];
    netKeys: NetKey[];
}

export interface ServerResponse {
    config: Config;
    controller: Controller;
    keys: Keys;
    provision: Provision;
    server: Server;
    terminal_sessions: TerminalSessions;
    COMPANY_IDENTIFIERS: CompanyIdentifier[];
    MMDL_MODEL_UUIDS: ModelUUID[];
    MESH_MODEL_UUIDS: ModelUUID[];
}

interface GlobalData {
    SERVER: ServerData;
    CONTROLLER: ControllerData;
    PROVISION: ProvisionData;
    CONFIG: Config;
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