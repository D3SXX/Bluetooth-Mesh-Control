from flask import Blueprint, current_app, jsonify, make_response, request
from process import write_to_meshctl
from read_prov_db import get_keys_data
import time
import re
keys_bp = Blueprint('keys_bp', __name__)


@keys_bp.route('/keys', methods=['GET', 'POST','PUT','DELETE'])
def handle_keys():
    if request.method == 'GET':
        current_app.config['KEYS'] = get_keys_data(current_app)
        status = request.args.get('query')
        if status is None:
            return jsonify(current_app.config['KEYS']), 200
        if not status in current_app.config['KEYS']:
            return jsonify({status: "Invalid query parameter"}), 400

        response_value = {status:current_app.config['KEYS'].get(status)}

        response = make_response(response_value)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200

    elif request.method == 'POST':
        req_data = request.get_json()
        new_address = req_data.get('address')
        power_status = req_data.get('power')
        if new_address:
            write_to_meshctl(f"select {new_address}\n")
            response = {
                "status": "success",
                "message": f"Controller address updated to {new_address}"
            }
        elif power_status is not None:
            write_to_meshctl(f"power {'on' if power_status else 'off'}\n")
            response = {
                "status": "success",
                "message": f"Controller power updated to {power_status}"
            }
        else:
            response = {
                "status": "fail",
                "message": "Controller request is empty or not found"
            }  
        return jsonify(response), 201