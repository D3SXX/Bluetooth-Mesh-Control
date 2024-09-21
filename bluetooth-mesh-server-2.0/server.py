import re
from flask import Blueprint, jsonify, current_app, request
from process import start_meshctl,write_to_meshctl

server_bp = Blueprint('server_bp', __name__)

@server_bp.route('/server', methods=['GET'])
def get_server_info():
    status = request.args.get('query')
    command = request.args.get('command')
    if command:
        write_to_meshctl(command)

    print(status)
    response_value = current_app.config['SERVER'].get(status)

    if response_value is None:
        return jsonify({"error": "Invalid query parameter"}), 400

    return jsonify(response_value), 200