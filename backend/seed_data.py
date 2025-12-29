"""
Seed data script for healthcare platform
Run: python manage.py shell < seed_data.py
Or: python manage.py runscript seed_data (if using django-extensions)
"""

from users.models import User
from hospitals.models import Hospital, Doctor, OPDSchedule
from appointments.models import Patient
from prescriptions.models import Medicine
from labs.models import Lab, LabTest
from pharmacy.models import Pharmacy
from datetime import date, time, timedelta


def create_super_admin():
    """Create super admin user"""
    if not User.objects.filter(role='SUPER_ADMIN').exists():
        super_admin = User.objects.create_superuser(
            email='admin@healthcare.com',
            password='admin123',
            first_name='Super',
            last_name='Admin',
            role='SUPER_ADMIN',
            is_verified=True
        )
        print(f"Created Super Admin: {super_admin.email}")
        return super_admin
    return User.objects.get(role='SUPER_ADMIN')


def create_hospitals():
    """Create sample hospitals"""
    hospitals_data = [
        {
            'name': 'City General Hospital',
            'address': '123 Main Street',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'pincode': '400001',
            'phone': '+91-22-12345678',
            'email': 'info@citygeneral.com',
            'license_number': 'HOSP001',
        },
        {
            'name': 'Metro Healthcare',
            'address': '456 Park Avenue',
            'city': 'Delhi',
            'state': 'Delhi',
            'pincode': '110001',
            'phone': '+91-11-87654321',
            'email': 'contact@metrohealth.com',
            'license_number': 'HOSP002',
        },
    ]
    
    hospitals = []
    for i, data in enumerate(hospitals_data):
        if not Hospital.objects.filter(license_number=data['license_number']).exists():
            admin_user = User.objects.create_user(
                email=f'hospital{i+1}@admin.com',
                password='admin123',
                first_name=f'Hospital{i+1}',
                last_name='Admin',
                role='HOSPITAL_ADMIN',
                is_verified=True
            )
            
            hospital = Hospital.objects.create(
                admin=admin_user,
                is_approved=True,
                **data
            )
            hospitals.append(hospital)
            print(f"Created Hospital: {hospital.name}")
        else:
            hospitals.append(Hospital.objects.get(license_number=data['license_number']))
    
    return hospitals


def create_doctors(hospitals):
    """Create sample doctors"""
    doctors_data = [
        {
            'specialization': 'Cardiology',
            'qualification': 'MBBS, MD Cardiology',
            'license_number': 'DOC001',
            'experience_years': 10,
            'consultation_fee': 500.00,
            'bio': 'Experienced cardiologist with expertise in heart diseases.',
        },
        {
            'specialization': 'Pediatrics',
            'qualification': 'MBBS, MD Pediatrics',
            'license_number': 'DOC002',
            'experience_years': 8,
            'consultation_fee': 400.00,
            'bio': 'Dedicated pediatrician caring for children\'s health.',
        },
        {
            'specialization': 'Orthopedics',
            'qualification': 'MBBS, MS Orthopedics',
            'license_number': 'DOC003',
            'experience_years': 12,
            'consultation_fee': 600.00,
            'bio': 'Expert in bone and joint treatments.',
        },
    ]
    
    doctors = []
    for i, data in enumerate(doctors_data):
        if not Doctor.objects.filter(license_number=data['license_number']).exists():
            doctor_user = User.objects.create_user(
                email=f'doctor{i+1}@healthcare.com',
                password='doctor123',
                first_name=f'Dr. Doctor{i+1}',
                last_name='Specialist',
                role='DOCTOR',
                is_verified=True
            )
            
            doctor = Doctor.objects.create(
                user=doctor_user,
                hospital=hospitals[i % len(hospitals)],
                is_approved=True,
                **data
            )
            doctors.append(doctor)
            print(f"Created Doctor: {doctor.user.full_name} - {doctor.specialization}")
        else:
            doctors.append(Doctor.objects.get(license_number=data['license_number']))
    
    return doctors


def create_opd_schedules(doctors):
    """Create OPD schedules for doctors"""
    days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    
    for doctor in doctors:
        for day in days:
            if not OPDSchedule.objects.filter(doctor=doctor, day=day).exists():
                OPDSchedule.objects.create(
                    doctor=doctor,
                    day=day,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    max_appointments=20
                )
        print(f"Created OPD schedules for {doctor.user.full_name}")


