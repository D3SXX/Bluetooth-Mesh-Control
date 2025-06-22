interface AppKey {
    boundNetKey: number;
    index: number;
    key: string;
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

interface NodesConfig {
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

interface Config {
    NODES: NodesConfig;
    PROCESS: ProcessStatus;
    SECURITY_LEVEL: number;
}

interface ControllerDevice {
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

interface Controller {
    DEFAULT: string;
    DEFAULT_INDEX: number;
    POWER: boolean;
    LIST: ControllerDevice[];
    PROCESS: {
        STATUS: boolean;
    };
}

interface NetKey {
    index: number;
    key: string;
    keyRefresh: number;
    ASSIGNED_NODES?: string[];
    ASSIGNED_NODES_UNICAST_ADDRESS?: string[];
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

interface ProvisionProcess {
    ERROR: boolean;
    LOGS: string[];
    PROGRESS: number;
    START_TIME: number;
    STATUS: boolean;
}

interface Provision {
    PROCESS: ProvisionProcess;
    SCAN_ACTIVE: boolean;
    UNPROVISIONED_NODES: Record<string, unknown>;
    USE_FAILBACK_SCAN: boolean;
}

interface ServerError {
    EXTRA_DATA: Record<string, unknown>;
    STATUS: boolean;
    MESSAGE?: string | null;
    TYPE?: string | null;
}

interface Server {
    ALLOW_PROCESSES: boolean;
    ERROR: ServerError;
    MESHCTL: string;
    NAME: string;
    STATUS?: string;
    VERSION: string;
}

interface TerminalSession {
    STATUS: boolean;
    OUTPUT: string[];
    PROCESS?: any;
    PROCESS_PID?: string;
    LOCK?: boolean;
}

interface TerminalSessions {
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