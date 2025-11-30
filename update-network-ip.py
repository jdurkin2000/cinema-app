"""
Update Network IP Configuration

This script updates the network IP address across all configuration files.
Run this whenever your local network IP changes.

Usage: python update-network-ip.py <new-ip-address>
Example: python update-network-ip.py 10.0.0.15
"""

import sys
import re
from pathlib import Path

def update_ip(old_ip: str, new_ip: str):
    """Update IP address in all config files"""
    
    root = Path(__file__).parent
    
    # Files to update
    files_to_update = {
        # Frontend
        root / "cinema-frontend" / ".env.local": [
            (f"NEXT_PUBLIC_API_HOST={old_ip}", f"NEXT_PUBLIC_API_HOST={new_ip}")
        ],
        root / "cinema-frontend" / "src" / "config" / "apiConfig.ts": [
            (f'const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "{old_ip}";',
             f'const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "{new_ip}";')
        ],
        # Backend
        root / "backend" / "src" / "main" / "resources" / "application.properties": [
            (f"http://{old_ip}:3000", f"http://{new_ip}:3000"),
            (f"http://{old_ip}:8080", f"http://{new_ip}:8080"),
        ],
    }
    
    # Java controllers pattern
    java_pattern = f'"http://{old_ip}:3000"'
    java_replacement = f'"http://{new_ip}:3000"'
    
    java_controllers = [
        root / "backend" / "src" / "main" / "java" / "edu" / "uga" / "csci4050" / "cinema" / "controller" / f"{name}.java"
        for name in ["BookingController", "TicketController", "ShowroomController", "PromotionController"]
    ]
    
    print(f"Updating IP from {old_ip} to {new_ip}...\n")
    
    # Update config files
    for file_path, replacements in files_to_update.items():
        if not file_path.exists():
            print(f"⚠️  Skipping {file_path.name} (not found)")
            continue
            
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        for old_text, new_text in replacements:
            content = content.replace(old_text, new_text)
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Updated {file_path.relative_to(root)}")
        else:
            print(f"ℹ️  No changes needed in {file_path.name}")
    
    # Update Java controllers
    for controller_path in java_controllers:
        if not controller_path.exists():
            print(f"⚠️  Skipping {controller_path.name} (not found)")
            continue
            
        content = controller_path.read_text(encoding='utf-8')
        original_content = content
        
        content = content.replace(java_pattern, java_replacement)
        
        if content != original_content:
            controller_path.write_text(content, encoding='utf-8')
            print(f"✅ Updated {controller_path.relative_to(root)}")
        else:
            print(f"ℹ️  No changes needed in {controller_path.name}")
    
    print(f"\n✨ IP address updated successfully!")
    print(f"\n⚠️  Remember to:")
    print(f"   1. Restart the backend server")
    print(f"   2. Restart the frontend dev server")
    print(f"   3. Update firewall rules if needed")

def get_current_ip():
    """Get the current IP from .env.local"""
    env_file = Path(__file__).parent / "cinema-frontend" / ".env.local"
    if env_file.exists():
        content = env_file.read_text()
        match = re.search(r'NEXT_PUBLIC_API_HOST=(\S+)', content)
        if match:
            return match.group(1)
    return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        current = get_current_ip()
        print("Update Network IP Configuration")
        print("=" * 50)
        if current:
            print(f"Current IP: {current}")
        print(f"\nUsage: python {Path(__file__).name} <new-ip-address>")
        print(f"Example: python {Path(__file__).name} 10.0.0.15")
        print("\nTo find your current IP:")
        print("  Windows: ipconfig | Select-String -Pattern 'IPv4'")
        print("  Linux/Mac: ifconfig | grep 'inet '")
        sys.exit(1)
    
    new_ip = sys.argv[1]
    current_ip = get_current_ip()
    
    if not current_ip:
        print("❌ Could not find current IP in .env.local")
        print("   Please ensure the file exists with NEXT_PUBLIC_API_HOST set")
        sys.exit(1)
    
    # Validate IP format (basic)
    if not re.match(r'^(\d{1,3}\.){3}\d{1,3}$|^localhost$', new_ip):
        print(f"❌ Invalid IP format: {new_ip}")
        print("   Expected format: xxx.xxx.xxx.xxx or 'localhost'")
        sys.exit(1)
    
    if current_ip == new_ip:
        print(f"ℹ️  IP is already set to {new_ip}")
        sys.exit(0)
    
    # Confirm before updating
    print(f"Current IP: {current_ip}")
    print(f"New IP:     {new_ip}")
    confirm = input("\nProceed with update? (y/N): ")
    
    if confirm.lower() != 'y':
        print("❌ Update cancelled")
        sys.exit(0)
    
    update_ip(current_ip, new_ip)
