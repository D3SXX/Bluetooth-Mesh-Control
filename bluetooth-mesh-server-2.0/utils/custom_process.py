import subprocess
import threading
import re
from flask import current_app

process = None
process_thread = None

def terminal_read_output(process, app, caller):
    if "past_output" not in globals():
        past_output = ""
    while process.poll() is None:
        output = process.stdout.readline()
        if output != past_output and output != "":
            ansi_escape_pattern = re.compile(r'(\x1b\[.*?[A-Za-z]|\x1b\[.*?[@-~]|\x1b\[.*?P|[\x00-\x1f])')
            cleared_output = ansi_escape_pattern.sub('', output)
            past_output = output
            with app.app_context():
                current_app.config['TERMINAL_SESSIONS'][caller]['OUTPUT'].append(cleared_output)
            #print(output)

def stop_custom_process():
    try:
        process.stdin.write("exit\n")
        #process.terminate()
        print(f"stop_process() - Trying to close {threading.current_thread().name}")
        process_thread.join(timeout=0.1)
    except Exception as e:
        print(f"Got an error for stop_process(): {e}")

def start_custom_meshctl(caller):
    global process, process_thread
    try:
        process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        process_thread = threading.Thread(target=terminal_read_output, args=(process, current_app._get_current_object(), caller))
        process_thread.start()
        print(f"start_custom_meshctl() - Started meshctl {threading.current_thread().name}")
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")



def write_to_custom_meshctl(command):
    if process and process.poll() is None:
        process.stdin.write(command + "\n")
        process.stdin.flush()
    else:
        print("Meshctl process is not running.")