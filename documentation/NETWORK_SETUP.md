# Network Configuration Guide

## Overview

The cinema-app has been updated to support running on a local network instead of just localhost. All API URLs are now centralized for easier configuration.

## Your Current Network Configuration

- **Local Network IP**: `10.0.0.11`
- **Backend Port**: `8080`
- **Frontend Port**: `3000`

## Frontend Configuration

### Centralized Config File

All API URLs are now managed in: `cinema-frontend/src/config/apiConfig.ts`

This file exports:

- `API_BASE_URL` - Base backend URL (http://10.0.0.11:8080)
- `API_URL` - API endpoint base (http://10.0.0.11:8080/api)
- `AUTH_API_BASE` - Auth endpoints
- `MOVIES_API` - Movies endpoints
- `SHOWROOMS_API` - Showrooms endpoints
- `PROMOTIONS_API` - Promotions endpoints
- `BOOKINGS_API` - Bookings endpoints

### Environment Variables

Configuration is controlled via `.env.local` file in `cinema-frontend/`:

```bash
# Set to your machine's local network IP
NEXT_PUBLIC_API_HOST=10.0.0.11
NEXT_PUBLIC_API_PORT=8080
```

### Switching Between Localhost and Network

**For localhost only (single machine development):**

```bash
NEXT_PUBLIC_API_HOST=localhost
NEXT_PUBLIC_API_PORT=8080
```

**For local network access (multiple devices):**

```bash
NEXT_PUBLIC_API_HOST=10.0.0.11
NEXT_PUBLIC_API_PORT=8080
```

## Backend Configuration

### Application Properties

Updated in: `backend/src/main/resources/application.properties`

Key settings:

- `server.address=0.0.0.0` - Already configured to accept network connections
- `server.port=8080` - Backend port
- `spring.web.cors.allowed-origins` - Includes both localhost and network IP
- `app.frontend.baseUrl` - Set to network URL for email links

### CORS Configuration

All controllers now accept requests from:

- `http://localhost:3000` (for local development)
- `http://10.0.0.11:3000` (for network access)

## How to Run on Network

### 1. Start Backend

From the backend directory:

```powershell
# Using Maven wrapper
.\mvnw spring-boot:run

# Or if using the run script
python ..\run-app.py
```

The backend will be accessible at: `http://10.0.0.11:8080`

### 2. Start Frontend

From the cinema-frontend directory:

```powershell
npm run dev
```

The frontend will be accessible at: `http://localhost:3000`

### 3. Access from Other Devices

Other devices on the same network can access:

- **Frontend**: `http://10.0.0.11:3000`
- **Backend API**: `http://10.0.0.11:8080/api`

Make sure your firewall allows connections on ports 3000 and 8080.

## Finding Your Network IP

### Windows

```powershell
ipconfig | Select-String -Pattern "IPv4"
```

### macOS/Linux

```bash
ifconfig | grep "inet "
# or
ip addr show
```

Look for the IP address in the `192.168.x.x` or `10.x.x.x` range that's not `127.0.0.1`.

## Troubleshooting

### Frontend can't connect to backend

1. Verify backend is running: `http://10.0.0.11:8080/api/movies`
2. Check `.env.local` has correct IP
3. Restart frontend dev server after changing `.env.local`

### CORS errors

- Verify `application.properties` has your IP in `allowed-origins`
- Backend controllers include your IP in `@CrossOrigin` annotations
- Clear browser cache and restart both servers

### Other devices can't connect

1. Check firewall settings (Windows Defender, etc.)
2. Verify all devices are on same network
3. Try disabling VPN if active
4. Ensure backend started with `server.address=0.0.0.0`

## Files Modified

### Frontend

- ✅ Created `src/config/apiConfig.ts` - Centralized configuration
- ✅ Created `.env.local` - Environment variables
- ✅ Updated `src/libs/apiClient.ts`
- ✅ Updated `src/libs/authApi.ts`
- ✅ Updated `src/libs/cinemaApi.ts`
- ✅ Updated `src/libs/showingsApi.ts`
- ✅ Updated `src/middleware.ts`
- ✅ Updated `src/app/verify/page.tsx`
- ✅ Updated `src/app/movieBooking/page.tsx`
- ✅ Updated `src/app/movieBooking/confirm/page.tsx`
- ✅ Updated `src/app/system-admin/schedule-movie/page.tsx`
- ✅ Updated `src/app/system-admin/edit-movie/page.tsx`

### Backend

- ✅ Updated `application.properties` (CORS and frontend URLs)
- ✅ Updated `BookingController.java`
- ✅ Updated `TicketController.java`
- ✅ Updated `ShowroomController.java`
- ✅ Updated `PromotionController.java`

## Reverting to Localhost Only

If you need to revert to localhost-only operation:

1. Edit `.env.local`:

   ```bash
   NEXT_PUBLIC_API_HOST=localhost
   ```

2. Edit `application.properties`:

   ```properties
   spring.web.cors.allowed-origins=http://localhost:3000
   app.frontend.baseUrl=http://localhost:3000/
   ```

3. Restart both servers

## Next Steps

1. Test frontend access from your machine: `http://10.0.0.11:3000`
2. Test backend API directly: `http://10.0.0.11:8080/api/movies`
3. Test from another device on your network
4. Configure firewall rules if needed
5. Update IP address in `.env.local` if your network IP changes
