import os
import json

def default_node():
    return {
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
                    "models": ["unknown"]
                }
            ]
        },
        "IVindex": "unknown",
        "sequenceNumber": "unknown"
    }

def load_config(current_app):
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"
        try:
            with open(meshctl_path+"prov_db.json","r",encoding="utf-8") as file:
                return json.loads(file.read())
        except Exception:
               current_app.config["CONFIG"]["ERROR"] = True  

def get_nodes_data(current_app):
        mesh_info = load_config(current_app)
        returned_obj = {}
        returned_obj["nodes"] = mesh_info["nodes"] if "nodes" in mesh_info else []
        returned_obj["appKeys"] = mesh_info["appKeys"] if "appKeys" in mesh_info else []
        returned_obj =  add_company(returned_obj)
        returned_obj = add_model_name(returned_obj)
        default = default_node()
        for i, node in enumerate(returned_obj["nodes"]):
                if "composition" not in node:
                     returned_obj["nodes"][i]["composition"] = default["composition"]
        return returned_obj

def add_company(data):
        try:
                with open("resources/sig_data/company_identifiers.json", "r",encoding="utf-8") as file:
                        company_identifiers = json.load(file)
                        for node in data["nodes"]:
                                cid = node["composition"]["cid"]
                                print(f"Trying to find company name for cid {cid}",end="... ")
                                for identifier in company_identifiers["company_identifiers"]:
                                        if identifier["value"] == int(cid,16):
                                                node["composition"]["cidName"] = f"{cid} ({identifier['name']})"
                                                print(identifier['name'])
                                                break
        finally:                
                return data
        
def add_model_name(data):
        try:
                mmdl_file = open("resources/sig_data/mmdl_model_uuids.json", "r",encoding="utf-8")
                mesh_file = open("resources/sig_data/mesh_model_uuids.json", "r",encoding="utf-8")
                mmdl_models = json.load(mmdl_file)
                mesh_models = json.load(mesh_file)
                for node in data["nodes"]:
                        for element in node["composition"]["elements"]:
                                model_names = []
                                for model in element["models"]:
                                        for item in mmdl_models["mesh_model_uuids"]:
                                                if int(item["uuid"]) == int(model,16):
                                                        model_names.append(item["name"])
                                        for item in mesh_models["mesh_model_uuids"]:
                                                if int(item["uuid"]) == int(model,16):
                                                        model_names.append(item["name"])
                                element["model_names"] = model_names
        except Exception as e:
                print(e)                           
        finally:                
                return data
        

