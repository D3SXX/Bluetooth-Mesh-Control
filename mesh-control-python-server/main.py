import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from server import server_bp
from config import config_bp
from controller import controller_bp
from provision import provision_bp
from keys import keys_bp
from utils.read_prov_db import get_nodes_data

from utils.process import stop_process, start_meshctl

app = Flask(__name__)

CORS(app)

app.config['SERVER'] = {
    "STATUS": None,
    "VERSION": "1.0 (R.C. 1)",
    "NAME": "MeshControl",
    "ALLOW_PROCESSES":True,
    "MESHCTL": None,
    "ERROR":{"STATUS":False,
             "MESSAGE":None,
             "TYPE":None,
             "EXTRA_DATA":{}
             }
}

app.config['CONTROLLER'] = {
    "DEFAULT":"",
    "DEFAULT_DATA":{"UUID":{}},
    "POWER":None,
    "LIST":{},
    "PROCESS":{"STATUS":False}
}

app.config['PROVISION'] = {
        "SCAN_ACTIVE":False,
        "USE_FAILBACK_SCAN":False,
        "PROVISION_ACTIVE":False,
        "PROVISION_STATUS":"",
        "PROVISION_START_TIME":0.0,
        "UNPROVISIONED_NODES":{},
        "PROVISION_OUTPUT":[]
}

app.config['CONFIG'] = {
        "SECURITY_LEVEL":None,
        "NODES":[],
        "PROCESS":{"STATUS":False,"PROGRESS":0,"LOGS":[]}
}

app.config['KEYS'] = {
        "APPKEYS":[],
        "NETKEYS":[]
}

app.config['STATE'] = {"status":False}

app.config["TERMINAL_OUTPUT"] = []

app.config["TERMINAL_SESSIONS"] = {
    "CONFIG":{"STATUS":False, "OUTPUT":[]},
    "CONTROLLER":{"STATUS":False, "OUTPUT":[]},
    "PROVISION":{"STATUS":False, "OUTPUT":[]},
    "SERVER":{"STATUS":False, "OUTPUT":[]},
}

nodes_data = get_nodes_data()
if nodes_data["STATUS"] == False:
    app.config['SERVER']['ERROR'] = nodes_data
    app.config['SERVER']['ERROR']['STATUS'] = True
    app.config['SERVER']['ERROR']['EXTRA_DATA'] = {}
    files = ["prov_db.json","local_node.json"]
    path = os.path.abspath(__file__)[:-7]
    for file in files:
        with open(f'{path}resources/reset_config/{file}') as f:       
            obj = f.read()
            app.config['SERVER']['ERROR']['EXTRA_DATA'][file] = obj
else:
    app.config['CONFIG']['NODES'] = nodes_data

app.register_blueprint(server_bp)
app.register_blueprint(config_bp)
app.register_blueprint(controller_bp)
app.register_blueprint(provision_bp)
app.register_blueprint(keys_bp)

@app.before_request
def initialize_meshctl():
    if app.config['SERVER']['STATUS'] is None:
        start_meshctl(app)
        app.config['SERVER']['STATUS'] = "Server is running"

@app.route('/main', methods=['POST'])
def main():
    req_data = request.get_json()
    state = req_data.get("STATUS")
    if state is not None:
        app.config['SERVER']['ALLOW_PROCESSES'] = not state
        if state:
            start_meshctl(app) 
        else:
            stop_process() 
        return jsonify({"message": f"meshctl process is set to {state}"}), 200
    return jsonify({"message": "Main request is empty or not found"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
    