def create_medicines():
    """Create sample medicines"""
    medicines_data = [
        {'name': 'Paracetamol', 'generic_name': 'Acetaminophen', 'manufacturer': 'ABC Pharma', 
         'dosage_form': 'Tablet', 'strength': '500mg'},
        {'name': 'Amoxicillin', 'generic_name': 'Amoxicillin', 'manufacturer': 'XYZ Pharma',
         'dosage_form': 'Capsule', 'strength': '250mg'},
        {'name': 'Ibuprofen', 'generic_name': 'Ibuprofen', 'manufacturer': 'DEF Pharma',
         'dosage_form': 'Tablet', 'strength': '400mg'},
    ]
    
    medicines = []
    for data in medicines_data:
        medicine, created = Medicine.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"Created Medicine: {medicine.name}")
        medicines.append(medicine)
    
    return medicines


def create_labs():
    """Create sample labs"""
    labs_data = [
        {
            'name': 'City Diagnostic Lab',
            'address': '789 Test Street',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'phone': '+91-22-11111111',
            'email': 'info@citylab.com',
            'license_number': 'LAB001',
        },
    ]
    
    labs = []
    for i, data in enumerate(labs_data):
        if not Lab.objects.filter(license_number=data['license_number']).exists():
            lab_admin = User.objects.create_user(
                email=f'lab{i+1}@admin.com',
                password='admin123',
                first_name=f'Lab{i+1}',
                last_name='Admin',
                role='LAB_ADMIN',
                is_verified=True
            )
            
            lab = Lab.objects.create(
                admin=lab_admin,
                is_approved=True,
                **data
            )
            labs.append(lab)
            print(f"Created Lab: {lab.name}")
        else:
            labs.append(Lab.objects.get(license_number=data['license_number']))
    
    return labs


def create_lab_tests():
    """Create sample lab tests"""
    tests_data = [
        {'name': 'Complete Blood Count (CBC)', 'description': 'Blood test to evaluate overall health', 'price': 500.00},
        {'name': 'Blood Sugar (Fasting)', 'description': 'Fasting blood glucose test', 'price': 200.00},
        {'name': 'Lipid Profile', 'description': 'Cholesterol and triglyceride test', 'price': 800.00},
    ]
    
    tests = []
    for data in tests_data:
        test, created = LabTest.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"Created Lab Test: {test.name}")
        tests.append(test)
    
    return tests


def create_pharmacies():
    """Create sample pharmacies"""
    pharmacies_data = [
        {
            'name': 'City Pharmacy',
            'address': '321 Medicine Lane',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'phone': '+91-22-22222222',
            'email': 'info@citypharma.com',
            'license_number': 'PHARM001',
        },
    ]
    
    pharmacies = []
    for i, data in enumerate(pharmacies_data):
        if not Pharmacy.objects.filter(license_number=data['license_number']).exists():
            pharma_admin = User.objects.create_user(
                email=f'pharmacy{i+1}@admin.com',
                password='admin123',
                first_name=f'Pharmacy{i+1}',
                last_name='Admin',
                role='PHARMACY_ADMIN',
                is_verified=True
            )
            
            pharmacy = Pharmacy.objects.create(
                admin=pharma_admin,
                is_approved=True,
                **data
            )
            pharmacies.append(pharmacy)
            print(f"Created Pharmacy: {pharmacy.name}")
        else:
            pharmacies.append(Pharmacy.objects.get(license_number=data['license_number']))
    
    return pharmacies


def run_seed():
    """Run all seed functions"""
    print("Starting seed data creation...")
    print("=" * 50)
    
    create_super_admin()
    hospitals = create_hospitals()
    doctors = create_doctors(hospitals)
    create_opd_schedules(doctors)
    create_medicines()
    create_labs()
    create_lab_tests()
    create_pharmacies()
    
    print("=" * 50)
    print("Seed data creation completed!")
    print("\nTest Credentials:")
    print("Super Admin: admin@healthcare.com / admin123")
    print("Hospital Admin: hospital1@admin.com / admin123")
    print("Doctor: doctor1@healthcare.com / doctor123")
    print("Lab Admin: lab1@admin.com / admin123")
    print("Pharmacy Admin: pharmacy1@admin.com / admin123")


if __name__ == '__main__':
    run_seed()

