import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getResponseData, handleApiError } from '../utils/apiHelpers';

function RegisterDoctor() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    specialization: '',
    qualification: '',
    license_number: '',
    experience_years: '',
    consultation_fee: '',
    bio: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await api.get('/api/hospitals/?is_active=true&is_approved=true');
      setHospitals(getResponseData(response));
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error(handleApiError(error, 'Failed to load hospitals'));
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    if (!selectedHospital) {
      setError('Please select a hospital');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register as doctor
      const registerResponse = await api.post('/api/auth/register/DOCTOR/', {
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });

      if (registerResponse.data) {
        // Step 2: Login to get token
        const loginResponse = await api.post('/api/auth/login/', {
          email: formData.email,
          password: formData.password,
        });

        if (loginResponse.data.tokens) {
          localStorage.setItem('token', loginResponse.data.tokens.access);
          localStorage.setItem('refresh', loginResponse.data.tokens.refresh);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.tokens.access}`;

          // Step 3: Apply to hospital
          const applicationResponse = await api.post('/api/hospitals/doctor-applications/', {
            hospital_id: selectedHospital,
            specialization: formData.specialization,
            qualification: formData.qualification,
            license_number: formData.license_number,
            experience_years: parseInt(formData.experience_years) || 0,
            consultation_fee: parseFloat(formData.consultation_fee) || 0,
            bio: formData.bio,
          });

          toast.success('Application submitted successfully! The hospital will review your application.');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = handleApiError(error, 'Registration failed');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            padding: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 3,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Register as Doctor
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Apply to join a hospital on our platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoFocus
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  id="password2"
                  value={formData.password2}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
              Professional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Select Hospital"
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  SelectProps={{ native: true }}
                  disabled={loadingHospitals}
                  helperText={loadingHospitals ? 'Loading hospitals...' : 'Choose the hospital you want to join'}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.city}, {hospital.state}
                    </option>
                  ))}
                </TextField>
                {loadingHospitals && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="specialization"
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="qualification"
                  label="Qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., MBBS, MD"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="license_number"
                  label="Medical License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="experience_years"
                  label="Years of Experience"
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="consultation_fee"
                  label="Consultation Fee (₹)"
                  name="consultation_fee"
                  type="number"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  id="bio"
                  label="Bio (Optional)"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || loadingHospitals}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </Button>
            <Button fullWidth variant="text" onClick={() => navigate('/login')}>
              Already have an account? Login
            </Button>
            <Button fullWidth variant="text" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterDoctor;
