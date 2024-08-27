import subprocess
import time
from multiprocessing import Process, Queue
import threading
import re

def terminal_read_output(process):
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
                add_undiscovered_node()
        
def add_undiscovered_node():
    global terminal_output
    print("Here!")
def init_discover():
    start_discover()


def stop_discover():
    global th, terminal_output
    print("force_close() - Trying to close process")
    output_thread.join(timeout=0.1)
    print("force_close() - Closed thread and sent message")
    print(terminal_output)

def start_discover():
    global output_thread
    try:
        process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        process.stdin.write("discover-unprovisioned on" + "\n")
        process.stdin.flush()

        # Start a thread to continuously read the output
        output_thread = threading.Thread(target=terminal_read_output, args=(process,))
        output_thread.start()
        print("Started discovery for unprovisioned nodes")
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")

init_discover()
time.sleep(5)
stop_discover()