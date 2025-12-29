# Troubleshooting Guide

## Website Not Running - Step by Step Fix

### Step 1: Check if Servers are Running

**Check Backend:**
- Open browser: http://localhost:8000/api/
- Should see API response or endpoints
- If error, backend is not running

**Check Frontend:**
- Open browser: http://localhost:3000
- Should see landing page
- If blank/error, frontend is not running

### Step 2: Start Backend Server

1. Open Command Prompt or PowerShell
2. Navigate to backend folder:
   ```cmd
   cd "C:\Users\Mandhata Singh\Desktop\business\backend"
   ```
3. Activate virtual environment:
   ```cmd
   venv\Scripts\activate
   ```
4. Start server:
   ```cmd
   python manage.py runserver
   ```
5. You should see: "Starting development server at http://127.0.0.1:8000/"

### Step 3: Start Frontend Server

1. Open a NEW Command Prompt or PowerShell window
2. Navigate to frontend folder:
   ```cmd
   cd "C:\Users\Mandhata Singh\Desktop\business\frontend"
   ```
3. Install dependencies (if not done):
   ```cmd
   npm install
   ```
4. Start server:
   ```cmd
   npm start
   ```
5. Browser should open automatically to http://localhost:3000

### Step 4: Verify Both Servers

- Backend: http://localhost:8000/api/ (should respond)
- Frontend: http://localhost:3000 (should show landing page)

## Common Errors and Fixes

### Error: "Port 8000 already in use"
**Fix:**
```cmd
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with number from above)
taskkill /PID <PID> /F
```

### Error: "Port 3000 already in use"
**Fix:**
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Error: "Cannot find module"
**Fix:**
```cmd
cd frontend
npm install
```

### Error: "No module named 'django'"
**Fix:**
```cmd
cd backend
pip install -r requirements.txt
```

### Error: "Database does not exist"
**Fix:**
```cmd
cd backend
python manage.py migrate
```

### Error: "Proxy error" or "Connection refused"
**Fix:**
1. Make sure backend is running on http://localhost:8000
2. Check `frontend/package.json` has: `"proxy": "http://localhost:8000"`
3. Restart frontend server

## Quick Test

1. **Test Backend API:**
   - Open: http://localhost:8000/api/hospitals/
   - Should return JSON data or empty array

2. **Test Frontend:**
   - Open: http://localhost:3000
   - Should show landing page with "HealthCare Platform"

## Still Not Working?

1. Check if Python is installed: `python --version` (should be 3.8+)
2. Check if Node.js is installed: `node --version` (should be 14+)
3. Check if both terminals show no errors
4. Try clearing browser cache
5. Try different browser

## Need Help?

Check the console/terminal output for specific error messages and share them for further assistance.

