# Network Setup Troubleshooting

## Current Status

✅ **Backend is accessible**: http://10.0.0.11:8080/api/movies returns 200 OK
✅ **Configuration files updated**: .env.local, next.config.ts, apiConfig.ts
✅ **CORS configured**: Backend accepts requests from network IPs

## The Issue You're Seeing

The warnings about "Cross origin request detected" are expected when accessing the dev server from a network IP. They're just informational warnings for a future Next.js version.

## Critical Step: Restart Frontend Server

**After editing `.env.local`, you MUST restart the Next.js dev server:**

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
cd cinema-frontend
npm run dev
```

## Testing the Setup

### 1. Verify Backend is Running

```powershell
curl http://10.0.0.11:8080/api/movies
```

Should return JSON with movie data (status 200).

### 2. Access Frontend from Your Machine

Try both:

- http://localhost:3000
- http://10.0.0.11:3000

Both should work.

### 3. Check Browser Console

Open DevTools (F12) and check the Console tab for any errors. Common issues:

- CORS errors: Backend not running or wrong IP
- Connection refused: Backend not accessible on network
- 404 errors: Frontend making requests to wrong URL

### 4. Test API Calls

On the home page, open DevTools Network tab and look for:

- Requests to `http://10.0.0.11:8080/api/showrooms`
- Requests to `http://10.0.0.11:8080/api/movies`

If you see `http://localhost:8080` instead, the `.env.local` wasn't picked up - restart the frontend server.

## Common Issues

### Frontend Still Using localhost

**Symptom**: Browser console shows requests to `localhost:8080` instead of `10.0.0.11:8080`

**Solution**:

1. Verify `.env.local` has correct IP
2. **Restart the Next.js dev server** (critical!)
3. Hard refresh browser (Ctrl+Shift+R)

### CORS Errors

**Symptom**: Browser console shows "CORS policy" errors

**Solution**:

1. Verify backend is running: `curl http://10.0.0.11:8080/api/movies`
2. Check `application.properties` has your IP in `allowed-origins`
3. Restart backend server
4. Clear browser cache

### Cannot Access from Other Devices

**Symptom**: Works on your machine but not on phones/tablets

**Solution**:

1. Check Windows Firewall:
   ```powershell
   # Allow ports 3000 and 8080
   New-NetFirewallRule -DisplayName "Cinema Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Cinema Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
   ```
2. Ensure all devices on same WiFi network
3. Disable VPN if active
4. Try from other device browser: http://10.0.0.11:3000

### Next.js Cross Origin Warnings

**Symptom**: Console shows "Cross origin request detected" warnings

**Status**: ✅ **This is normal!** These are informational warnings about a future Next.js version. Your app works fine.

The warnings appear because:

- You're accessing from network IP (10.0.0.11)
- Next.js detected this differs from localhost
- We've configured `allowedDevOrigins` to handle this

**Action needed**: None - the app works despite the warnings.

### Backend Returns HTML Instead of JSON

**Symptom**: API calls return HTML error pages

**Solution**:

1. Check backend logs for Java exceptions
2. Verify MongoDB connection in `application.properties`
3. Check if backend fully started (look for "Started CinemaApplication" in logs)

## Verify Configuration Files

### 1. Check .env.local

```powershell
cat cinema-frontend\.env.local
```

Should show:

```
NEXT_PUBLIC_API_HOST=10.0.0.11
NEXT_PUBLIC_API_PORT=8080
```

### 2. Check Backend CORS

```powershell
cat backend\src\main\resources\application.properties | Select-String -Pattern "cors"
```

Should include both IPs:

```
spring.web.cors.allowed-origins=http://10.0.0.11:3000,http://localhost:3000
```

### 3. Test Config is Loaded

In browser console on http://10.0.0.11:3000:

```javascript
// This should show your network IP
console.log(process.env.NEXT_PUBLIC_API_HOST);
```

## Complete Clean Restart

If nothing works, do a complete restart:

```powershell
# 1. Stop both servers (Ctrl+C)

# 2. Clear Next.js cache
cd cinema-frontend
rm -rf .next
rm -rf node_modules\.cache

# 3. Verify .env.local
cat .env.local

# 4. Start backend
cd ..\backend
.\mvnw spring-boot:run

# 5. Wait for backend to fully start (watch for "Started CinemaApplication")

# 6. In new terminal, start frontend
cd ..\cinema-frontend
npm run dev

# 7. Access http://10.0.0.11:3000
```

## Firewall Configuration (Windows)

If other devices can't connect:

```powershell
# Check current firewall rules
Get-NetFirewallRule -DisplayName "*Cinema*"

# Add rules if needed
New-NetFirewallRule -DisplayName "Cinema Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Cinema Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

## Still Not Working?

1. **Check if localhost works**: Try http://localhost:3000 first
2. **Test backend directly**: `curl http://10.0.0.11:8080/api/movies` should return JSON
3. **Check browser console**: F12 → Console tab for detailed errors
4. **Verify network**: `ipconfig` should show 10.0.0.11 in IPv4 addresses
5. **Check both servers running**: Backend on port 8080, Frontend on port 3000

## Success Checklist

✅ Backend accessible: `curl http://10.0.0.11:8080/api/movies` returns JSON
✅ Frontend loads: http://10.0.0.11:3000 shows cinema app
✅ Home page shows movies (not loading forever)
✅ Browser console has no red errors (warnings are OK)
✅ Network tab shows requests to `10.0.0.11:8080` not `localhost:8080`

If all checked, you're good! The cross-origin warnings are normal and can be ignored.
