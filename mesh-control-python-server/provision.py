import time

from flask import Blueprint, current_app, jsonify, make_response, request
from utils.process import write_to_meshctl



provision_bp = Blueprint('provision_bp', __name__)


@provision_bp.route('/provision', methods=['GET', 'POST', 'DELETE'])
def handle_config():
    if request.method == 'GET':
        
        query_params = request.args.getlist('query')

        if current_app.config['PROVISION']["SCAN_ACTIVE"]:
            if current_app.config['PROVISION']["USE_FAILBACK_SCAN"]:
                failback_scan()
            else:
                normal_scan()
        if current_app.config['PROVISION']["PROVISION_ACTIVE"]:
            node_provision_output()
            stop_node_provision()

        response_value = {}

        if not query_params:
            return jsonify(current_app.config['PROVISION']), 200
        
        for query in query_params:
            if query not in current_app.config['PROVISION']:
                return jsonify({query: "Invalid query parameter"}), 400
            response_value[query] = current_app.config['PROVISION'].get(query)


        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200

    elif request.method == 'POST':
        req_data = request.get_json()
        discovery_status = req_data.get('discovery')
        failback_scan_status = req_data.get('failback_scan')
        provision_node = req_data.get('provision_node')

        if discovery_status is not None:
            if discovery_status == "any":
                discovery_status = not current_app.config['PROVISION']['SCAN_ACTIVE']
            scan_unprovisioned(discovery_status)
            response = {
                "status": "success",
                "message": f"Discovery status is set to {discovery_status}"
            }
        elif failback_scan_status is not None:
            if failback_scan_status == "any":
                current_app.config['PROVISION']['USE_FAILBACK_SCAN'] = not current_app.config['PROVISION']['USE_FAILBACK_SCAN']
            else:
                current_app.config['PROVISION']['USE_FAILBACK_SCAN'] = failback_scan_status
            restart_scan()
            response = {
                "status": "success",
                "message": f"Failback scan status is set to {current_app.config['PROVISION']['USE_FAILBACK_SCAN']}",
                "USE_FAILBACK_SCAN": current_app.config['PROVISION']['USE_FAILBACK_SCAN']
            }            
        elif provision_node:
            start_node_provision(provision_node)
            response = {
                "status": "success",
                "message": f"Started provisioning for node {provision_node}"
            }
        else:
            response = {
                "status": "fail",
                "message": "Provision request is empty or not found"
            }              
        return jsonify(response), 201
    elif request.method == "DELETE":
        address = request.args.get('address')
        unprovisioned = request.args.get('reset')
        response_value = {}

        if unprovisioned:
            current_app.config['PROVISION']["UNPROVISIONED_NODES"].clear()
            restart_scan()
            response_value = {
                "status": "success",
                "message": "Deleted unprovisioned nodes list",
                "UNPROVISIONED_NODES":current_app.config['PROVISION']['UNPROVISIONED_NODES']
            }
        else:
            return jsonify({"REMOVE_METHODS":["unprovisioned"]}), 421
        
        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
            
def restart_scan():
    write_to_meshctl("discover-unprovisioned off")
    time.sleep(0.1)
    current_app.config['TERMINAL_OUTPUT'].clear()
    write_to_meshctl("discover-unprovisioned on")

def start_node_provision(node):
    scan_unprovisioned(False)
    current_app.config['PROVISION']['PROVISION_ACTIVE'] = True
    current_app.config['PROVISION']["UNPROVISIONED_NODES"].clear()
    current_app.config['PROVISION']['PROVISION_START_TIME'] = time.time()
    write_to_meshctl(f"provision {node}")

def stop_node_provision():
    error_arr = ["Failed to connect:","Stale services? Remove device and re-discover","Services resolved no","Could not find device proxy"]
    out = "".join(current_app.config['PROVISION']['PROVISION_OUTPUT'])
    if time.time() - current_app.config['PROVISION']['PROVISION_START_TIME'] >= 60:
        current_app.config['PROVISION']['PROVISION_ACTIVE'] = False
        current_app.config['PROVISION']['PROVISION_STATUS'] = "Provision failed on timeout!"
    for error in error_arr:
        if error in out:
            current_app.config['PROVISION']['PROVISION_ACTIVE'] = False
            current_app.config['PROVISION']['PROVISION_STATUS'] = "Provision failed on error!"
    if "Provision success." in out:
        time.sleep(5)
        current_app.config['PROVISION']['PROVISION_ACTIVE'] = False
        current_app.config['PROVISION']['PROVISION_STATUS'] = "Provision success!"

def node_provision_output():
    if current_app.config['PROVISION']['PROVISION_ACTIVE'] == True:
        current_app.config['PROVISION']['PROVISION_OUTPUT'] = current_app.config['TERMINAL_OUTPUT'].copy()

def scan_unprovisioned(state):
    current_app.config['TERMINAL_OUTPUT'].clear()
    current_app.config['PROVISION']['SCAN_ACTIVE'] = state
    write_to_meshctl(f"discover-unprovisioned {'on' if state else 'off'}\n")

def normal_scan():
    if "[NEW]" in "".join(current_app.config['TERMINAL_OUTPUT']):
        address, name, OOB, UUID = "", "", "", ""
        for entry in current_app.config['TERMINAL_OUTPUT']:
            if "Device UUID:" in entry:
                UUID = entry.split(" ")[-1]
            if "OOB:" in entry:
                OOB = entry.split(" ")[-1]
            if "[NEW]" in entry:
                str_arr = entry.split(" ")
                start_index = str_arr.index("Device")
                address = str_arr[start_index+1]
                name = ""
                for i in range(start_index+2, len(str_arr)):
                    name += f"{str_arr[i]} "
                name = name[:-1]
        if UUID == "":
            return
        print(f"normal_scan() - Found node: Address: {address} | Name: {name} | OOB: {OOB} | UUID: {UUID}")
        current_app.config['PROVISION']["UNPROVISIONED_NODES"][UUID] = {
                "name": name,
                "OOB": OOB,
                "address": address
            }

def failback_scan():
    if "OOB:" in "".join(current_app.config['TERMINAL_OUTPUT']):
        OOB, UUID = "", ""
        for entry in current_app.config['TERMINAL_OUTPUT']:
            if "Device UUID:" in entry:
                UUID = entry.split(" ")[-1]
            if "OOB:" in entry:
                OOB = entry.split(" ")[-1]
        print(f"failback_scan() - Found node: OOB: {OOB} | UUID: {UUID}")
        current_app.config['PROVISION']["UNPROVISIONED_NODES"][UUID] = {
            "OOB": OOB
        }