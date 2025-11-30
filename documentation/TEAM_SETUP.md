# Cinema App - Team Setup Guide

## Quick Start (For Team Members)

### 1. Find Your Network IP

```powershell
ipconfig
```

Look for "IPv4 Address" (usually something like `10.x.x.x` or `192.168.x.x`)

### 2. Start the Servers

```powershell
# From project root
python run-app.py
```

This starts:

- Backend on port 8080
- Frontend on port 3000

### 3. Access the App

**From your machine:**

- `http://localhost:3000`
- OR `http://YOUR_IP:3000` (e.g., http://10.0.0.11:3000)

**From other devices (phones, tablets, other computers):**

- `http://YOUR_IP:3000`

## That's It!

No configuration needed! The app automatically:

- ✅ Detects your network IP from the browser URL
- ✅ Configures API calls to use the correct IP
- ✅ Accepts CORS from any local network IP

## Troubleshooting

### Movies not loading?

- Restart the backend (the MovieController CORS fix requires restart)
- Hard refresh browser (Ctrl+Shift+R)

### Can't connect from other devices?

```powershell
# Allow ports in Windows Firewall
New-NetFirewallRule -DisplayName "Cinema Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Cinema Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### Still not working?

Check:

1. Both backend and frontend are running
2. All devices on same WiFi network
3. No VPN active
4. Firewall allows ports 3000 and 8080

## How It Works

### For Backend (Spring Boot)

- Configured to accept CORS from any private network IP pattern
- Patterns: `10.*.*.*`, `192.168.*.*`, `172.16-31.*.*`
- No hardcoded IPs needed!

### For Frontend (Next.js)

- Reads `window.location.hostname` to detect current IP
- Uses that IP for all API calls
- Works on anyone's network without config changes!

## Development

### If you need to override the auto-detection:

Edit `cinema-frontend/.env.local`:

```bash
NEXT_PUBLIC_API_HOST=some.other.ip
```

But normally you don't need to do this!
