# Multi-Tenant Healthcare SaaS Platform

A comprehensive healthcare management system supporting multiple hospitals, doctors, patients, labs, and pharmacies with role-based access control.

## Features

- **Multi-tenant Architecture**: Multiple hospitals operate under one centralized system
- **Role-Based Access Control**: Separate dashboards for Patient, Doctor, Hospital Admin, Lab Admin, Pharmacy Admin, and Super Admin
- **Appointment Management**: Book, approve, and manage appointments
- **Digital Prescriptions**: Create and manage prescriptions with medicine details
- **Lab Test Management**: Request tests and upload reports
- **Pharmacy Orders**: Manage medicine inventory and fulfill orders
- **Payment Integration**: Payment processing for consultations, lab tests, and pharmacy orders
- **Audit Logging**: Track all medical data access for compliance

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework
- PostgreSQL (SQLite for development)
- JWT Authentication
- Django CORS Headers

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Axios
- React Toastify

## Project Structure

```
.
├── backend/
│   ├── healthcare_platform/     # Django project settings
│   ├── users/                   # User management & authentication
│   ├── hospitals/               # Hospital & doctor management
│   ├── appointments/            # Appointment booking system
│   ├── prescriptions/          # Prescription management
│   ├── labs/                   # Lab test management
│   ├── pharmacy/               # Pharmacy & inventory management
│   ├── payments/               # Payment processing
│   └── seed_data.py            # Seed data script
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # React contexts (Auth)
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── App.js              # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL (optional, SQLite works for development)
- pip
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database:**
   
   For PostgreSQL, create a `.env` file in the `backend` directory:
   ```
   DB_NAME=healthcare_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```
   
   Or use SQLite (default) by commenting out PostgreSQL config in `settings.py`.

5. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Load seed data:**
   ```bash
   python manage.py shell < seed_data.py
   ```
   Or run the seed function directly:
   ```bash
   python -c "from seed_data import run_seed; run_seed()"
   ```

8. **Run development server:**
   ```bash
   python manage.py runserver
   ```
   
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   
   Frontend will be available at `http://localhost:3000`

## Default Test Credentials

After running seed data:

- **Super Admin**: `admin@healthcare.com` / `admin123`
- **Hospital Admin**: `hospital1@admin.com` / `admin123`
- **Doctor**: `doctor1@healthcare.com` / `doctor123`
- **Lab Admin**: `lab1@admin.com` / `admin123`
- **Pharmacy Admin**: `pharmacy1@admin.com` / `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new patient
- `POST /api/auth/login/` - Login
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Hospitals
- `GET /api/hospitals/` - List hospitals
- `POST /api/hospitals/` - Create hospital (Super Admin)
- `GET /api/hospitals/doctors/` - List doctors
- `POST /api/hospitals/doctors/` - Add doctor

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Book appointment
- `GET /api/appointments/patient/my-appointments/` - Patient's appointments
- `GET /api/appointments/doctor/my-appointments/` - Doctor's appointments

### Prescriptions
- `GET /api/prescriptions/` - List prescriptions
- `POST /api/prescriptions/` - Create prescription (Doctor)
- `GET /api/prescriptions/patient/my-prescriptions/` - Patient's prescriptions

### Labs
- `GET /api/labs/` - List labs
- `GET /api/labs/requests/` - List test requests
- `POST /api/labs/reports/` - Upload lab report

### Pharmacy
- `GET /api/pharmacy/` - List pharmacies
- `GET /api/pharmacy/orders/` - List orders
- `POST /api/pharmacy/orders/` - Create order

### Payments
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment
- `POST /api/payments/<id>/process/` - Process payment

## User Roles & Permissions

### Patient
- Register and login
- Search hospitals and doctors
- Book appointments
- View prescriptions, reports, and invoices

### Doctor
- View assigned appointments
- Access patient medical history
- Create digital prescriptions
- Recommend lab tests

### Hospital Admin
- Manage hospital profile
- Add/remove doctors
- Manage OPD schedules
- View hospital-level analytics

### Lab Admin
- View test requests
- Upload diagnostic reports
- Update test status

### Pharmacy Admin
- View prescriptions
- Manage medicine inventory
- Fulfill medicine orders

### Super Admin
- Onboard hospitals
- Approve doctors, labs, pharmacies
- View platform-wide analytics
- Suspend users or hospitals

## Database Models

- **User**: Custom user model with role-based access
- **Hospital**: Hospital information and admin
- **Doctor**: Doctor profiles linked to hospitals
- **Patient**: Patient profiles
- **Appointment**: Appointment bookings
- **Prescription**: Digital prescriptions
- **PrescriptionMedicine**: Medicines in prescriptions
- **LabTestRecommendation**: Lab test recommendations
- **Lab**: Lab information
- **LabTestRequest**: Test requests
- **LabReport**: Uploaded test reports
- **Pharmacy**: Pharmacy information
- **PharmacyOrder**: Medicine orders
- **Payment**: Payment transactions
- **AuditLog**: Access audit trail

## Security Features

- JWT-based authentication
- Role-based middleware
- Secure password hashing
- Encrypted sensitive fields
- Audit logs for medical access
- CORS configuration

## Development Notes

- The system uses Django REST Framework for API development
- React frontend communicates with Django backend via REST APIs
- JWT tokens are stored in localStorage
- All API endpoints require authentication except registration and login
- Role-based permissions are enforced at both API and frontend levels

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in Django settings
2. Configure proper database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Use environment variables for sensitive data
5. Set up HTTPS
6. Configure static file serving
7. Set up proper logging
8. Use a production WSGI server (Gunicorn)
9. Set up reverse proxy (Nginx)

## License

This project is built for educational and commercial use.

## Support

For issues or questions, please refer to the documentation or contact the development team.

