import os from "os"
import * as fs from "fs"
import { json } from "stream/consumers"
import { NodeConfig } from "../../../app/interfaces/server"
import yaml from "yaml"

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
            "pid": "unknown",
            "vid": "unknown",
            "crpl": "unknown",
            "features": {
                "relay": "unknown",
                "proxy": "unknown",
                "friend": "unknown",
                "lpn": "unknown"
            },
            "elements": [
                {
                    "elementIndex": "unknown",
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
            if (parseInt(Number(data.nodes[i].composition.cid), 16) == global.DATA.COMPANY_IDENTIFIERS[k].value){
                data.nodes[i].composition.cidName =  global.DATA.COMPANY_IDENTIFIERS[k].name
                return data
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
    console.log("Getting SIG data..")
    const links = ["https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mmdl_model_uuids.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mesh_model_uuids.yaml"]
    const companyIdentifiers = await fetch(links[0])
    const companyIdentifiersData = yaml.parse(await companyIdentifiers.text()).company_identifiers
    const mmdlModelUuids = await fetch(links[1])
    const mmdlModelUuidsData = yaml.parse(await mmdlModelUuids.text()).mesh_model_uuids
    const meshModelUuids = await fetch(links[2])
    const meshModelUuidsData = yaml.parse(await meshModelUuids.text()).mesh_model_uuids
    return {companyIdentifiersData, mmdlModelUuidsData, meshModelUuidsData}
}
