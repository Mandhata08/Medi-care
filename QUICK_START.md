# Quick Start Guide

## Starting the Website

### Option 1: Use the Batch File (Easiest)
Double-click `start-all.bat` in the project root folder. This will start both backend and frontend servers automatically.

### Option 2: Manual Start

#### Start Backend Server:
1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Activate virtual environment (if using):
   ```bash
   venv\Scripts\activate
   ```
4. Start the server:
   ```bash
   python manage.py runserver
   ```
5. Backend will run on: http://localhost:8000

#### Start Frontend Server:
1. Open a NEW terminal/command prompt
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies (if not done):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Frontend will run on: http://localhost:3000
6. Browser should open automatically

## Troubleshooting

### If Frontend Won't Start:
1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `cd frontend && npm install`
3. Check if port 3000 is already in use

### If Backend Won't Start:
1. Make sure Python is installed: `python --version`
2. Install dependencies: `cd backend && pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Check if port 8000 is already in use

### Connection Issues:
- Make sure both servers are running
- Check that backend is on http://localhost:8000
- Check that frontend is on http://localhost:3000
- Verify the proxy setting in `frontend/package.json` points to `http://localhost:8000`

## Access the Website

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/

## Default Credentials

After running seed data:
- Super Admin: `admin@healthcare.com` / `admin123`
- Hospital Admin: `hospital1@admin.com` / `admin123`
- Doctor: `doctor1@healthcare.com` / `doctor123`

