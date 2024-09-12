import os
import json

def reset_mesh_config(prov_db = None, local_node = None):
        print("reset_mesh_config: Called")
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"
        if not os.path.exists(meshctl_path):
            os.makedirs(meshctl_path)
        print("reset_mesh_config: using path " + meshctl_path)
        local_node_file = open("./resources/reset_config/local_node.json","r")
        prov_db_file = open("./resources/reset_config/prov_db.json","r")
        print("reset_mesh_config: Got necessary files")
        f = open(meshctl_path+"local_node.json","w")
        f.write(local_node or local_node_file.read())
        f.close()
        f = open(meshctl_path+"prov_db.json","w")
        f.write(prov_db or prov_db_file.read())
        f.close()
        print("reset_mesh_config: Finished job")

def remove_node_from_config(data):
        print("remove_node_from_config() called")
        home_path = os.path.expanduser('~')
        config_path = home_path + "/.config/meshctl/prov_db.json"
        file = open(config_path,"r")
        config = json.loads(file.read())
        file.close()
        if data["type"] == "unicastAddress":
                print(f'Trying to remove node {data["unicastAddress"]}')
                for index, node in enumerate(config["nodes"]):
                        for element in node["configuration"]["elements"]:
                                if element["unicastAddress"] == data["unicastAddress"]:
                                        del config["nodes"][index]
                                        file = open(home_path + "/.config/meshctl/prov_db.json","w")
                                        file.write(json.dumps(config))
                                        file.close()
                                        print("Success")
                                        return "Success"
        return "Couldn't find the entry"

