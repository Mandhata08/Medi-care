import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import { handleApiError } from '../utils/apiHelpers';

function RegisterPharmacyAdmin() {
  const [formData, setFormData] = useState({ email: '', password: '', password2: '', first_name: '', last_name: '', phone: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password2) { setError('Passwords do not match'); return; }
    try {
      const response = await api.post('/api/auth/register/PHARMACY_ADMIN/', formData);
      if (response.data) { toast.success('Registration successful! Please wait for admin approval.'); navigate('/login'); }
    } catch (error) {
      const errorMsg = handleApiError(error, 'Registration failed');
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ padding: { xs: 3, sm: 4 }, width: '100%', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>Register as Pharmacy Admin</Typography>
            <Typography variant="body2" color="textSecondary">Manage your pharmacy</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField required fullWidth id="first_name" label="First Name" name="first_name" autoFocus value={formData.first_name} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField required fullWidth id="last_name" label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} /></Grid>
              <Grid item xs={12}><TextField required fullWidth id="email" label="Email Address" name="email" autoComplete="email" value={formData.email} onChange={handleChange} /></Grid>
              <Grid item xs={12}><TextField fullWidth id="phone" label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField required fullWidth name="password" label="Password" type="password" id="password" value={formData.password} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField required fullWidth name="password2" label="Confirm Password" type="password" id="password2" value={formData.password2} onChange={handleChange} /></Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Register</Button>
            <Button fullWidth variant="text" onClick={() => navigate('/login')}>Already have an account? Login</Button>
            <Button fullWidth variant="text" onClick={() => navigate('/')}>Back to Home</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPharmacyAdmin;

