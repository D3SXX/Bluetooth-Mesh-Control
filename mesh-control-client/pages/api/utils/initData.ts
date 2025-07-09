import Debug from "./debug";
import { getSigData } from "./readProvdb"

export async function init()  {
    
    const {companyIdentifiersData, mmdlModelUuidsData, meshModelUuidsData} = await getSigData()
     
    return {
    SERVER: {
    "STATUS": false,
    "VERSION": "1.0 (R.C. 1)",
    "NAME": "MeshControl",
    "ALLOW_PROCESSES":true,
    "BLUEZ": {
        "MESHCTL": {
        "VERSION": "Unknown",
        "IS_NEWER_VERSION": false,
        "IS_UNKNOWN_VERSION": false,
        },
        "MESH_CFGCLIENT": {
            "VERSION": "Unknown",
            "IS_NEWER_VERSION": false,
            "IS_UNKNOWN_VERSION": false,
        },
        "LATEST_VERSION": {
            "VERSION": "Unknown",
            "CHANGELOG": "",
            "RELEASE_DATE": "",
            "RELEASE_URL": ""
        }
    },
    "ERROR":{"STATUS":false,
             "MESSAGE": "",
             "TYPE": "",
             "EXTRA_DATA":{}
             },
    "LOGS": [],
    "LOGS_SETTINGS": {
        "ENABLE_LOGS": true,
        "ENABLE_CONSOLE_LOGS": true,
        "CAPTURE_PROCESSES": true,
        "CAPTURE_REQUESTS": true,
        "LOGS_LIMIT": 1000
    },
    "TOASTS": [],
    "TOAST_SETTINGS": {
        "ENABLE_TOASTS": true,
        "SHOW_DATA": {
            "INFO": false,
            "ERROR": true,
            "WARNING": false,
            "SUCCESS": true
        },
        "TIMEOUT": 5000,
        "POSITION": {
            "VERTICAL": "bottom",
            "HORIZONTAL": "right"
        }
    }
    },

    CONTROLLER: {
    "DEFAULT": "",
    "DEFAULT_INDEX":0,
    "POWER": false,
    "LIST":{},
    "PROCESS":{"STATUS":false}
},

    PROVISION:  {
        "SCAN_ACTIVE":false,
        "USE_FAILBACK_SCAN":false,
        "UNPROVISIONED_NODES":{},
        "PROCESS":{"STATUS":false, "PROGRESS":0, "LOGS":[], "ERROR":false, "START_TIME":0.0}
},

    CONFIG: {
        "SECURITY_LEVEL":1, // No need to get the value from meshctl, it is the same for every new instance
        "NODES":{
            "nodes":[],
            "appKeys":[],
            "netKeys":[]
        },
        "PROCESS":{"STATUS":false,"PROGRESS":0,"LOGS":[], "ERROR":false}
},

    KEYS:  {
        "APPKEYS":[],
        "NETKEYS":[],
        "BIND": {},
        "PUBLISH": {},
        "SUBSCRIBE": {}
},

    TERMINAL_SESSIONS : {
    "MESHCTL":{"STATUS":false, "OUTPUT":[], "PROCESS":null, "PROCESS_PID": null, "LOCK": false},
    "CONFIG":{"STATUS":false, "OUTPUT":[], "LOCK": false},
    "CONTROLLER":{"STATUS":false, "OUTPUT":[], "LOCK": false},
    "PROVISION":{"STATUS":false, "OUTPUT":[], "LOCK": false},
    "SERVER":{"STATUS":false, "OUTPUT":[], "LOCK": false},
},
    "COMPANY_IDENTIFIERS": companyIdentifiersData,
    "MMDL_MODEL_UUIDS": mmdlModelUuidsData,
    "MESH_MODEL_UUIDS": meshModelUuidsData,

    TERMINAL_OUTPUT:  []

}
}

// Empty data structure (for Edge Runtime)
export function initBasic() {
    Debug.log("Initializing basic data structure (Edge Runtime compatible)..", "INFO", "InitData");
    
    return {
    SERVER: {
    "STATUS": false,
    "VERSION": "1.0 (R.C. 1)",
    "NAME": "MeshControl",
    "ALLOW_PROCESSES":true,
    "MESHCTL": "",
    "ERROR":{"STATUS":false,
             "MESSAGE": "",
             "TYPE": "",
             "EXTRA_DATA":{}
             }
    },

    CONTROLLER: {
    "DEFAULT": "",
    "DEFAULT_INDEX":0,
    "POWER": false,
    "LIST":{},
    "PROCESS":{"STATUS":false}
},

    PROVISION:  {
        "SCAN_ACTIVE":false,
        "USE_FAILBACK_SCAN":false,
        "UNPROVISIONED_NODES":{},
        "PROCESS":{"STATUS":false, "PROGRESS":0, "LOGS":[], "ERROR":false, "START_TIME":0.0}
},

    CONFIG: {
        "SECURITY_LEVEL":null,
        "NODES":[],
        "PROCESS":{"STATUS":false,"PROGRESS":0,"LOGS":[], "ERROR":false}
},

    KEYS:  {
        "APPKEYS":[],
        "NETKEYS":[],
        "BIND": {},
        "PUBLISH": {},
        "SUBSCRIBE": {}
},

    TERMINAL_SESSIONS : {
    "MESHCTL":{"STATUS":false, "OUTPUT":[], "PROCESS":null, "PROCESS_PID": null, "LOCK": false},
    "CONFIG":{"STATUS":false, "OUTPUT":[], "LOCK": false},
    "CONTROLLER":{"STATUS":false, "OUTPUT":[], "LOCK": false},
    "PROVISION":{"STATUS":false, "OUTPUT":[], "LOCK": false},
    "SERVER":{"STATUS":false, "OUTPUT":[], "LOCK": false},
},
    "COMPANY_IDENTIFIERS": [],
    "MMDL_MODEL_UUIDS": [],
    "MESH_MODEL_UUIDS": [],

    TERMINAL_OUTPUT:  []

}
}