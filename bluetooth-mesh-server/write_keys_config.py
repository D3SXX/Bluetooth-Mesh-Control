import os
import json

def add_appkey(key):
        try:
                keyData = json.loads(key)
                
                if not keyData["key"]:
                        return "Cannot add an empty key!"
                elif not keyData["boundNetKey"]:
                        return "Cannot add a app key without bounded netkey!"
                
                home_path = os.path.expanduser('~')
                meshctl_path = home_path + "/.config/meshctl/"
                f = open(meshctl_path+"prov_db.json","r")
                mesh_info = json.loads(f.read())
                mesh_info["appKeys"].append({
                "index":len(mesh_info["appKeys"]),
                "boundNetKey":int(keyData["boundNetKey"]),
                "key":keyData["key"]
                })
                f.close()
                f = open(meshctl_path+"prov_db.json","w")
                f.write(json.dumps(mesh_info))
                f.close()
                
                return "Success"
        except Exception as e:
                return f"Failed: {e}"
        
def edit_appkey(key):
        try:
                keyData = json.loads(key)
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
                
                return "Success"
        except Exception as e:
                return f"Failed: {e}"
        
def remove_appkey(key):
        try:
                keyData = json.loads(key)
                home_path = os.path.expanduser('~')
                meshctl_path = home_path + "/.config/meshctl/"
                f = open(meshctl_path+"prov_db.json","r")
                mesh_info = json.loads(f.read())
                remove_index = None
                for i in range(0,len(mesh_info["appKeys"])):
                        if mesh_info["appKeys"][i]["index"] == keyData["index"]:
                                remove_index = i
                del mesh_info["appKeys"][remove_index]
                f.close()
                f = open(meshctl_path+"prov_db.json","w")
                f.write(json.dumps(mesh_info))
                f.close()
                
                return "Success"
        except Exception as e:
                return f"Failed: {e}"
        