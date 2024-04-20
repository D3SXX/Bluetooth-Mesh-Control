import os
import json

def get_keys_data():
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"
        f = open(meshctl_path+"prov_db.json","r")
        mesh_info = json.loads(f.read())
        returned_obj = {}
        for node in mesh_info["nodes"]:
             returned_obj[node["deviceKey"]] = {
                     "configuration":node["configuration"],
                      "composition":node["composition"],
                      "IVindex":node["IVindex"],
                      "sequenceNumber":node["sequenceNumber"]
             }
        return json.dumps(returned_obj)
        