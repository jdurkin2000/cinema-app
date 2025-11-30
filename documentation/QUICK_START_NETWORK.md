# Quick Start - Network Access

## Auto-Configuration (No Manual Setup Required!)

The app now **automatically detects** your network IP. No need to configure IPs manually!

- **Backend**: Accepts connections from any local network IP
- **Frontend**: Auto-detects the IP from your browser URL
- **Works for everyone**: Each team member can use their own network IP

## Start Servers

### Option 1: Use Run Script (Recommended)

```powershell
# From project root
python run-app.py
```

### Option 2: Manual Start

```powershell
# Terminal 1: Backend
cd backend
.\mvnw spring-boot:run

# Terminal 2: Frontend
cd cinema-frontend
npm run dev
```

## Access from Other Devices

1. Ensure all devices are on the same network
2. Frontend: http://10.0.0.11:3000
3. Backend: http://10.0.0.11:8080

## How It Works

1. **Backend**: Configured to accept CORS from any private network IP (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
2. **Frontend**: Reads the hostname from your browser URL and uses it for API calls
3. **Result**: Works automatically on anyone's network without configuration!

## For Team Members

Each person just needs to:

1. Find their network IP: `ipconfig` (look for IPv4 Address)
2. Start both servers (backend and frontend)
3. Access `http://YOUR_IP:3000` in browser
4. That's it! No config files to edit.

## Troubleshooting

- **Can't connect?** Check Windows Firewall allows ports 3000 and 8080
- **CORS errors?** Restart both servers after IP change
- **Need localhost only?** Run: `python update-network-ip.py localhost`

See NETWORK_SETUP.md for detailed documentation.
