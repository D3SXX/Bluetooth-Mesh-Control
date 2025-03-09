interface AppKey {
    boundNetKey: number;
    index: number;
    key: string;
}

interface NodeElement {
    elementIndex: number;
    location: string;
    model_names: string[];
    models: string[];
}

interface NodeConfigurationElement {
    elementIndex: number;
    unicastAddress: string;
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
    };
    deviceKey: string;
    sequenceNumber: number;
}

interface NodesConfig {
    STATUS: boolean;
    appKeys: AppKey[];
    nodes: Node[];
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

interface UUID {
    [key: string]: string;
}

interface ControllerDefaultData {
    Alias: string;
    Class: string;
    "Default-adapter": string;
    Discoverable: string;
    Discovering: string;
    Modalias: string;
    Name: string;
    Powered: string;
    UUID: UUID;
}

interface ControllerList {
    [key: string]: string;
}

interface Controller {
    DEFAULT: string;
    DEFAULT_DATA: ControllerDefaultData;
    LIST: ControllerList;
    POWER: boolean;
    PROCESS: {
        STATUS: boolean;
    };
}

interface NetKey {
    ASSIGNED_NODES: string[];
    index: number;
    key: string;
    keyRefresh: number;
}

interface Keys {
    APPKEYS: AppKey[];
    BIND: Record<string, unknown>;
    NETKEYS: NetKey[];
    PUBLISH: Record<string, unknown>;
    SUBSCRIBE: Record<string, unknown>;
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
    MESSAGE: string | null;
    STATUS: boolean;
    TYPE: string | null;
}

interface Server {
    ALLOW_PROCESSES: boolean;
    ERROR: ServerError;
    MESHCTL: string;
    NAME: string;
    STATUS: string;
    VERSION: string;
}

export interface ServerResponse {
    config: Config;
    controller: Controller;
    keys: Keys;
    provision: Provision;
    server: Server;
}