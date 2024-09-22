
from flask import Flask
from server import server_bp
from config import config_bp
from controller import controller_bp

from process import start_meshctl

app = Flask(__name__)

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
    "LIST":[]
}

app.config['PROVISION'] = {
        "SCAN":None,
        "UNPROVISIONED_NODES":{}
}

app.config['CONFIG'] = {
        "SECURITY_LEVEL":None,
        "NODES":[]
}

app.config['STATE'] = {"status":False}

app.config["TERMINAL_OUTPUT"] = []

app.register_blueprint(server_bp)
app.register_blueprint(config_bp)
app.register_blueprint(controller_bp)


if __name__ == "__main__":
    start_meshctl(app)
    app.run(host="0.0.0.0", port=10000, debug=True)
    
