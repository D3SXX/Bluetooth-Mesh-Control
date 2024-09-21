from flask import Blueprint, current_app, jsonify, request
from process import write_to_meshctl
import time
config_bp = Blueprint('config_bp', __name__)


@config_bp.route('/config', methods=['GET', 'POST'])
def handle_config():
    if request.method == 'GET':
        status = request.args.get('query')
        print(status)
        update_config()
        response_value = current_app.config['SERVER'].get(status)
        if response_value is None:
            return jsonify({"error": "Invalid query parameter"}), 400  # Return a 400 error if the key does not exist

        return jsonify(response_value), 200

    elif request.method == 'POST':
        req_data = request.get_json()
        response = {
            "status": "success",
            "message": "Received data",
            "data": req_data
        }
        return jsonify(response), 201

def update_config():
    write_to_meshctl("version\nlist\nshow\n")
    #version_index = current_app.config['TERMINAL_OUTPUT'].index("Version 5.72")
    #print(version_index)
    print("CHeck")
    time.sleep(2)
    out = current_app.config['TERMINAL_OUTPUT']
    for line in out:
        print(line)
    print(out)
    print("PONG")