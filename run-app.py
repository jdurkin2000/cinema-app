import subprocess
import platform
import os

def open_new_terminal(command, cwd="."):
    """
    Opens a new terminal and runs a command.
    cwd is now treated as **relative to current working directory**.
    """
    system = platform.system()
    cwd_rel = cwd  # keep relative
    cwd_abs = os.path.abspath(os.path.join(os.getcwd(), cwd_rel))  # just for logging if needed

    if system == "Windows":
        # cd /d "relative path" && command
        subprocess.run(f'start "" cmd /k "cd /d {cwd_rel} && {command}"', shell=True)
    elif system == "Darwin":
        subprocess.run([
            'osascript', '-e',
            f'tell application "Terminal" to do script "cd \\"{cwd_rel}\\"; {command}"'
        ])
    elif system == "Linux":
        subprocess.run([
            'gnome-terminal', '--', 'bash', '-c', f'cd "{cwd_rel}"; {command}; exec bash'
        ])
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
