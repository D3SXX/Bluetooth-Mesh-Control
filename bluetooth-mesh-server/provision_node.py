import subprocess
import threading
import re
import time

terminate_provision_event = threading.Event()

def terminal_read_output(provision_process, obj, data):
    global past_output
    if "past_output" not in globals():
        past_output = ""
    while provision_process.poll() is None:
        output = provision_process.stdout.readline()
        if output != past_output and output != "":
            ansi_escape_pattern = re.compile(r'(\x1b\[.*?[A-Za-z]|\x1b\[.*?[@-~]|\x1b\[.*?P|[\x00-\x1f])')
            cleared_output = ansi_escape_pattern.sub('', output)
            obj.append(cleared_output)
            past_output = output
            if "Provision success." in cleared_output:
                time.sleep(10) # Wait until meshctl will collect data from node
                stop_provision(obj,data, "Successfully provisioned node!")
                data["Nodes"]["Unprovisioned-nodes"] = []
            if "Failed to connect:" in cleared_output or "Stale services? Remove device and re-discover" in cleared_output:
                stop_provision(obj,data, "Failed to connect, try again...")
            if "Services resolved no" in cleared_output:
                stop_provision(obj,data, "Failed to provision, try again...")

def stop_provision(obj, data, msg):
    global provision_process, output_thread
    print(f"stop_provision() - call msg: {msg}")
    obj.append(msg)
    provision_process.stdin.write(f"exit\n")
    provision_process.stdin.flush()
    try:
        if not terminate_provision_event.is_set():
            terminate_provision_event.set()
            provision_process.terminate()
            print("stop_provision() - Trying to close provision_process")
           
    except Exception as e:
        print(f"stop_provision() - error: {e}")
    data["Local"]["Provisioning-status"] = False

def start_provision(UUID, obj, data):
    global provision_process, output_thread
    try:
        provision_process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        command = f"provision {UUID}\n"

        if data["Local"]["Security-level"]:
            print(f"Setting security level for provisioning to {data["Local"]["Security-level"]}")
            command = f"security {data["Local"]["Security-level"]}\n" + command

        provision_process.stdin.write(command)
        provision_process.stdin.flush()

        # Start a thread to continuously read the output
        output_thread = threading.Thread(target=terminal_read_output, args=(provision_process,obj,data))
        output_thread.start()
        print(f"Started provisioning for node {UUID}")
        timeout_thread = threading.Thread(target=timeout_terminate, args=(obj,data, 60))
        timeout_thread.start()
        timeout_thread.join()

        output_thread.join()
        timeout_thread.join()
        print("start_provision() - Closed threads")

    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")
    except Exception as e:
        print(f"start_provision() - error: {e}")

def timeout_terminate(obj,data, timeout):
    global terminate_provision_event
    if not terminate_provision_event.wait(timeout):
        stop_provision(obj,data, "Reached 60 seconds timeout, try again...")


#start_provision("test",[],{"Local":{"Provisioning-status":True}})