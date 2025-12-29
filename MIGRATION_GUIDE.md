# Migration Guide

## Important: Run These Commands

After the major restructuring, you need to:

### 1. Create New Migrations

```bash
cd backend
python manage.py makemigrations users
python manage.py makemigrations hospitals
python manage.py makemigrations appointments
python manage.py makemigrations emr
python manage.py makemigrations notifications
python manage.py makemigrations payments
```

### 2. Apply Migrations

```bash
python manage.py migrate
```

### 3. Note About GeoDjango

The system uses latitude/longitude for map features. For production with PostGIS:

1. Install PostGIS extension in PostgreSQL
2. Uncomment GeoDjango in settings.py
3. Update requirements.txt with proper GDAL version for your OS

For now, the system works with regular lat/long fields.

## Key Changes

### User Roles Updated
- Added: HOSPITAL_DIRECTOR, OPERATIONS_MANAGER, NURSE, MEDICAL_ASSISTANT, CAREGIVER
- All roles now properly defined

### Appointment Flow Changed
- **OLD**: Patient → Doctor approves
- **NEW**: Patient → Operations Manager reviews → Assigns to Doctor

### New Models
- `DoctorApplication` - Doctors apply to hospitals
- `Department` - Hospital departments
- `Bed` - Bed management
- `OperationTheater` - OT scheduling
- `EmergencyCapacity` - Emergency tracking
- `EMRRecord` - Lifetime medical records
- `VitalsRecord` - Vitals by nurses
- `Notification` - SMS/Email/Push system

### Hospital Model Enhanced
- Added GPS coordinates (latitude/longitude)
- Added subscription_tier and commission_rate
- Added opd_open and emergency_available status

## Testing the New Flow

1. **Register as Doctor**: Apply to a hospital
2. **Hospital Admin**: Approve doctor application
3. **Patient**: Book appointment (status: REQUESTED)
4. **Operations Manager**: Review and assign to doctor (status: ASSIGNED)
5. **Doctor**: Mark as IN_PROGRESS, then COMPLETED
6. **System**: Auto-creates EMR record

## API Endpoints Summary

### Map Discovery
- `GET /api/hospitals/map-discovery/?latitude=X&longitude=Y&radius=50`
- Filters: specialization, emergency_available, opd_open, icu_available

### Operations Manager
- `GET /api/appointments/operations/?status=REQUESTED`
- `POST /api/appointments/<id>/assign/` - Assign to doctor

### EMR
- `GET /api/emr/patient/<patient_id>/` - Lifetime records
- `POST /api/emr/` - Create EMR (doctors only)

### Notifications
- `GET /api/notifications/` - User notifications
- `PATCH /api/notifications/<id>/read/` - Mark as read

