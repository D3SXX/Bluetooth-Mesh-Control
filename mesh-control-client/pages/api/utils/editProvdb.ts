import fs from 'fs';
import os from 'os';

interface AppKey {
  index: number;
  boundNetKey: number;
  key: string;
}

interface MeshInfo {
  appKeys: AppKey[];
  [key: string]: any;
}

interface KeyData {
  index: string | number;
  boundNetKey: string | number;
  key: string;
}

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
    const meshInfo: MeshInfo = JSON.parse(fileContent);
    
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

export function editAppkey(keyData: KeyData): string {
  try {
    if (!keyData.key) {
      return "Cannot edit an empty key!";
    }

    const fileContent = fs.readFileSync(meshctlProvdb, 'utf8');
    const meshInfo: MeshInfo = JSON.parse(fileContent);
    
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
    const meshInfo: MeshInfo = JSON.parse(fileContent);

    if (index >= meshInfo.appKeys.length || index < 0) {
      return "Invalid key index!";
    }

    const removedKey = meshInfo.appKeys[index];
    meshInfo.appKeys.splice(index, 1);
    
    fs.writeFileSync(meshctlProvdb, JSON.stringify(meshInfo));
    
    return `Successfully removed a key: ${removedKey.key}`;
  } catch (e) {
    return `Failed: ${e}`;
  }
}
