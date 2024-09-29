from flask import Blueprint, current_app, jsonify, make_response, request
import time
import re

from utils.process import write_to_meshctl
from utils.custom_process import start_custom_meshctl,stop_custom_process, write_to_custom_meshctl
from provision import scan_unprovisioned 

controller_bp = Blueprint('controller_bp', __name__)

@controller_bp.route('/controller', methods=['GET', 'POST'])
def handle_config():
    if request.method == 'GET':
        update_controller()
        status = request.args.get('query')
        if status is None:
            return jsonify(current_app.config['CONTROLLER']), 200
        if not status in current_app.config['CONTROLLER']:
            return jsonify({status: "Invalid query parameter"}), 400

        response_value = {status:current_app.config['CONTROLLER'].get(status)}

        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200

    elif request.method == 'POST':
        req_data = request.get_json()
        new_address = req_data.get('address')
        power_status = req_data.get('power')
        if new_address:
            write_to_meshctl(f"select {new_address}\n")
            current_app.config['CONTROLLER']['DEFAULT'] = new_address
            update_controller()
            response = {
                "status": "success",
                "message": f"Controller address updated to {new_address}",
                "LIST": current_app.config['CONTROLLER']['LIST']
            }
        elif power_status is not None:
            if power_status == "any":
                power_status = not current_app.config['CONTROLLER']["POWER"]
                
            write_to_meshctl(f"power {'on' if power_status else 'off'}\n")
            
            if power_status is False:
                scan_unprovisioned(False)

            response = {
                "status": "success",
                "message": f"Controller power updated to {power_status}",
                "POWER": power_status
            }
        else:
            response = {
                "status": "fail",
                "message": "Controller request is empty or not found"
            }  
        return jsonify(response), 201

def update_controller():
    if current_app.config['CONFIG']['PROCESS']['STATUS'] == True:
        return
    if current_app.config['CONTROLLER']['PROCESS']['STATUS'] == True:
        return
    current_app.config['CONTROLLER']['PROCESS']['STATUS'] = True
    current_app.config['TERMINAL_SESSIONS']['CONTROLLER']['OUTPUT'].clear()
    if current_app.config['TERMINAL_SESSIONS']['CONTROLLER']["STATUS"] is not True:
        start_custom_meshctl("CONTROLLER")
        current_app.config['TERMINAL_SESSIONS']['CONTROLLER']["STATUS"] = True
    write_to_custom_meshctl(f"select {current_app.config['CONTROLLER']['DEFAULT'] or ""}\nlist\nshow\n")
    start = time.time()
    while "Discovering:" not in "".join(current_app.config['TERMINAL_SESSIONS']['CONTROLLER']['OUTPUT']):
        if time.time() - start > 5.0:
            print("Reached timeout on update_controller()!")
            current_app.config['TERMINAL_SESSIONS']['CONTROLLER']["STATUS"] = False
            return
    end = time.time()
    print(f"update_controller() - Took {end-start} s to receive the output")
    out = current_app.config['TERMINAL_SESSIONS']['CONTROLLER']['OUTPUT']
    key_pattern =  r"^[ \t]*(\w+):[ \t]*(.*)$"
    uuid_pattern = r"UUID: (.*) (.*)$"
    controller_pattern = r"Controller (.*)$"
    controller_list_pattern = r"Controller\s([A-F0-9:]+)\s([^\[]+\[default\]|[^\[]+)"
    current_app.config['CONTROLLER']['LIST'].clear()
    for entry in out:
        line = entry.strip()
        if re.search(controller_pattern, line):
            current_app.config['CONTROLLER']['DEFAULT'] = re.search(controller_pattern, line).group(1)
            current_app.config['CONTROLLER']['DEFAULT_DATA']['Default-adapter'] = re.search(controller_pattern, line).group(1)
        elif re.search(uuid_pattern, line):
            match = re.search(uuid_pattern, line)
            current_app.config['CONTROLLER']['DEFAULT_DATA']['UUID'][match[1]] = match[2]
        elif re.search(key_pattern, line):
            match = re.search(key_pattern, line)
            current_app.config['CONTROLLER']['DEFAULT_DATA'][match.group(1).strip()] = match.group(2).strip()
        if re.search(controller_list_pattern, line):
            match = re.search(controller_list_pattern, line)
            current_app.config['CONTROLLER']['LIST'][match.group(1)] = match.group(2)
    current_app.config['CONTROLLER']["POWER"] = True if current_app.config['CONTROLLER']['DEFAULT_DATA']["Powered"] == "yes" else False
    current_app.config['CONTROLLER']['PROCESS']['STATUS'] = False