import fs from 'fs';
import os from 'os';

import {NodesConfig, AppKey} from '../../../interfaces/global'

const homePath = os.homedir()
const meshctlProvdb = `${homePath}/.config/meshctl/prov_db.json`

export function addAppkey(key: string, bound: string | number): string {
  try {
    if (!key) {
      return "Cannot add an empty key!";
    }
    if (!bound) {
      return "Cannot add a app key without bounded netkey!";
    }

    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);
    
    meshInfo.appKeys.push({
      index: meshInfo.appKeys.length,
      boundNetKey: parseInt(bound.toString()),
      key: key
    });
    
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
    
    return `Successfully added a new key: ${key}`;
  } catch (e) {
    return `Failed: ${e}`;
  }
}

export function editAppkey(keyData: AppKey): string {
  try {
    if (!keyData.key) {
      return "Cannot edit an empty key!";
    }

    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);
    
    let editIndex: number | null = null;
    for (let i = 0; i < meshInfo.appKeys.length; i++) {
      console.log(meshInfo.appKeys[i].index, keyData.index);
      if (meshInfo.appKeys[i].index === parseInt(keyData.index.toString())) {
        editIndex = i;
        break;
      }
    }
    
    if (editIndex === null) {
      return "Key index not found!";
    }
    
    console.log(editIndex);
    meshInfo.appKeys[editIndex] = {
      index: parseInt(keyData.index.toString()),
      boundNetKey: parseInt(keyData.boundNetKey.toString()),
      key: keyData.key
    };
    
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
    
    return `Successfully edited a key ${editIndex}: ${keyData.key}`;
  } catch (e) {
    return `Failed: ${e}`;
  }
}

export function removeAppkey(index: number): string {
  try {
    
    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);

    if (index >= meshInfo.appKeys.length || index < 0) {
      return "Invalid key index!";
    }

    meshInfo.appKeys.splice(index, 1);
    global.DATA.CONFIG.NODES.appKeys = meshInfo.appKeys;
    global.DATA.KEYS.APPKEYS = meshInfo.appKeys;
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
    
    return `Successfully removed a key: ${index}`;
  } catch (e) {
    return `Failed: ${e}`;
  }
}

export function removeNode(address: string) {
  try {
    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);
   for (let i = 0; i < meshInfo.nodes.length; i++) {
    for (let j = 0; j < meshInfo.nodes[i].configuration.elements.length; j++) {
      if (meshInfo.nodes[i].configuration.elements[j].unicastAddress === address) {
        meshInfo.nodes.splice(i, 1);
        global.DATA.CONFIG.NODES.nodes = meshInfo.nodes;
        fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
        return "Node removed!";
      }
    }
   }
   return "Node not found!";
  } catch (e) {
    return `Failed: ${e}`;
  }
}

export function resetNodesList() {
  try {
    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);
    meshInfo.nodes = [];
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
  } catch (e) {
    return `Failed: ${e}`;
  }
}

export function resetAppkeysList() {
  try {
    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);
    meshInfo.appKeys = [];
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
  } catch (e) {
    return `Failed: ${e}`;
  }
}

export function resetNetkeysList() {
  try {
    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: NodesConfig = JSON.parse(fileContent);
    meshInfo.netKeys = [];
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
  } catch (e) {
    return `Failed: ${e}`;
  }
}