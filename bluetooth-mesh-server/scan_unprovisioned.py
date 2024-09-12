import subprocess
import threading
import re

def terminal_read_output(process, obj):
    global terminal_output, past_output
    if "past_output" not in globals():
        past_output = ""
    if "terminal_output" not in globals():
        terminal_output = []
    while process.poll() is None:
        output = process.stdout.readline()
        if output != past_output and output != "":
            ansi_escape_pattern = re.compile(r'(\x1b\[.*?[A-Za-z]|\x1b\[.*?[@-~]|\x1b\[.*?P|[\x00-\x1f])')
            cleared_output = ansi_escape_pattern.sub('', output)
            terminal_output.append(cleared_output)
            past_output = output
            if "[NEW]" in cleared_output:
                add_undiscovered_node(obj)
        
def add_undiscovered_node(obj):
    global terminal_output, arr
    address, name, OOB, UUID = "", "", "", ""
    for entry in terminal_output:
        if "Device UUID:" in entry:
            UUID = entry.split(" ")[-1]
        if "OOB:" in entry:
            OOB = entry.split(" ")[-1]
        if "[NEW]" in entry:
            str_arr = entry.split(" ")
            start_index = str_arr.index("Device")
            address = str_arr[start_index+1]
            name = ""
            for i in range(start_index+2, len(str_arr)):
                name += f"{str_arr[i]} "
            name = name[:-1]

    print(f"Found node: Address: {address} | Name: {name} | OOB: {OOB} | UUID: {UUID}")
    obj["Nodes"]["Unprovisioned-nodes"][address] = {
        "name": name,
        "OOB": OOB,
        "UUID": UUID
    }


def stop_discover():
    global process, terminal_output
    try:
        process.terminate()
        print("stop_discover() - Trying to close process")
        discover_output_thread.join(timeout=0.1)
        print("stop_discover() - Closed thread")
    except Exception as e:
        print(f"Got an error for stop_discover(): {e}")
    #print(terminal_output)

def start_discover(obj):
    global process, discover_output_thread
    try:
        process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        process.stdin.write("discover-unprovisioned on" + "\n")
        process.stdin.flush()

        # Start a thread to continuously read the output
        discover_output_thread = threading.Thread(target=terminal_read_output, args=(process,obj))
        discover_output_thread.start()
        print("Started discovery for unprovisioned nodes")
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")
