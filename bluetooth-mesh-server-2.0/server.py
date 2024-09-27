import re
import time
from flask import Blueprint, jsonify, current_app, make_response, request
from process import start_meshctl,write_to_meshctl

server_bp = Blueprint('server_bp', __name__)

@server_bp.route('/server', methods=['GET'])
def get_server_info():
    update_server()
    status = request.args.get('query')
    if status is None:
        return jsonify(current_app.config['SERVER']), 200
    if not status in current_app.config['SERVER']:
        return jsonify({status: "Invalid query parameter"}), 400

    response_value = {status: current_app.config['SERVER'].get(status)}
    response = make_response(response_value)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200

def update_server():
    if current_app.config['SERVER']['MESHCTL'] is None:
        current_app.config['TERMINAL_OUTPUT'].clear()
        write_to_meshctl("version\n")
        start = time.time()
        pattern = r"Version\s+(\d+\.\d+)"
        while True:
            if time.time() - start > 5:
                print("update_server() - Timeout on getting data!")
                return
            out = "".join(current_app.config['TERMINAL_OUTPUT'])
            if re.search(pattern, out):
                match = re.search(pattern, out)
                current_app.config['SERVER']['MESHCTL'] = match.group(1)
                return
            time.sleep(0.1)
        current_app.config['TERMINAL_OUTPUT'].clear()