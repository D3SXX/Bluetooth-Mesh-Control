import { getSigData } from "./readProvdb"

export async function init()  {
    

    console.log("Initializing data for the first time..")

    const {companyIdentifiersData, mmdlModelUuidsData, meshModelUuidsData} = await getSigData()
    
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
    console.log("Initializing basic data structure (Edge Runtime compatible)..")
    
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