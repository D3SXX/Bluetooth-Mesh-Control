import subprocess
import threading
import re
import time
import os

terminate_event = threading.Event()

def terminal_read_output(configure_node_process, data):
    global terminal_output, past_output
    if "past_output" not in globals():
        past_output = ""
    if "terminal_output" not in globals():
        terminal_output = []
    while not terminate_event.is_set():
        output = configure_node_process.stdout.readline()
        if output != past_output and output != "":
            ansi_escape_pattern = re.compile(r'(\x1b\[.*?[A-Za-z]|\x1b\[.*?[@-~]|\x1b\[.*?P|[\x00-\x1f])')
            cleared_output = ansi_escape_pattern.sub('', output)
            data["terminalOutput"].append(cleared_output)
            past_output = output
            print(output)
            if "Mesh session is open" in cleared_output:
                configure_node_process.stdin.write(f'menu config\ntarget {data["unicastAddress"]}\n')
                configure_node_process.stdin.flush()
            if "Configuring node" in cleared_output:
                for command in data["commandsList"]:
                    configure_node_process.stdin.write(f"{command}\n")
                    configure_node_process.stdin.flush()
                    time.sleep(0.5)
            if f"{data["type"]} status Success" in cleared_output:
                configure_node_process.stdin.write(f'disconnect')
                configure_node_process.stdin.flush()
                time.sleep(1)
                stop_configure(data,True)
            if "Write closed" in cleared_output or "Notify closed" in cleared_output or "Failed to connect" in cleared_output or "Failed to AcquireWrite" in cleared_output:
                stop_configure(data, False)

def stop_configure(data,msg):
    global remove_node_output_thread,configure_node_process 
    print(f"stop_configure() - call msg state: {msg}")
    configure_node_process.stdin.write("disconnect\nexit\n")
    configure_node_process.stdin.flush()
    path = "logs/"
    if not os.path.exists(path):
        os.mkdir(path)
    with open(f'{path}{data["type"]}.txt', 'w') as f:
        for line in data["terminalOutput"]:
            f.write(f"{line}\n")
    data["msg"] = msg
    try:
        if not terminate_event.is_set():
            terminate_event.set()
            configure_node_process.terminate()
            print("stop_configure() - Trying to close configure_node_process")
            remove_node_output_thread.join(timeout=1)
            print("stop_configure() - Closed thread")
    except Exception as e:
        print(f"stop_configure() - error: {e}")
    return

def start_configure(data):
    global configure_node_process, remove_node_output_thread, terminate_event
    terminate_event.clear()
    try:
        configure_node_process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        configure_node_process.stdin.write(f"connect\n")
        configure_node_process.stdin.flush()

        # Start a thread to continuously read the output
        remove_node_output_thread = threading.Thread(target=terminal_read_output, args=(configure_node_process,data))
        remove_node_output_thread.start()
        print(f'Started {data["type"]} of node {data["unicastAddress"]}')

        timeout_thread = threading.Thread(target=timeout_terminate, args=(data, 30))
        timeout_thread.start()

        timeout_thread.join()

    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")

def timeout_terminate(data, timeout):
    global terminate_event
    if not terminate_event.wait(timeout):
        stop_configure(data, False)