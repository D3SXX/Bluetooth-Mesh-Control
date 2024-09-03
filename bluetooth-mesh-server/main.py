from send_command import  send_command
from modify_mesh_config import reset_mesh_config
from create_terminal import resolve_terminal_request
from read_mesh_config import get_nodes_data, get_keys_data
from write_keys_config import add_appkey, edit_appkey, remove_appkey
from write_mesh_config import add_bind, add_pub, add_sub, reset_node
from get_controller import get_controller_data, get_controller_list
from scan_unprovisioned import start_discover, stop_discover
from provision_node import start_provision,stop_provision
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
        "Local":{
                "Meshctl-version":None,
                "App-version":"0.15",
                "Adapter":{
                        "Default-adapter":None,
                        "Available-list":{},
                        "Discovering":None
                },
                "Provisioning-status":False
        },
        "Nodes":{
                "Unprovisioned-devices":{},
                "Unprovisioned-nodes":[]
        },
        "Requests":{
                
        }
}

def init_controller_data():
        output_obj = get_controller_data()
        for key in output_obj:
                data["Local"]["Adapter"][key] = output_obj[key]

def resolve_request(request,set_data):
        global provision_output, provision_terminal_output
        if not "provision_terminal_output" in globals():
                provision_terminal_output = []
        if not "provision_output" in globals():
                provision_output = ""
        print("Resolving: " + request)
        match request:
                case "meshctl-version":
                        if not data["Local"]["Meshctl-version"]:
                                output = send_command("version",0)
                                pattern = r"Version\s+(\d+\.\d+)"
                                match = re.search(pattern, output)
                                data["Local"]["Meshctl-version"] = match.group(1)
                        return data["Local"]["Meshctl-version"]
                case "app-version":
                        return data["Local"]["App-version"]
                case "status": 
                        return "Server is Working"
                case "default-adapter":
                        try:
                                if not data["Local"]["Adapter"]["Default-adapter"]:
                                        init_controller_data()
                                return data["Local"]["Adapter"]["Default-adapter"]      
                        except Exception as e:
                                print(e)
                                return "Error"
                case "power-status":
                        init_controller_data()
                        if data["Local"]["Adapter"]["Powered"] == "yes":
                                return "true"
                        else:
                                return "false"
                case "power-toggle":
                        if data["Local"]["Adapter"]["Powered"] == "yes":
                                send_command("power off",0)
                                return "false"
                        else:
                                send_command("power on",0)
                                return "true"
                case "discovery-status":
                        init_controller_data()
                        if data["Local"]["Adapter"]["Discovering"] == "yes":
                                return "true"
                        else:
                                return "false"
                case "unprovisioned-scan-toggle":
                        if data["Local"]["Provisioning-status"] == True:
                                print("Cannot toggle unprovisioned scan: Provisioning status == true")
                                return "false"
                        if set_data == "true":
                                start_discover(data)
                        else:
                                stop_discover()
                        return resolve_request("discovery-status","")
                case "unprovisioned-scan-status":
                        return {"Status":"true" if data["Local"]["Adapter"]["Discovering"] == "yes" else "false","data":data["Nodes"]["Unprovisioned-nodes"]}
                case "provision-start":
                        if data["Local"]["Provisioning-status"] == True:
                                print("Cannot start provisioning, previous process is still active")
                                return "false"
                        print(f"Trying to provision UUID: {set_data}..",end="")
                        print("Cleaning previous output..",end="")
                        provision_terminal_output = []
                        print("Turning off discovery")
                        stop_discover()
                        print("Calling start_provision()")
                        data["Local"]["Provisioning-status"] = True
                        start_provision(set_data,provision_terminal_output, data)
                        return "true"
                case "get-provisioning-data":
                        return {"status":data["Local"]["Provisioning-status"], "data":provision_terminal_output}
                case "reset_unprovisioned_list":
                        data["Nodes"]["Unprovisioned-nodes"] = []
                        return "true"                          
                case "set-list-adapters":
                        if set_data:
                                address = set_data[:set_data.rfind(":")]
                                data["Local"]["Adapter"]["Default-adapter"] = address
                                print(address)
                                print(send_command(f"select {address}",0))
                        return "True"
                case "list-adapters":
                        data["Local"]["Adapter"]["Available-list"] = get_controller_list()
                        data["Local"]["Adapter"]["Available-list"][data["Local"]["Adapter"]["Default-adapter"]] = "Default"
                        if data["Local"]["Adapter"]["Available-list"]:
                                print(json.dumps(data["Local"]["Adapter"]))
                                return data["Local"]["Adapter"]["Available-list"]
                        else:
                                print("No adapters were found")
                                return "Fail"
                case "adapter-info":
                        try:
                                if not data["Local"]["Adapter"]["Default-adapter"]:
                                        init_controller_data()
                                return data["Local"]["Adapter"]
                        except Exception as e:
                                print(e)
                                return "Error"                        
                case "scan-unprovisioned-nodes":
                        global lock_calls
                        if "lock_calls" in globals() and lock_calls == True:
                                return "Cannot Scan while provisioniong"
                        output = send_command("discover-unprovisioned on",10)
                        send_command("discover-unprovisioned off",0.1)
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
                                                data["Nodes"]["Unprovisioned-devices"][uuid_list[i]] = {"device-name":device_name,"mac-address":mac_address}
                                                i += 1
                                else:
                                        data["Nodes"]["Unprovisioned-devices"][uuid_list[i]] = {"device-name":"Unknown","mac-address":"Unknown"}
                        if(data["Nodes"]["Unprovisioned-devices"]):
                                print(data["Nodes"]["Unprovisioned-devices"])
                                return data["Nodes"]["Unprovisioned-devices"]
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
                                return get_keys_data()
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
                case "reset-node":
                        return reset_node(set_data)
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