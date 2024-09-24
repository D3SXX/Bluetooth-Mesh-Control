from flask import Blueprint, current_app, jsonify, make_response, request

from read_prov_db import get_nodes_data
from process import write_to_meshctl

import time

config_bp = Blueprint('config_bp', __name__)


@config_bp.route('/config', methods=['GET', 'POST'])
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