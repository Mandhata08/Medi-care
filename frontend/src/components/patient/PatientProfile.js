import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Person, Save } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function PatientProfile() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    emergency_contact: '',
    emergency_contact_name: '',
    allergies: '',
    chronic_conditions: '',
  });

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const response = await api.get('/api/appointments/patients/');
      const patients = getResponseData(response);
      if (patients.length > 0) {
        const patientData = patients[0];
        setPatient(patientData);
        setFormData({
          date_of_birth: patientData.date_of_birth || '',
          gender: patientData.gender || '',
          blood_group: patientData.blood_group || '',
          address: patientData.address || '',
          emergency_contact: patientData.emergency_contact || '',
          emergency_contact_name: patientData.emergency_contact_name || '',
          allergies: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : (patientData.allergies || ''),
          chronic_conditions: Array.isArray(patientData.chronic_conditions) ? patientData.chronic_conditions.join(', ') : (patientData.chronic_conditions || ''),
        });
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      // Don't show error if patient doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a),
        chronic_conditions: formData.chronic_conditions.split(',').map(c => c.trim()).filter(c => c),
      };

      if (patient) {
        await api.patch(`/api/appointments/patients/${patient.id}/`, payload);
      } else {
        await api.post('/api/appointments/patients/', payload);
      }
      toast.success('Profile updated successfully');
      fetchPatientProfile();
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
        My Profile
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Person color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6">{user?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  placeholder="e.g., O+, A+, B+"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Number"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies (comma-separated)"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., Penicillin, Peanuts"
                  helperText="Separate multiple allergies with commas"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chronic Conditions (comma-separated)"
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                  placeholder="e.g., Diabetes, Hypertension"
                  helperText="Separate multiple conditions with commas"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  disabled={saving}
                  fullWidth
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default PatientProfile;
