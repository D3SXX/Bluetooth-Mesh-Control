from flask import Blueprint, current_app, jsonify, request

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

        return jsonify(response_value), 200

    elif request.method == 'POST':
        req_data = request.get_json()
        response = {
            "status": "success",
            "message": "Received data",
            "data": req_data
        }
        return jsonify(response), 201
    

def update_security(level = ""):
    current_app.config['TERMINAL_OUTPUT'].clear()
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
    index = out.index("Level") + 3
    current_app.config["CONFIG"]["SECURITY_LEVEL"] = int(out[index])
    current_app.config['TERMINAL_OUTPUT'].clear()