import subprocess
import threading
import re

from flask import current_app

process = None
process_thread = None

def terminal_read_output(process,app):
    global past_output
    if "past_output" not in globals():
        past_output = ""
    while process.poll() is None:
        output = process.stdout.readline()
        if output != past_output and output != "":
            ansi_escape_pattern = re.compile(r'(\x1b\[.*?[A-Za-z]|\x1b\[.*?[@-~]|\x1b\[.*?P|[\x00-\x1f])')
            cleared_output = ansi_escape_pattern.sub('', output)
            past_output = output
            with app.app_context():
                current_app.config['TERMINAL_OUTPUT'].append(cleared_output)
            if "Composition data for node" in cleared_output:
                write_to_meshctl("disconnect")
            print(output)


def stop_process():
    try:
        process.terminate()
        print("stop_process() - Trying to close process")
        process_thread.join(timeout=0.1)
        print("stop_process() - Closed thread")
    except Exception as e:
        print(f"Got an error for stop_process(): {e}")

def start_meshctl(app):
    global process, process_thread
    try:
        process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        process_thread = threading.Thread(target=terminal_read_output, args=(process, app))
        process_thread.start()
        print("start_meshctl() - Started meshctl process")
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")

def write_to_meshctl(command):
    if process and process.poll() is None:
        process.stdin.write(command + "\n")
        process.stdin.flush()
    else:
        print("Meshctl process is not running.")