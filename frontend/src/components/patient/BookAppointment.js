import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  LocalHospital,
  CalendarToday,
  Description,
  CheckCircle,
  Person,
  Phone,
  Email,
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import HospitalDiscovery from './HospitalDiscovery';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

const steps = ['Find Hospital', 'Select Doctor & Time', 'Review & Confirm'];
const appointmentTypes = ['OPD', 'TELE_CONSULT', 'EMERGENCY', 'FOLLOW_UP', 'HOME_VISIT'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function BookAppointment() {
  const [activeStep, setActiveStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('OPD');
  const [priority, setPriority] = useState('MEDIUM');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      fetchDepartments(selectedHospital.id);
      fetchDoctors(selectedHospital.id);
    }
  }, [selectedHospital]);

  useEffect(() => {
    if (selectedHospital && selectedDepartment) {
      fetchDoctors(selectedHospital.id, selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/api/hospitals/?is_active=true&is_approved=true');
      setHospitals(getResponseData(response));
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error(handleApiError(error, 'Failed to fetch hospitals'));
    }
  };

  const fetchDepartments = async (hospitalId) => {
    try {
      const response = await api.get(`/api/hospitals/departments/?hospital=${hospitalId}`);
      setDepartments(getResponseData(response));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctors = async (hospitalId, departmentId = null) => {
    setFetchingDoctors(true);
    try {
      let url = `/api/hospitals/doctors/?hospital=${hospitalId}&is_active=true&is_approved=true`;
      if (departmentId) {
        url += `&department=${departmentId}`;
      }
      const response = await api.get(url);
      setDoctors(getResponseData(response));
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to fetch doctors'));
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setActiveStep(1);
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (!selectedDoctor || !appointmentDate || !appointmentTime) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!selectedHospital || !appointmentDate || !appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hospital_id: selectedHospital.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: appointmentType,
        priority: priority,
        reason: reason,
      };

      if (selectedDepartment) {
        payload.department_id = selectedDepartment;
      }

      if (selectedDoctor) {
        payload.doctor_id = selectedDoctor;
      }

      await api.post('/api/appointments/', payload);
      toast.success('Appointment requested successfully! It will be reviewed by Operations Manager.');
      
      // Reset form
      setSelectedHospital(null);
      setSelectedDepartment('');
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentType('OPD');
      setPriority('MEDIUM');
      setReason('');
      setActiveStep(0);
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to book appointment'));
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600, color: 'primary.main' }}>
          Book Appointment
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 1: Find and Select a Hospital
            </Typography>
            <HospitalDiscovery onSelectHospital={handleHospitalSelect} />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 2: Select Doctor & Appointment Details
            </Typography>
            
            {selectedHospital && (
              <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalHospital />
                    <Typography variant="h6">{selectedHospital.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">
                      {selectedHospital.address}, {selectedHospital.city}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone fontSize="small" />
                      <Typography variant="body2">{selectedHospital.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email fontSize="small" />
                      <Typography variant="body2">{selectedHospital.email}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Department (Optional)</InputLabel>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    label="Department (Optional)"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Doctor (Optional)</InputLabel>
                  <Select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    label="Doctor (Optional)"
                    disabled={fetchingDoctors}
                  >
                    <MenuItem value="">Any Available Doctor</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.doctor_name} - {doctor.specialization} (₹{doctor.consultation_fee})
                      </MenuItem>
                    ))}
                  </Select>
                  {fetchingDoctors && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Appointment Date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getMinDate() }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Appointment Time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    label="Appointment Type"
                  >
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    label="Priority"
                  >
                    {priorities.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Visit"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for the appointment..."
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 3: Review & Confirm
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Your appointment request will be reviewed by the Operations Manager. You will be notified once it's assigned to a doctor.
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Hospital</Typography>
                    <Typography variant="h6">{selectedHospital?.name}</Typography>
                  </Grid>
                  {selectedDoctor && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1">
                        {doctors.find(d => d.id === parseInt(selectedDoctor))?.doctor_name || 'Any Available Doctor'}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                    <Typography variant="body1">
                      {appointmentDate} at {appointmentTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                    <Chip label={appointmentType.replace('_', ' ')} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                    <Chip 
                      label={priority} 
                      color={priority === 'URGENT' ? 'error' : priority === 'HIGH' ? 'warning' : 'default'}
                    />
                  </Grid>
                  {reason && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                      <Typography variant="body1">{reason}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                size="large"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default BookAppointment;
