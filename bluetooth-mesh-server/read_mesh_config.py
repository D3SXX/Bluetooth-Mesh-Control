import os
import json

def get_nodes_data():
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"
        f = open(meshctl_path+"prov_db.json","r")
        mesh_info = json.loads(f.read())
        returned_obj = {}
        returned_obj["nodes"] = mesh_info["nodes"]
        returned_obj["appKeys"] = mesh_info["appKeys"]
        returned_obj =  add_company(returned_obj)
        return json.dumps(returned_obj)
        
def add_company(data):
        print("Trying to find ")
        try:
                with open("resources/company_identifiers/list.json", "r") as file:
                        company_identifiers = json.load(file)
                        for node in data["nodes"]:
                                cid = node["composition"]["cid"]
                                for identifier in company_identifiers["company_identifiers"]:
                                        if identifier["value"] == int(cid,16):
                                                node["composition"]["cidName"] = f"{cid} ({identifier['name']})"
                                                break
        finally:
                return data