import json
from flask import Blueprint, current_app, jsonify, make_response, request

from utils.read_prov_db import get_nodes_data
from utils.process import write_to_meshctl

import time
import os
import asyncio
import threading


config_bp = Blueprint('config_bp', __name__)


@config_bp.route('/config', methods=['GET', 'POST', 'DELETE'])
def handle_config():

    def run_async_in_thread(address, commandList, waitList, app_ctx):
        with app_ctx.app_context(): 
            asyncio.run(configure_mesh(address, commandList, waitList))

    if request.method == 'GET':

        status = request.args.get('query')

        if current_app.config['SERVER']['ERROR']['STATUS'] == False:
            current_app.config['CONFIG']['NODES'] = get_nodes_data()
            update_security()
        
        if status is None:
            return jsonify(current_app.config['CONFIG']), 200
        if not status in current_app.config['CONFIG']:
            return jsonify({status: "Invalid query parameter"}), 400

        response_value = {status:current_app.config['CONFIG'].get(status)}

        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
    
    elif request.method == 'POST':
        req_data = request.get_json()
        security_level = req_data.get("security_level")
        add_bind = req_data.get("add_bind")
        pub_set = req_data.get("pub_set")
        sub_add = req_data.get("sub_add")
        config = req_data.get("config")

        response_value = {}
        
        if security_level is not None:
            update_security(security_level)
            response_value = {
                "status": "success",
                "message": f"Security level is set to {security_level}",
                "SECURITY_LEVEL":security_level
            }
        elif add_bind:
            commandList = [f'appkey-add {add_bind["appKeyIndex"]}', f'bind {add_bind["elementIndex"]} {add_bind["appKeyIndex"]} {add_bind["modelValue"]}']
            threading.Thread(target=run_async_in_thread, args=(add_bind["unicastAddress"], commandList,[False, "Model App"],current_app._get_current_object())).start()
            response_value = {
                "status": "success",
                "message": f'Initiated add bind for node {add_bind["unicastAddress"]}',
                "SECURITY_LEVEL":security_level
            }
        elif pub_set:
            commandList = [f'appkey-add {pub_set["appKeyIndex"]}',f'pub-set {pub_set["elementAddress"]} {pub_set["address"][2:]} {pub_set["appKeyIndex"]} {pub_set["publicationPeriod"]} {pub_set["retransmissionCount"]} {pub_set["modelValue"]}']
            threading.Thread(target=run_async_in_thread, args=(pub_set["unicastAddress"], commandList,[False, "Publication"],current_app._get_current_object())).start()
            response_value = {
                "status": "success",
                "message": f'Initiated pub set for node {pub_set["unicastAddress"]}',
            }
        elif sub_add:
            commandList = [f'appkey-add {sub_add["appKeyIndex"]}',f'sub-add {sub_add["elementAddress"]} {sub_add["address"][2:]} {sub_add["modelValue"]}']
            threading.Thread(target=run_async_in_thread, args=(sub_add["unicastAddress"], commandList,[False, "Subscription"],current_app._get_current_object())).start()
            response_value = {
                "status": "success",
                "message": f'Initiated sub add for node {sub_add["unicastAddress"]}',
            }
        elif config:
            prov_db = config["prov_db"]
            local_node = config["local_node"]
            try:
                json.loads(prov_db)
                json.loads(local_node)
                reset_config([True,True],prov_db,local_node)
                current_app.config['SERVER']['ERROR']['STATUS'] = False
                response_value = {
                    "status": "success",
                    "message": "Succesfully edited config"
                }    
            except Exception as e:
                response_value = {
                    "status": "fail",
                    "message": f"Got error: {str(e)}",
                }                           
        else:
            response_value = {
                "status": "fail",
                "message": "Config request is empty or not found"
            }
        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 201
    elif request.method == 'DELETE':
        address = request.args.get('address')
        config = request.args.get('config')
        response_value = {}

        if address:
            threading.Thread(target=run_async_in_thread, args=(address, ["node-reset"],["reset"],current_app._get_current_object())).start()
            response_value = {
                "status": "success",
                "message": f"Initiated node removal for node {address}",
            }
        elif config:
            config = config.upper()
            reset = [False,False]
            if "PROV_DB" in config:
                reset[0] = True
            if "LOCAL_NODE" in config:
                reset[1] = True
            reset_config(reset)
            response_value = {
                "status": "Done",
                "message": f"Succesfully reset {config}",
            }
        else:
            return jsonify({"REMOVE_METHODS":["address=<UNICAST>","config=<PROV_DB, LOCAL_NODE>"]}), 421
        
        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
                    
def update_security(level = ""):
    if level != "" or current_app.config["CONFIG"]["SECURITY_LEVEL"] is None:
        current_app.config['TERMINAL_OUTPUT'] = []
        write_to_meshctl(f"security {level}\n")
        start = time.time()
        while "Level" not in "".join(current_app.config['TERMINAL_OUTPUT']):
            if time.time() - start > 5:
                print("update_security() - Timeout on getting data!")
                return
            time.sleep(0.1)
        end = time.time()
        print(f"update_security() - Took {end-start} s to receive the output")
        out = "".join(current_app.config['TERMINAL_OUTPUT']).split()
        index = len(out) - 1 - out[::-1].index('Level') + 3
        current_app.config["CONFIG"]["SECURITY_LEVEL"] = int(out[index])

