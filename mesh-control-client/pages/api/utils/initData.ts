import { getSigData } from "./readProvdb"

export async function init()  {
    

    console.log("Initializing data for the first time..")

    const {companyIdentifiersData, mmdlModelUuidsData, meshModelUuidsData} = await getSigData()
    
    return {
    SERVER: {
    "STATUS": undefined,
    "VERSION": "1.0 (R.C. 1)",
    "NAME": "MeshControl",
    "ALLOW_PROCESSES":true,
    "MESHCTL": undefined,
    "ERROR":{"STATUS":false,
             "MESSAGE":undefined,
             "TYPE":undefined,
             "EXTRA_DATA":{}
             }
    },

    CONTROLLER: {
    "DEFAULT": "",
    "DEFAULT_INDEX":0,
    "POWER":undefined,
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
        "SECURITY_LEVEL":undefined,
        "NODES":[],
        "PROCESS":{"STATUS":false,"PROGRESS":0,"LOGS":[], "ERROR":false}
},

    KEYS:  {
        "APPKEYS":[],
        "NETKEYS":[]
},

    TERMINAL_SESSIONS : {
    "MESHCTL":{"STATUS":false, "OUTPUT":[], "PROCESS":null, "PROCESS_PID":"", "LOCK": false},
    "CONFIG":{"STATUS":false, "OUTPUT":[]},
    "CONTROLLER":{"STATUS":false, "OUTPUT":[]},
    "PROVISION":{"STATUS":false, "OUTPUT":[]},
    "SERVER":{"STATUS":false, "OUTPUT":[]},
},
    "COMPANY_IDENTIFIERS": companyIdentifiersData,
    "MMDL_MODEL_UUIDS": mmdlModelUuidsData,
    "MESH_MODEL_UUIDS": meshModelUuidsData,

    TERMINAL_OUTPUT:  []

}
}