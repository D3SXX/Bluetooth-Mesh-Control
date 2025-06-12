import { getSigData } from "./readProvdb"
import fs from "fs"
import path from "path"

export async function init()  {
    

    console.log("Initializing data for the first time..")

    console.log(global["DATA"])
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
    "DEFAULT_DATA":{"UUID":{}},
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