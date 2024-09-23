
from flask import Flask
from flask_cors import CORS
from server import server_bp
from config import config_bp
from controller import controller_bp
from provision import provision_bp
from keys import keys_bp

from process import start_meshctl

app = Flask(__name__)

CORS(app)

app.config['SERVER'] = {
    "STATUS": "Server is running",
    "VERSION": "0.19",
    "MESHCTL": None,
    "ERROR":None
}

app.config['CONTROLLER'] = {
    "DEFAULT":"",
    "DEFAULT_DATA":{"UUID":{}},
    "POWER":None,
    "LIST":{}
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
        "NODES":[]
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

app.register_blueprint(server_bp)
app.register_blueprint(config_bp)
app.register_blueprint(controller_bp)
app.register_blueprint(provision_bp)
app.register_blueprint(keys_bp)

if __name__ == "__main__":
    start_meshctl(app)
    app.run(host="0.0.0.0", port=10000, debug=True)
    
