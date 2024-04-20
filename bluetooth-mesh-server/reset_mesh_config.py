import os

def reset_mesh_config():
        print("reset_mesh_config: Called")
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"
        print("reset_mesh_config: using path " + meshctl_path)
        local_node_file = open("./resources/reset_config/local_node.json","r")
        prov_db_file = open("./resources/reset_config/prov_db.json","r")
        print("reset_mesh_config: Got necessary files")
        f = open(meshctl_path+"local_node.json","w")
        f.write(local_node_file.read())
        f.close()
        f = open(meshctl_path+"prov_db.json","w")
        f.write(prov_db_file.read())
        f.close()
        print("reset_mesh_config: Finished job")
