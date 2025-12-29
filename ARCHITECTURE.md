# Healthcare Platform Architecture

## Core Principles Implemented

✅ **Doctors DO NOT approve appointments** - Operations Manager handles all appointment approvals
✅ **Strong role-based access control** - Comprehensive RBAC system
✅ **Hospital-agnostic lifetime patient records** - EMR system tracks all patient history
✅ **Map-based hospital discovery** - GPS-based search with filters
✅ **Clean, professional UI** - Material-UI with modern design
✅ **API-first architecture** - RESTful APIs with proper structure

## User Roles Implemented

### Platform Level
- **Super Admin**: Onboard hospitals, set commissions, platform analytics

### Hospital Level
- **Hospital Director**: Full hospital control, financial oversight
- **Operations Manager** (CRITICAL): Reviews appointments, assigns doctors, manages queues
- **Hospital Admin**: Manages departments, doctors, infrastructure
- **Doctor**: Views assigned appointments, accesses EMR, writes prescriptions
- **Nurse/Medical Assistant**: Records vitals, assists doctors

### External Services
- **Lab Manager/Technician**: Manages lab tests and reports
- **Pharmacy Manager**: Manages pharmacy orders
- **Delivery Executive**: Handles deliveries

### Patient Side
- **Patient**: Books appointments, views records
- **Caregiver**: Manages patient records

## Appointment Lifecycle

1. **REQUESTED** - Patient books appointment
2. **REVIEWED** - Operations Manager reviews
3. **ASSIGNED** - Operations Manager assigns to doctor
4. **CONFIRMED** - Appointment confirmed
5. **IN_PROGRESS** - Doctor starts consultation
6. **COMPLETED** - Consultation completed
7. **BILLED** - Payment processed
8. **CLOSED** - Appointment closed

## Database Schema

### Core Tables
- `users` - All users with roles
- `hospitals` - Hospital information with GPS coordinates
- `departments` - Hospital departments
- `doctors` - Doctor profiles linked to hospitals/departments
- `patients` - Patient profiles (hospital-agnostic)
- `appointments` - Appointment records with Operations Manager workflow
- `emr_records` - Electronic Medical Records (lifetime)
- `prescriptions` - Digital prescriptions
- `beds` - Bed management
- `operation_theaters` - OT scheduling
- `emergency_capacity` - Emergency department tracking
- `payments` - Payment records with commission split
- `notifications` - SMS/Email/Push notifications

## API Endpoints

### Hospitals
- `GET /api/hospitals/` - List hospitals (with map filters)
- `GET /api/hospitals/map-discovery/` - Map-based discovery
- `GET /api/hospitals/<id>/` - Hospital details
- `GET /api/hospitals/departments/` - List departments
- `GET /api/hospitals/beds/` - Bed availability
- `GET /api/hospitals/emergency-capacity/<id>/` - Emergency status

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Book appointment (creates REQUESTED)
- `GET /api/appointments/operations/` - Operations Manager view
- `POST /api/appointments/<id>/assign/` - Assign to doctor
- `PATCH /api/appointments/<id>/` - Update appointment

### EMR
- `GET /api/emr/patient/<id>/` - Patient lifetime records
- `POST /api/emr/` - Create EMR record
- `GET /api/emr/<id>/` - EMR details

## Map Discovery Features

- GPS-based search (latitude/longitude + radius)
- Filter by specialization
- Filter by emergency availability
- Filter by ICU availability
- Filter by OPD open status
- Real-time bed availability
- Emergency wait times

## Payment & Commission

- Platform commission calculated automatically
- Commission rate per hospital
- Payment split: Platform commission + Hospital amount
- Supports UPI, Card, Net Banking, Cash, Wallet

## Next Steps

1. Run migrations for new models
2. Create frontend map component (Google Maps/Mapbox)
3. Build Operations Manager dashboard UI
4. Implement notification service
5. Add EMR viewer component
6. Create bed management interface