async def configure_mesh(address, commandList, waitList):
    def stop(msg):
        write_to_meshctl("back\ndisconnect")
        current_app.config['CONFIG']["PROCESS"]["LOGS"].append(msg)
        current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 100
        current_app.config['CONFIG']["PROCESS"]["STATUS"] = False

    if current_app.config['CONFIG']["PROCESS"]["STATUS"] == True:
        return
    progressMax = 6 + len(commandList)
    progressIncrement = 100 / progressMax

    current_app.config['CONFIG']["PROCESS"]["STATUS"] = True
    current_app.config['TERMINAL_OUTPUT'].clear()
    current_app.config['CONFIG']["PROCESS"]["LOGS"] = []
    if current_app.config['TERMINAL_SESSIONS']['CONFIG']["STATUS"] is not True:
        current_app.config['TERMINAL_SESSIONS']['CONFIG']["STATUS"] = True
    
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Restarting controller")
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 0
    
    write_to_meshctl("power off")
    time.sleep(1)
    write_to_meshctl("power on")
    time.sleep(1)
    write_to_meshctl("connect")
    
    start = time.time()
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Trying to connect to the mesh network")
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] += progressIncrement

    while "Connection successful" not in "".join(current_app.config['TERMINAL_OUTPUT']):
        if time.time() - start > 10.0:
            stop("Reached timeout while trying...")
            return

    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Waiting for mesh session to open")
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] += progressIncrement
    start = time.time()

    while "Mesh session is open" not in "".join(current_app.config['TERMINAL_OUTPUT']):
        if time.time() - start > 5.0:
            stop("Reached timeout while trying...")
            return
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] += progressIncrement
    
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Openning configuration menu")
    write_to_meshctl("menu config")
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] += progressIncrement
    
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append(f"Trying to put target on node {address}")    
    write_to_meshctl(f"target {address}") 
    
    start = time.time()

    while "Configuring node" not in "".join(current_app.config['TERMINAL_OUTPUT']):
        if time.time() - start > 10.0:
            stop("Reached timeout while trying...")
            return
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = progressIncrement

    for i, command in enumerate(commandList):
        current_app.config['CONFIG']["PROCESS"]["LOGS"].append(f"Trying to {(command).split()[0]}") 
        write_to_meshctl(command)
        if waitList[i]: 
            while f"{waitList[i]} status Success" not in "".join(current_app.config['TERMINAL_OUTPUT']):
                if time.time() - start > 10.0:
                    stop("Reached timeout while trying...")
                    return
        else:
            time.sleep(1)
        current_app.config['CONFIG']["PROCESS"]["PROGRESS"] += progressIncrement
    
    if commandList[0] == "node-reset":
        current_app.config['CONFIG']["PROCESS"]["PROGRESS"] += progressIncrement
        current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Trying to remove node from prov_db")
        remove_node_from_config(address)

    stop("Success!")

def reset_config(reset, prov_db = None,local_node = None):
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"    
        if not os.path.exists(meshctl_path):
            os.makedirs(meshctl_path)
        local_node_file = open("./resources/reset_config/local_node.json","r")
        prov_db_file = open("./resources/reset_config/prov_db.json","r")
        if reset[1]:
            f = open(meshctl_path+"local_node.json","w")
            f.write(local_node or local_node_file.read())
            f.close()
        if reset[0]:
            f = open(meshctl_path+"prov_db.json","w")
            f.write(prov_db or prov_db_file.read())
            f.close()

def remove_node_from_config(address):
        home_path = os.path.expanduser('~')
        config_path = home_path + "/.config/meshctl/prov_db.json"
        file = open(config_path,"r")
        config = json.loads(file.read())
        file.close()
        print(f'Trying to remove node {address}')
        for index, node in enumerate(config["nodes"]):
                for element in node["configuration"]["elements"]:
                        if element["unicastAddress"] == address:
                                del config["nodes"][index]
                                file = open(home_path + "/.config/meshctl/prov_db.json","w")
                                file.write(json.dumps(config))
                                file.close()
                                print("Success")
                                return "Success"
        return "Couldn't find the entry"

async def reset_node_test(address, i, k):
    def stop(msg):
        current_app.config['CONFIG']["PROCESS"]["LOGS"].append(msg)
        current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 100
        current_app.config['CONFIG']["PROCESS"]["STATUS"] = False

    if current_app.config['CONFIG']["PROCESS"]["STATUS"] == True:
        return
    
    current_app.config['CONFIG']["PROCESS"]["STATUS"] = True
    current_app.config['TERMINAL_SESSIONS']['CONFIG']['OUTPUT'].clear()
    current_app.config['CONFIG']["PROCESS"]["LOGS"] = []
    if current_app.config['TERMINAL_SESSIONS']['CONFIG']["STATUS"] is not True:
        current_app.config['TERMINAL_SESSIONS']['CONFIG']["STATUS"] = True
    start = time.time()
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Trying to connect to the mesh network")
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 0
    while False:
        if time.time() - start > 15.0:
            stop("Reached timeout while trying...")
            print("".join(current_app.config['TERMINAL_OUTPUT']))
            return
    time.sleep(3)
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 25
    
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Openning configuration menu")
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 50
    
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append(f"Trying to put target on node {address}")    
    
    start = time.time()

    while False:
        if time.time() - start > 10.0:
            stop("Reached timeout while trying...")
            return
    time.sleep(3)
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 75

    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Trying to reset node") 

    while False:
        if time.time() - start > 10.0:
            stop("Reached timeout while trying...")
            return
    time.sleep(3)
    current_app.config['CONFIG']["PROCESS"]["PROGRESS"] = 100
    current_app.config['CONFIG']["PROCESS"]["LOGS"].append("Success!")
    current_app.config['CONFIG']["PROCESS"]["STATUS"] = False