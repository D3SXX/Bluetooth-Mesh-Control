import subprocess
import time
from multiprocessing import Process, Queue
import threading

def send_command(command,timeout=2,extra_commands=[], extra_timeouts=[]):
    try:
        # Run meshctl command and capture output
        process = subprocess.Popen(["meshctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        
        process.stdin.write(command + "\n")
        process.stdin.flush()

        time.sleep(timeout)
        
        for i in range(0,len(extra_commands)):   
            process.stdin.write(extra_commands[i] + "\n")
            process.stdin.flush()
            time.sleep(extra_timeouts[i])
        
        # Capture output
        output, error = process.communicate()

        # Check if command execution was successful
        if process.returncode == 0:
            return output.strip()
        else:
            print("Error executing meshctl command:", error.strip())
            return error.strip()

    except FileNotFoundError:
        print("meshctl command not found. Make sure it's installed and accessible.")
        return error.strip()
