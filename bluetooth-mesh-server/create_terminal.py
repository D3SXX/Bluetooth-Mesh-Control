import subprocess
import time
from multiprocessing import Process, Queue
import threading
import re

def terminal_read_output(process):
    global terminal_output, past_output
    if "past_output" not in globals():
        past_output = ""
    while process.poll() is None:
        output = process.stdout.readline()
        if output != past_output:
            remove_ansi = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")
            string = remove_ansi.sub("",output.strip())
            terminal_output.append(string)
            # Error Handling
            if "Stale services? Remove device and re-discover" in string:
                force_close(error=True)
            # Fail handing
            if "Provisioning failed" in string:
                force_close(error=True, error_msg="Provisioning failed, try again..")
            # Success Handling
            if "Connection successful":
                pass
                #force_close(success_msg="")
            past_output = output
        time.sleep(0.1)

def force_close(error=False, error_msg = "An error occured, try again..", success_msg=""):
    global th, terminal_output
    print("force_close() - Trying to close process")
    th.join(timeout=0.1)
    if error:
        terminal_output.append(f"<Toast>{error_msg}</Toast>")
    else:
        terminal_output.append(f"<Toast>{success_msg}</Toast>")
    terminal_output.append("<Done>")
    print("force_close() - Closed thread and sent message")

def terminal_send_command(command, delay=2):
    global terminal_output
    try:
        process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        process.stdin.write(command + "\n")
        process.stdin.flush()

        # Start a thread to continuously read the output
        output_thread = threading.Thread(target=terminal_read_output, args=(process,))
        output_thread.start()

        # Wait before closing
        time.sleep(delay)

        process.terminate()
        output_thread.join()
        terminal_output.append("<Done>")
        return
    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")

def resolve_terminal_request(request,set_data):
    global terminal_output, th
    if not "terminal_output" in globals():
        terminal_output = []
    match request:
        case "get-newline":
            if(len(terminal_output) <= 0):
                return "<Empty>"
            return_list = terminal_output
            terminal_output = []
            return return_list
        case "start":
            print("resolve_terminal_request: Called")
            try:
                th.join()
                print("resolve_terminal_request: Joined previous thread")
            except:
                pass
            timeout = 60 # in seconds
            terminal_output.append(f"<Start {timeout*1000}>")
            print("resolve_terminal_request: Starting new thread")
            th = threading.Thread(target=terminal_send_command, args=[f"discover-unprovisioned on\n\n\nprovision {set_data}", timeout])
            th.start()
            return "Done"
    return "Command not available"