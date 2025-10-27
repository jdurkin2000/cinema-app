#!/usr/bin/env python3
import subprocess
import platform
import os
import sys

def load_properties(filepath: str) -> dict:
    props = {}
    try:
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):  # skip empty lines/comments
                    key, value = line.split("=", 1)
                    props[key.strip()] = value.strip()
    except FileNotFoundError:
        pass

    return props

def open_new_terminal(command, cwd="."):
    """
    Opens a new terminal and runs a command.
    """
    system = platform.system()
    # Always use the absolute path for reliability across OSes
    cwd_abs = os.path.abspath(cwd)

    secrets = load_properties("secrets.properties")
    master_password = secrets.get("JASYPT_ENCRYPTOR_PASSWORD")
    if (master_password is None):
        print("ERROR: Could not find file ./secrets.properties or requested property value. Aborting script..", file=sys.stderr)
        exit(1)

    env = os.environ.copy()
    env["JASYPT_ENCRYPTOR_PASSWORD"] = master_password

    if system == "Windows":
        subprocess.run(f'start "" cmd /k "cd /d {cwd_abs} && {command}"', shell=True, env=env)
    elif system == "Darwin": # This is the corrected block for macOS
        subprocess.run([
            'osascript', '-e',
            f'tell application "Terminal" to do script "cd \\"{cwd_abs}\\"; {command}"'
        ], env=env)
    elif system == "Linux":
        subprocess.run([
            'gnome-terminal', '--', 'bash', '-c', f'cd "{cwd_abs}"; {command}; exec bash'
        ], env=env)
    else:
        raise Exception(f"Unsupported OS: {system}")


# --- CONFIGURE PROJECT DIRECTORIES (relative paths) ---
backend_dir = "backend"           # Relative to script location
frontend_dir = "cinema-frontend" # Relative to script location

# --- COMMANDS PER PLATFORM ---
backend_command = "mvnw.cmd spring-boot:run" if platform.system() == "Windows" else "./mvnw spring-boot:run"
frontend_command = "npm run dev"

# --- LAUNCH TERMINALS ---
open_new_terminal(backend_command, cwd=backend_dir)
open_new_terminal(frontend_command, cwd=frontend_dir)