import os
import json
from send_command import send_command
from modify_mesh_config import remove_node_from_config
from configure_node import start_configure

def add_bind(data):
        try:
                data = json.loads(data)
                
                data["type"] = "Model App"
                data["commandsList"] = [f'appkey-add {data["appKeyIndex"]}', f'bind {data["elementIndex"]} {data["appKeyIndex"]} {data["modelValue"]}']
                data["terminalOutput"] = []

                start_configure(data)

                return f"Succesfully added bind to {data['unicastAddress']}" if data["msg"] == True else "Failed to add bind"
        except Exception as e:
                print("Failed to add_bind! ->")
                print(e)
                return f"Failed: {e}"

def add_pub(data):
        try:
                data = json.loads(data)
                
                data["type"] = "Publication"
                data["commandsList"] = [f'appkey-add {data["appKeyIndex"]}',f'pub-set {data["unicastAddress"]} {data["address"][2:]} {data["appKeyIndex"]} {data["publicationPeriod"]} {data["retransmissionCount"]} {data["modelValue"]}']
                data["terminalOutput"] = []

                start_configure(data)

                return f"Succesfully added publish for {data['unicastAddress']}" if data["msg"] == True else "Failed to pub set"
        except Exception as e:
                print("Failed to add_pub! ->")
                print(e)
                return f"Failed: {e}"        

def add_sub(data):
        try:
                data = json.loads(data)
                
                data["type"] = "Subscription"
                data["commandsList"] = [f'appkey-add {data["appKeyIndex"]}',f'sub-add {data["unicastAddress"]} {data["address"][2:]} {data["modelValue"]}']
                data["terminalOutput"] = []

                start_configure(data)

                return f"Succesfully added subscription for {data['unicastAddress']}" if data["msg"] == True else "Failed to sub add"
        except Exception as e:
                print("Failed to add_sub! ->")
                print(e)
                return f"Failed: {e}" 

def reset_node(data):
        try:
                data = json.loads(data)
                
                data["type"] = "reset"
                data["commandsList"] = [f'node-reset']
                data["terminalOutput"] = []
                data["msg"] = False

                start_configure(data)

                if data["msg"]:
                        remove_node_from_config(data)

                return f"Succesfully reset node {data['unicastAddress']}" if data["msg"] == True else "Failed to reset node"
        except Exception as e:
                print("Failed to reset node! ->")
                print(e)
                return f"Failed: {e}" 
                
                
