from flask import Blueprint, current_app, jsonify, make_response, request

from read_prov_db import get_nodes_data
from process import write_to_meshctl
from custom_process import start_custom_meshctl, write_to_custom_meshctl

import time
import os

config_bp = Blueprint('config_bp', __name__)


@config_bp.route('/config', methods=['GET', 'POST', 'DELETE'])
def handle_config():
    if request.method == 'GET':

        current_app.config['CONFIG']['NODES'] = get_nodes_data(config_bp)
        update_security()
        
        status = request.args.get('query')
        
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
        response_value = {}
        if security_level is not None:
            update_security(security_level)
            response_value = {
                "status": "success",
                "message": f"Security level is set to {security_level}",
                "SECURITY_LEVEL":security_level
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
        query_params = request.args.getlist('query')
        response_value = {}
        if not query_params:
            return jsonify({"REMOVE_METHODS":["NODES"]}), 421
        for query in query_params:
            if "NODES" not in query:
                return jsonify({query: "Invalid query parameter"}), 400
            else:
                reset_config()
                response_value = {
                    "status": "success",
                    "message": "Reset meshctl config",
                }
        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200                
def update_security(level = ""):
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

def reset_config(prov_db = None,local_node = None):
        home_path = os.path.expanduser('~')
        meshctl_path = home_path + "/.config/meshctl/"    
        if not os.path.exists(meshctl_path):
            os.makedirs(meshctl_path)
        local_node_file = open("./resources/reset_config/local_node.json","r")
        prov_db_file = open("./resources/reset_config/prov_db.json","r")
        f = open(meshctl_path+"local_node.json","w")
        f.write(local_node or local_node_file.read())
        f.close()
        f = open(meshctl_path+"prov_db.json","w")
        f.write(prov_db or prov_db_file.read())
        f.close()

def add_bind(data):
    current_app.config['TERMINAL_SESSIONS']['CONFIG']['OUTPUT'].clear()
    if current_app.config['TERMINAL_SESSIONS']['CONFIG']["STATUS"] is not True:
        start_custom_meshctl("CONFIG")
        current_app.config['TERMINAL_SESSIONS']['CONFIG']["STATUS"] = True
    write_to_custom_meshctl("connect")
    start = time.time()

    while "Connection successful" not in "".join(current_app.config['TERMINAL_SESSIONS']['CONTROLLER']['OUTPUT']):
        
        if time.time() - start > 15.0:
            print("Reached timeout on update_controller()!")
            current_app.config['TERMINAL_SESSIONS']['CONTROLLER']["STATUS"] = False
            return
    write_to_custom_meshctl("menu config")    
    write_to_custom_meshctl(f"target ${data['unicastAddress']}") 
    
    start = time.time()

    while "Configuring node" not in "".join(current_app.config['TERMINAL_SESSIONS']['CONTROLLER']['OUTPUT']):
        
        if time.time() - start > 10.0:
            print("Reached timeout on update_controller()!")
            current_app.config['TERMINAL_SESSIONS']['CONTROLLER']["STATUS"] = False
            return    

    write_to_custom_meshctl(f"appkey-add {data['appKeyIndex']}")
    time.sleep(1)
