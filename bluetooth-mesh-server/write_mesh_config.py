import os
import json
from send_command import send_command
from modify_mesh_config import remove_node_from_config
def add_bind(data):
        try:
                bind_data = json.loads(data)
                command = f'connect\n'
                extra_commands = ['menu config',f'target {bind_data["elementValue"]}',f'appkey-add {bind_data["appKeyIndex"]}', f'bind {bind_data["elementIndex"]} {bind_data["appKeyIndex"]} {bind_data["modelValue"]}','back','disconnect']
                extra_timeouts = [0,3,2,1,1,2]
                output = open("logs/add-bind.txt","w")
                output.write(send_command(command=command,timeout=4,extra_commands=extra_commands,extra_timeouts=extra_timeouts))
                return "Success"
        except Exception as e:
                print("Failed to add_bind! ->")
                print(e)
                return "Failed"

def add_pub(data):
        try:
                pub_data = json.loads(data)
                command = f'connect\n'
                extra_commands = ['menu config',f'target {pub_data["elementValue"]}', f'appkey-add {pub_data["appKeyIndex"]}',f'pub-set {pub_data["elementValue"]} {pub_data["address"][2:]} {pub_data["appKeyIndex"]} {pub_data["publicationPeriod"]} {pub_data["retransmissionCount"]} {pub_data["modelValue"]}','back','disconnect']
                extra_timeouts = [0,2,2,1,1,2]
                output = open("logs/add-pub.txt","w")
                output.write(send_command(command=command,timeout=5,extra_commands=extra_commands,extra_timeouts=extra_timeouts))
                return "Success"
        except Exception as e:
                print("Failed to add pub! ->")
                print(e)
                return "Failed"

def add_sub(data):
        try:
                pub_data = json.loads(data)
                command = f'connect\n'
                extra_commands = ['menu config',f'target {pub_data["elementValue"]}', f'appkey-add {pub_data["appKeyIndex"]}',f'sub-add {pub_data["elementValue"]} {pub_data["address"][2:]} {pub_data["modelValue"]}','back','disconnect']
                extra_timeouts = [0,2,2,1,1,2]
                output = open("logs/add-sub.txt","w")
                output.write(send_command(command=command,timeout=5,extra_commands=extra_commands,extra_timeouts=extra_timeouts))
                return "Success"
        except Exception as e:
                print("Failed to add sub! ->")
                print(e)
                return "Failed"

def reset_node(data):
        try:
                # Get data from json
                data = json.loads(data)
                
                # Connect to the mesh network and execute commands to remove the node
                command = f"connect\n" # Note: Make a check for send_command function to see if it has actually connected to the mesh network
                extra_commands = ["menu config", f'target {data["unicastAddress"]}',"node-reset"]
                extra_timeouts = [0,2,4]
                
                # Log output for debugging
                output = open("logs/reset-node.txt","w")
                
                # Call send_command
                output.write(send_command(command=command,timeout=8,extra_commands=extra_commands,extra_timeouts=extra_timeouts))
                
                # Remove the datapoint of the node from config
                remove_node_from_config(data)
                
                return "Success" # Note: Make condition check for Fail
        except Exception as e:
                print("Failed to reset node! ->")
                print(e)
                return "Failed"
                
                
