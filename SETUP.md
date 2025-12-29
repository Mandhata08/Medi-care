# Quick Setup Guide

## Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional, seed data will create one)
python manage.py createsuperuser

# Load seed data
python manage.py shell
>>> from seed_data import run_seed
>>> run_seed()
>>> exit()

# Run server
python manage.py runserver
```

Backend runs on: http://localhost:8000

## Frontend Setup (3 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: http://localhost:3000

## Test Credentials

After running seed data:

- **Super Admin**: admin@healthcare.com / admin123
- **Hospital Admin**: hospital1@admin.com / admin123  
- **Doctor**: doctor1@healthcare.com / doctor123
- **Lab Admin**: lab1@admin.com / admin123
- **Pharmacy Admin**: pharmacy1@admin.com / admin123

## Troubleshooting

### Database Issues
- If PostgreSQL is not available, uncomment SQLite config in `backend/healthcare_platform/settings.py`
- Delete `db.sqlite3` and run migrations again if needed

### Port Already in Use
- Backend: Change port in `python manage.py runserver 8001`
- Frontend: Set `PORT=3001 npm start` or edit package.json

### CORS Errors
- Ensure backend CORS settings include `http://localhost:3000`
- Check that backend is running before starting frontend

### Module Not Found
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- For frontend: `rm -rf node_modules && npm install`

## Next Steps

1. Register as a new patient
2. Book an appointment with a doctor
3. Login as doctor to approve appointments
4. Create prescriptions as doctor
5. Test other roles with seed data credentials

