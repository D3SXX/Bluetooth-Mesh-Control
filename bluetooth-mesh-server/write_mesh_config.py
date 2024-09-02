import os
import json
from send_command import send_command
from modify_mesh_config import remove_node_from_config
from remove_node import start_node_remove

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

                data["msg"] = False

                # Try to remove node from meshctl 
                start_node_remove(data)
                
                # Remove the datapoint of the node from config if meshctl has removed it
                if data["msg"]:
                        remove_node_from_config(data)
                
                return f'Successfuly removed node {data["unicastAddress"]}' if data["msg"] == True else f'Could not remove node {data["unicastAddress"]}, try again..' 
        except Exception as e:
                print("Failed to reset node! ->")
                print(e)
                return "Failed"
                
                
