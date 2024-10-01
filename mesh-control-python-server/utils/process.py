import subprocess
import threading
import re

from flask import current_app

main_process = None
main_process_thread = None

def terminal_read_output(main_process,app):
    global past_output
    if "past_output" not in globals():
        past_output = ""
    while main_process.poll() is None:
        output = main_process.stdout.readline()
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
    global main_process, main_process_thread
    try:
        print(f"stop_process() - Trying to close {threading.current_thread().name}")
        write_to_meshctl("exit")
        main_process.terminate()
        main_process_thread.join(timeout=2)
        if main_process.poll() is None:
            print("meshctl did not exit, forcing kill...")
            main_process.kill()
        main_process_thread.join()
    except Exception as e:
        print(f"Got an error for stop_process(): {e}")
    finally:
        main_process = None
        main_process_thread = None 

def start_meshctl(app):
    global main_process, main_process_thread
    try:
        main_process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        main_process_thread = threading.Thread(target=terminal_read_output, args=(main_process, app))
        main_process_thread.start()
        print(f"start_meshctl() - main is using {threading.current_thread().name} for meshctl")
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")

def write_to_meshctl(command):
    if main_process and main_process.poll() is None:
        main_process.stdin.write(command + "\n")
        main_process.stdin.flush()
    else:
        print("Meshctl main_process is not running.")