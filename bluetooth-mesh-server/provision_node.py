import subprocess
import threading
import re
import time

terminate_provision_event = threading.Event()

def terminal_read_output(provision_process, obj, data):
    global terminal_output, past_output
    if "past_output" not in globals():
        past_output = ""
    if "terminal_output" not in globals():
        terminal_output = []
    while provision_process.poll() is None:
        output = provision_process.stdout.readline()
        if output != past_output and output != "":
            ansi_escape_pattern = re.compile(r'(\x1b\[.*?[A-Za-z]|\x1b\[.*?[@-~]|\x1b\[.*?P|[\x00-\x1f])')
            cleared_output = ansi_escape_pattern.sub('', output)
            obj.append(cleared_output)
            past_output = output
            if "Provision success." in cleared_output:
                stop_provision(data,obj, "Successfully provisioned node!")
                data["Nodes"]["Unprovisioned-nodes"] = []
            if "Failed to connect:" in cleared_output or "Stale services? Remove device and re-discover" in cleared_output:
                stop_provision(obj,data, "Failed to connect, try again...")
            if "Services resolved no" in cleared_output:
                stop_provision(obj,data, "Failed to provision, try again...")

def stop_provision(obj, data, msg):
    global provision_process
    print(f"stop_provision() - call msg: {msg}")
    obj.append(msg)
    try:
        if not terminate_provision_event.is_set():
            terminate_provision_event.set()
            provision_process.terminate()
            print("stop_provision() - Trying to close provision_process")
            output_thread.join(timeout=0.1)
            print("stop_provision() - Closed thread")
    except Exception as e:
        print(f"stop_provision() - error: {e}")
    data["Local"]["Provisioning-status"] = False

def start_provision(UUID, obj, data):
    global provision_process, output_thread
    try:
        provision_process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        provision_process.stdin.write(f"provision {UUID}\n")
        provision_process.stdin.flush()

        # Start a thread to continuously read the output
        output_thread = threading.Thread(target=terminal_read_output, args=(provision_process,obj,data))
        output_thread.start()
        print(f"Started provisioning for node {UUID}")
        timeout_thread = threading.Thread(target=timeout_terminate, args=(obj,data, 60))
        timeout_thread.start()
        timeout_thread.join()
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")

def timeout_terminate(obj,data, timeout):
    global terminate_event
    if not terminate_event.wait(timeout):
        return stop_provision(obj,data, False)