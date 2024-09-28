import os
import json
import re
import time

import requests
import yaml

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
        get_sig_data()
        try:
            with open(meshctl_path+"prov_db.json","r",encoding="utf-8") as file:
                return json.loads(file.read())
        except Exception:
               current_app.config["CONFIG"]["ERROR"] = True  

def get_keys_data(current_app):
        keys_info = load_config(current_app)
        returned_obj = {}
        returned_obj["APPKEYS"] = keys_info["appKeys"] if "appKeys" in keys_info else []
        returned_obj["NETKEYS"] = keys_info["netKeys"] if "netKeys" in keys_info else []
        returned_obj["BIND"] = {}
        returned_obj["PUBLISH"] = {}
        returned_obj["SUBSCRIBE"] = {}
        nodes = keys_info["nodes"] if "nodes" in keys_info else []
        for node in nodes:
                if "netKeys" in node["configuration"]:
                        for key in node["configuration"]["netKeys"]:
                                index = int(key,16)
                                if "ASSIGNED_NODES" not in returned_obj["NETKEYS"][index]:
                                        returned_obj["NETKEYS"][index]["ASSIGNED_NODES"] = []
                                returned_obj["NETKEYS"][index]["ASSIGNED_NODES"].append(node["deviceKey"])
                for element in node["configuration"]["elements"]:
                        if not "models" in element:
                               break
                        for model in element["models"]:
                                if "bind" in model:
                                        returned_obj["BIND"][element["unicastAddress"]] = {
                                        "MODEL":model["modelId"],
                                        "APPKEY_INDEX":int(model["bind"][0])
                                        }
                                if "publish" in model:
                                        returned_obj["PUBLISH"][element["unicastAddress"]] = {
                                        "ADDRESS":model["publish"]["address"],
                                        "APPKEY_INDEX":int(model["publish"]["index"]),
                                        "TTL":model["publish"]["ttl"]
                                        }
                                if "subscribe" in model:
                                        returned_obj["SUBSCRIBE"][element["unicastAddress"]] = {
                                        "ADDRESS_LIST":model["subscribe"],
                                        }                                                                              
        return returned_obj

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
        except Exception as e:
               print(f"add_company() - error: {e}")
               for node in data["nodes"]:
                      node["composition"]["cidName"] = node["composition"]["cid"]                      
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
        
def fetch_sig_data(link,title):
        try:
                response = requests.get(link)
                response.raise_for_status()
                data = response.text
                print(".",end="")
                f = open(f"resources/sig_data/{title}.yaml","w")
                f.write(data)
                f.close()
                print(".",end="")
                pattern = re.compile(r'[^\x09\x0A\x0D\x20-\x7E]') # https://yaml.org/spec/1.1/#id868524
                data_object = yaml.safe_load(pattern.sub('', data))
                f = open(f"resources/sig_data/{title}.json","w")
                f.write(json.dumps(data_object))
                f.close()
                print(".",end="")
                print(" Success!")
        except Exception as e:
                print(" Fail!")
                print(e)         
                          
def get_sig_data():
        
        title_arr = ["company_identifiers","mmdl_model_uuids","mesh_model_uuids"]
        link_arr = ["https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mmdl_model_uuids.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mesh_model_uuids.yaml"]
        current_time = time.time()

        if not os.path.isdir("resources/sig_data"):
                os.mkdir("resources/sig_data")
                print("Created folder for sig_data")
        
        time_record = {}

        try:
              f = open("resources/sig_data/fetch_record.json","r")
              file = json.loads(f.read())      
              f.close()
              for title in title_arr:
                   time_record[title] = file[title]
        except Exception as e:
                for title in title_arr:
                      time_record[title] = 0
                f = open("resources/sig_data/fetch_record.json", "w")
                f.write(json.dumps(time_record))
                f.close()  

        for i, link in enumerate(link_arr):
                if time.time() - time_record[title_arr[i]] > 86400:
                    print(f"Trying to fecth the latest {title_arr[i]} data",end="")
                    fetch_sig_data(link,title_arr[i])
                    time_record[title_arr[i]] = time.time()
        f = open("resources/sig_data/fetch_record.json", "w")
        f.write(json.dumps(time_record))
        f.close()
          


