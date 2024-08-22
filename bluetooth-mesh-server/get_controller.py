from send_command import send_command
import re
import json

def get_controller_data():
        return_obj = {"UUID":{}}
        output = send_command("show",0)
        key_pattern =  r"^[ \t]*(\w+):[ \t]*(.*)$"
        uuid_pattern = r"UUID: (.*) (.*)$"
        controller_pattern = r"Controller (.*)$"
        for line in output.splitlines():
                line = line.strip()
                if re.search(controller_pattern, line):
                        return_obj["Default-adapter"] = re.search(controller_pattern, line).group(1)
                elif re.search(uuid_pattern, line):
                        match = re.search(uuid_pattern, line)
                        return_obj["UUID"][match[1]] = match[2]
                elif re.search(key_pattern, line):
                        match = re.search(key_pattern, line)
                        return_obj[match.group(1).strip()] = match.group(2).strip()
        return return_obj

def get_controller_list():
        return_obj = {}
        output = send_command("list",0)
        pattern = r"Controller (\S+)\s+\S+(?!\s+\[default\])"
        for line in output.splitlines():
                line = line.strip()
                if re.search(pattern, line): 
                        return_obj[re.search(pattern, line).group(1)] = "Available"
        return return_obj
        
                
                