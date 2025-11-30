"""
Network Setup Verification Script

Checks if your cinema-app is properly configured for network access.
"""

import sys
import subprocess
from pathlib import Path
import re

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print('='*60)

def print_status(check, status, message):
    icon = "✅" if status else "❌"
    print(f"{icon} {check}: {message}")

def check_env_file():
    """Check if .env.local exists and has correct format"""
    print_header("Frontend Configuration")
    
    env_path = Path(__file__).parent / "cinema-frontend" / ".env.local"
    if not env_path.exists():
        print_status("Environment File", False, ".env.local not found")
        return None
    
    content = env_path.read_text()
    host_match = re.search(r'NEXT_PUBLIC_API_HOST=(\S+)', content)
    port_match = re.search(r'NEXT_PUBLIC_API_PORT=(\S+)', content)
    
    if not host_match or not port_match:
        print_status("Environment Variables", False, "Missing API_HOST or API_PORT")
        return None
    
    host = host_match.group(1)
    port = port_match.group(1)
    
    print_status("Environment File", True, f"Found at {env_path.relative_to(Path(__file__).parent)}")
    print(f"   API Host: {host}")
    print(f"   API Port: {port}")
    
    return host, port

def check_backend(host, port):
    """Check if backend is accessible"""
    print_header("Backend Accessibility")
    
    url = f"http://{host}:{port}/api/movies"
    print(f"Testing: {url}")
    
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "nul", "-w", "%{http_code}", url],
            capture_output=True,
            text=True,
            timeout=5
        )
        status_code = result.stdout.strip()
        
        if status_code == "200":
            print_status("Backend API", True, f"Responding on {host}:{port}")
            return True
        else:
            print_status("Backend API", False, f"HTTP {status_code}")
            return False
    except subprocess.TimeoutExpired:
        print_status("Backend API", False, "Connection timeout")
        return False
    except FileNotFoundError:
        # curl not available, try with PowerShell
        try:
            ps_cmd = f'(Invoke-WebRequest -Uri "{url}" -UseBasicParsing -TimeoutSec 5).StatusCode'
            result = subprocess.run(
                ["powershell", "-Command", ps_cmd],
                capture_output=True,
                text=True,
                timeout=5
            )
            if "200" in result.stdout:
                print_status("Backend API", True, f"Responding on {host}:{port}")
                return True
            else:
                print_status("Backend API", False, "Not responding")
                return False
        except:
            print_status("Backend API", False, "Could not test (curl/PowerShell unavailable)")
            return False

def check_application_properties(host):
    """Check if application.properties has correct CORS"""
    print_header("Backend CORS Configuration")
    
    props_path = Path(__file__).parent / "backend" / "src" / "main" / "resources" / "application.properties"
    if not props_path.exists():
        print_status("Application Properties", False, "File not found")
        return False
    
    content = props_path.read_text()
    cors_match = re.search(r'spring\.web\.cors\.allowed-origins=(.+)', content)
    
    if not cors_match:
        print_status("CORS Configuration", False, "Not configured")
        return False
    
    origins = cors_match.group(1)
    has_host = f"{host}:3000" in origins or "localhost:3000" in origins
    
    if has_host:
        print_status("CORS Configuration", True, f"Includes {host}")
        print(f"   Origins: {origins}")
        return True
    else:
        print_status("CORS Configuration", False, f"Missing {host}:3000")
        print(f"   Current: {origins}")
        return False

def check_next_config():
    """Check if next.config.ts has allowedDevOrigins"""
    print_header("Next.js Configuration")
    
    config_path = Path(__file__).parent / "cinema-frontend" / "next.config.ts"
    if not config_path.exists():
        print_status("Next Config", False, "File not found")
        return False
    
    content = config_path.read_text()
    
    if "allowedDevOrigins" in content:
        print_status("Dev Origins", True, "Configured for network access")
        return True
    else:
        print_status("Dev Origins", False, "Not configured")
        print("   Add allowedDevOrigins to next.config.ts")
        return False

def get_network_ips():
    """Get current network IPs"""
    print_header("Network Information")
    
    try:
        result = subprocess.run(
            ["powershell", "-Command", "ipconfig | Select-String -Pattern 'IPv4'"],
            capture_output=True,
            text=True
        )
        
        ips = re.findall(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', result.stdout)
        ips = [ip for ip in ips if not ip.startswith('127.')]
        
        if ips:
            print(f"Found {len(ips)} network IP(s):")
            for ip in ips:
                print(f"   • {ip}")
            return ips
        else:
            print("No network IPs found")
            return []
    except:
        print("Could not retrieve network IPs")
        return []

def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║         Cinema App Network Setup Verification            ║
╚═══════════════════════════════════════════════════════════╝
""")
    
    # Check network IPs
    network_ips = get_network_ips()
    
    # Check frontend config
    config = check_env_file()
    if not config:
        print("\n❌ Frontend configuration incomplete")
        print("   Run: python update-network-ip.py <your-ip>")
        return 1
    
    host, port = config
    
    # Check if configured IP matches network IPs
    if network_ips and host not in network_ips and host != "localhost":
        print(f"\n⚠️  Warning: Configured IP {host} not found in network interfaces")
        print(f"   Available: {', '.join(network_ips)}")
        print(f"   Consider running: python update-network-ip.py {network_ips[0]}")
    
    # Check backend accessibility
    backend_ok = check_backend(host, port)
    
    # Check backend CORS
    cors_ok = check_application_properties(host)
    
    # Check Next.js config
    next_ok = check_next_config()
    
    # Summary
    print_header("Summary")
    
    all_ok = backend_ok and cors_ok and next_ok
    
    if all_ok:
        print("\n✅ All checks passed! Your setup looks good.\n")
        print(f"Frontend: http://{host}:3000")
        print(f"Backend:  http://{host}:{port}")
        print("\nRemember to restart the Next.js dev server after config changes!")
    else:
        print("\n❌ Some issues found. See details above.\n")
        if not backend_ok:
            print("• Backend not responding - ensure it's running:")
            print("  cd backend && .\\mvnw spring-boot:run")
        if not cors_ok:
            print("• CORS not configured - check application.properties")
        if not next_ok:
            print("• Next.js config incomplete - check next.config.ts")
    
    print("\nFor detailed troubleshooting, see: TROUBLESHOOTING.md")
    
    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
