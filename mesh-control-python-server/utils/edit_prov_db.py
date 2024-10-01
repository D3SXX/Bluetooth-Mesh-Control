import os
import json

def add_appkey(key, bound):
        try:
                if not key:
                        return "Cannot add an empty key!"
                elif not bound:
                        return "Cannot add a app key without bounded netkey!"
                
                home_path = os.path.expanduser('~')
                meshctl_path = home_path + "/.config/meshctl/"
                f = open(meshctl_path+"prov_db.json","r")
                mesh_info = json.loads(f.read())
                mesh_info["appKeys"].append({
                "index":len(mesh_info["appKeys"]),
                "boundNetKey":int(bound),
                "key":key
                })
                f.close()
                f = open(meshctl_path+"prov_db.json","w")
                f.write(json.dumps(mesh_info))
                f.close()
                
                return f"Succesfully added a new key: {key}"
        except Exception as e:
                return f"Failed: {e}"
        
def edit_appkey(keyData):
        try:
                if not keyData["key"]:
                        return "Cannot edit an empty key!"
                
                home_path = os.path.expanduser('~')
                meshctl_path = home_path + "/.config/meshctl/"
                f = open(meshctl_path+"prov_db.json","r")
                mesh_info = json.loads(f.read())
                edit_index = None
                for i in range(0,len(mesh_info["appKeys"])):
                        print(mesh_info["appKeys"][i]["index"],keyData["index"])
                        if mesh_info["appKeys"][i]["index"] == int(keyData["index"]):
                                edit_index = i
                print(edit_index)
                mesh_info["appKeys"][edit_index] = { 
                "index":int(keyData["index"]),
                "boundNetKey":int(keyData["boundNetKey"]),
                "key":keyData["key"]
                }
                f.close()
                f = open(meshctl_path+"prov_db.json","w")
                f.write(json.dumps(mesh_info))
                f.close()
                
                return f"Succesfully edited a key {edit_index}: {keyData['key']}"
        except Exception as e:
                return f"Failed: {e}"
        
def remove_appkey(index):
        try:
                home_path = os.path.expanduser('~')
                meshctl_path = home_path + "/.config/meshctl/"
                f = open(meshctl_path+"prov_db.json","r")
                mesh_info = json.loads(f.read())

                removed_key = mesh_info["appKeys"][index]
                del mesh_info["appKeys"][index]
                
                f.close()
                f = open(meshctl_path+"prov_db.json","w")
                f.write(json.dumps(mesh_info))
                f.close()
                
                return f"Succesfully removed a key: {removed_key['key']}"
        except Exception as e:
                return f"Failed: {e}"
        