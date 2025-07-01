import os from "os"
import * as fs from "fs"
import { NodeConfig } from "../../../interfaces/global"
import yaml from "yaml"
import Debug from "./debug"

const defaultNode =  {
        "deviceKey": "unknown",
        "configuration": {
            "netKeys": ["unknown"],
            "elements": [
                {
                    "elementIndex": "unknown",
                    "unicastAddress": "unknown"
                }
            ]
        },
        "composition": {
            "cid": "unknown",
            "cidName": "unknown",
            "pid": "unknown",
            "vid": "unknown",
            "crpl": "unknown",
            "features": {
                "relay": false,
                "proxy": false,
                "friend": false,
                "lpn": false
            },
            "elements": [
                {
                    "elementIndex": 0,
                    "location": "unknown",
                    "models": ["unknown"],
                    "modelsName":[]
                }
            ]
        },
        "IVindex": "unknown",
        "sequenceNumber": "unknown"
    }

export function loadConfig(){
    const homePath = os.homedir()
    const meshctlProvdb = `${homePath}/.config/meshctl/prov_db.json`
    const data = fs.readFileSync(meshctlProvdb, "utf8")
    return JSON.parse(data)
}

export function getNodes(){
    let data;
    try{
        data = loadConfig()
    }
    catch{
        return
    }

    let obj: NodeConfig = {"STATUS":true, "nodes":[], "appKeys":[], "netKeys":[]}
    obj.nodes = data.nodes ? data.nodes : []
    obj.appKeys = data.appKeys ? data.appKeys : []
    obj.netKeys = data.netKeys ? data.netKeys : []
    for (let i = 0; i < obj.nodes.length; i++){
            if (obj.nodes[i].composition === undefined){
                obj.nodes[i].composition = defaultNode.composition;
            }
        obj.nodes[i].composition.cidName = obj.nodes[i].composition.cid
    }
    obj = addCompany(obj)
    obj = addModelName(obj)
    return obj
} 

function addCompany(data: NodeConfig){
    for (let i = 0; i < data.nodes.length; i++){
        for (let k = 0; k < global.DATA.COMPANY_IDENTIFIERS.length; k++){
            if (parseInt(data.nodes[i].composition.cid, 16) == global.DATA.COMPANY_IDENTIFIERS[k].value){
                data.nodes[i].composition.cidName =  global.DATA.COMPANY_IDENTIFIERS[k].name
                break
            }
        }
    }
    return data
}

function addModelName(data: NodeConfig){

    for (let i = 0; i < data.nodes.length; i++){
        for (let k = 0; k < data.nodes[i].composition.elements.length; k++){
            const models = data.nodes[i].composition.elements[k].models
            if (!data.nodes[i].composition.elements[k].modelsName){
                data.nodes[i].composition.elements[k].modelsName = []
            }
            for (let j = 0; j < models.length; j++){
                if (global.DATA.MESH_MODEL_UUIDS[Number(models[j])] != undefined){
                    data.nodes[i].composition.elements[k].modelsName.push(global.DATA.MESH_MODEL_UUIDS[Number(models[j])].name)
                    continue
                }
                for (let mmdlIndex = 0; mmdlIndex < global.DATA.MMDL_MODEL_UUIDS.length; mmdlIndex++){
                    if (parseInt(models[j],16) == global.DATA.MMDL_MODEL_UUIDS[mmdlIndex].uuid){
                        data.nodes[i].composition.elements[k].modelsName.push(global.DATA.MMDL_MODEL_UUIDS[mmdlIndex].name)
                        break
                    }
                }
     }
}
}
    return data
}


export async function getSigData(){
    
    const links = ["https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mmdl_model_uuids.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mesh_model_uuids.yaml"]
    const companyIdentifiers = await fetch(links[0])
    const companyIdentifiersData = yaml.parse(await companyIdentifiers.text()).company_identifiers
    const mmdlModelUuids = await fetch(links[1])
    const mmdlModelUuidsData = yaml.parse(await mmdlModelUuids.text()).mesh_model_uuids
    const meshModelUuids = await fetch(links[2])
    const meshModelUuidsData = yaml.parse(await meshModelUuids.text()).mesh_model_uuids
    return {companyIdentifiersData, mmdlModelUuidsData, meshModelUuidsData}
}

export function getKeysData() {
    const keysInfo = loadConfig();
    
    const returnedObj = {
        APPKEYS: keysInfo.appKeys || [],
        NETKEYS: keysInfo.netKeys || [],
        BIND: {} as Record<string, { MODEL: string; APPKEY_INDEX: number }>,
        PUBLISH: {} as Record<string, { ADDRESS: string; APPKEY_INDEX: number; TTL: number }>,
        SUBSCRIBE: {} as Record<string, { ADDRESS_LIST: string[] }>
    };

    const nodes = keysInfo.nodes || [];
    
    for (const node of nodes) {
        // Process netKeys assignments
        if (node.configuration?.netKeys) {
            for (const key of node.configuration.netKeys) {
                const index = parseInt(key, 16);
                
                if (returnedObj.NETKEYS[index]) {
                    // Initialize ASSIGNED_NODES if it doesn't exist
                    if (!returnedObj.NETKEYS[index].ASSIGNED_NODES) {
                        returnedObj.NETKEYS[index].ASSIGNED_NODES = [];
                    }
                    returnedObj.NETKEYS[index].ASSIGNED_NODES.push(node.deviceKey);
                    
                    // Initialize ASSIGNED_NODES_UNICAST_ADDRESS if it doesn't exist
                    if (!returnedObj.NETKEYS[index].ASSIGNED_NODES_UNICAST_ADDRESS) {
                        returnedObj.NETKEYS[index].ASSIGNED_NODES_UNICAST_ADDRESS = [];
                    }
                    returnedObj.NETKEYS[index].ASSIGNED_NODES_UNICAST_ADDRESS.push(
                        node.configuration.elements[0].unicastAddress
                    );
                }
            }
        }
        
        // Process elements for bind, publish, subscribe
        if (node.configuration?.elements) {
            for (const element of node.configuration.elements) {
                if (!element.models) {
                    break;
                }
                
                for (const model of element.models) {
                    // Process bind
                    if (model.bind) {
                        returnedObj.BIND[element.unicastAddress] = {
                            MODEL: model.modelId,
                            APPKEY_INDEX: parseInt(model.bind[0])
                        };
                    }
                    
                    // Process publish
                    if (model.publish) {
                        returnedObj.PUBLISH[element.unicastAddress] = {
                            ADDRESS: model.publish.address,
                            APPKEY_INDEX: parseInt(model.publish.index),
                            TTL: model.publish.ttl
                        };
                    }
                    
                    // Process subscribe
                    if (model.subscribe) {
                        returnedObj.SUBSCRIBE[element.unicastAddress] = {
                            ADDRESS_LIST: model.subscribe
                        };
                    }
                }
            }
        }
    }
    
    return returnedObj;
}
