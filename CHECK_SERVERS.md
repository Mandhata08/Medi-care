# Server Status Check

## How to Check if Servers are Running

### Check Backend (Port 8000):
Open browser and go to: http://localhost:8000/api/

You should see API endpoints or a JSON response.

### Check Frontend (Port 3000):
Open browser and go to: http://localhost:3000

You should see the landing page.

## Common Issues

### Port Already in Use:
If you see "port already in use" error:

**For Backend (Port 8000):**
- Find and kill the process using port 8000
- Or change port: `python manage.py runserver 8001`

**For Frontend (Port 3000):**
- Find and kill the process using port 3000
- Or set PORT environment variable: `set PORT=3001 && npm start`

### Backend Not Starting:
1. Check if migrations are applied: `python manage.py migrate`
2. Check if database exists
3. Check Python version (should be 3.8+)

### Frontend Not Starting:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check Node.js version (should be 14+)

## Quick Fix Commands

**Windows PowerShell:**
```powershell
# Kill process on port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Windows CMD:**
```cmd
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

