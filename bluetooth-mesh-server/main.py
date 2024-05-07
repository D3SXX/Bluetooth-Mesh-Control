from send_command import  send_command
from reset_mesh_config import reset_mesh_config
from create_terminal import resolve_terminal_request
from read_mesh_config import get_nodes_data
from write_keys_config import add_appkey, edit_appkey, remove_appkey
from write_mesh_config import add_bind, add_pub, add_sub
from update_data import get_latest_data
from multiprocessing import Process, Queue
import json
import re
from flask import Flask, request
from flask_cors import CORS
import threading
import subprocess
import time
import os

data = {
        "local":{
                "meshctl-version":None,
                "app-version":"0.11",
                "adapter":{
                        "default-adapter":None,
                        "available-list":{}
                },
        },
        "nodes":{
                "unprovisioned-devices":{}
        },
        "requests":{
                
        }
}


def resolve_request(request,set_data):
        global provision_output
        if not "provision_output" in globals():
                provision_output = ""
        print("Resolving: " + request)
        match request:
                case "meshctl-version":
                        if not data["local"]["meshctl-version"]:
                                output = send_command("version",0)
                                pattern = r"Version\s+(\d+\.\d+)"
                                match = re.search(pattern, output)
                                data["local"]["meshctl-version"] = match.group(1)
                        return data["local"]["meshctl-version"]
                case "app-version":
                        return data["local"]["app-version"]
                case "status": 
                        return "Server is Working"
                case "default-adapter":
                        try:
                                if not data["local"]["adapter"]["default-adapter"]:
                                        output = send_command("list",0)
                                        pattern = r"Controller (\S+)\s+\S+\s+(?:#\d+\s+)?\[default\]"
                                        match = re.search(pattern, output)
                                        if match:
                                                data["local"]["adapter"]["default-adapter"] = match.group(1)
                                        else:
                                                return "Unknown"
                                return data["local"]["adapter"]["default-adapter"]
                        except Exception as e:
                                return "Error"
                case "set-list-adapters":
                        if set_data:
                                address = set_data[:set_data.rfind(":")]
                                data["local"]["adapter"]["default-adapter"] = address
                                print(address)
                                print(send_command(f"select {address}",0))
                        return "True"
                case "list-adapters":
                        output = send_command("list",0)
                        pattern = r"Controller (\S+)\s+\S+(?!\s+\[default\])"
                        matches = re.findall(pattern, output)
                        if matches:
                                for match in matches:
                                        data["local"]["adapter"]["available-list"][match] = "Available"
                                default = data["local"]["adapter"]["default-adapter"]
                                data["local"]["adapter"]["available-list"][default] = "Default"
                        else:
                                "No adapters were found"
                                return "Fail"
                        return data["local"]["adapter"]["available-list"]
                case "scan-unprovisioned-nodes":
                        global lock_calls
                        if "lock_calls" in globals() and lock_calls == True:
                                return "Cannot Scan while provisioniong"
                        output = send_command("discover-unprovisioned on",10)
                        f = open("logs/scan-unprovisioned-nodes.txt","w")
                        f.write(output)
                        f.close()
                        mesh_service_uuid_pattern = r'\[K		Mesh Provisioning Service \(([^"].*)\)'
                        device_uuid_pattern = r'\[K			Device UUID: ([^"].*)'
                        device_info_pattern = r'\[K\[\[0;92mNEW\[0m\] Device ([^\s]+) ([^"].*)'
                        mesh_service_uuid_matches = re.findall(mesh_service_uuid_pattern, output, re.MULTILINE)
                        device_uuid_matches = re.findall(device_uuid_pattern, output, re.MULTILINE)
                        device_info_matches = re.findall(device_info_pattern, output, re.MULTILINE)
                        if(mesh_service_uuid_matches):
                                uuid_list = []
                                i = 0
                                for match in device_uuid_matches:
                                        uuid_list.append(match)
                                if device_info_matches:
                                        for match in device_info_matches:
                                                mac_address = match[0]
                                                device_name = match[1]
                                                data["nodes"]["unprovisioned-devices"][uuid_list[i]] = {"device-name":device_name,"mac-address":mac_address}
                                                i += 1
                                else:
                                        data["nodes"]["unprovisioned-devices"][uuid_list[i]] = {"device-name":"Unknown","mac-address":"Unknown"}
                        if(data["nodes"]["unprovisioned-devices"]):
                                print(data["nodes"]["unprovisioned-devices"])
                                return data["nodes"]["unprovisioned-devices"]
                        else:
                                return "No devices were found."       
                case "provision":
                        provision_output = send_command(f"provision {set_data}",5)
                        return "Loading..."
                case "get-provision-output":
                        return provision_output or "Not available"
                case "reset-meshctl-config":
                        try:
                                reset_mesh_config()
                                return "Done"
                        except Exception as e:
                                return "Failed: " + e
                case "get-nodes-info":
                        try:
                                return get_nodes_data()
                        except:
                                return "Failed"
                case "get-keys-data":
                        try:
                                home_path = os.path.expanduser('~')
                                meshctl_path = home_path + "/.config/meshctl/"
                                f = open(meshctl_path+"prov_db.json","r")
                                return f.read()
                        except Exception as e:
                                return "Failed" + e
                case "add-appkey":
                        return add_appkey(set_data)
                case "edit-appkey":
                        return edit_appkey(set_data)
                case "remove-appkey":
                        return remove_appkey(set_data)
                case "add-bind":
                        return add_bind(set_data)
                case "add-pub":
                        return add_pub(set_data)
                case "add-sub":
                        return add_sub(set_data)
        return "Failed to find the data"


# app instance
app = Flask(__name__)
CORS(app)

# /api/home

@app.route("/api/data/<command>", methods=['POST'])
def return_data(command):
        print("/api/data/: got command: " + command)
        data = request.data.decode('utf-8')
        return resolve_request(command,data)

@app.route("/api/terminal/<command>", methods=['POST'])
def return_terminal(command):
        global lock_calls
        print("/api/terminal/: got command: " + command)
        if command == "start":
                lock_calls = True
        data = request.data.decode('utf-8')
        return_msg = resolve_terminal_request(command,data)
        if return_msg == "<Done>":
                lock_calls = False
        return return_msg
        
if __name__ == "__main__":
        print("Initializing")
        app.run(debug=True, port=10000)