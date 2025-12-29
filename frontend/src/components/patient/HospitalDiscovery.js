import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn,
  LocalHospital,
  Healing as Emergency,
  Bed,
  AccessTime,
  Search,
  FilterList,
  Close,
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function HospitalDiscovery({ onSelectHospital }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    specialization: '',
    emergency_available: false,
    opd_open: false,
    icu_available: false,
  });
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchHospitals();
    getCurrentLocation();
  }, [filters]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.emergency_available) params.append('emergency_available', 'true');
      if (filters.opd_open) params.append('opd_open', 'true');
      if (filters.icu_available) params.append('icu_available', 'true');
      
      if (userLocation) {
        params.append('latitude', userLocation.latitude);
        params.append('longitude', userLocation.longitude);
        params.append('radius', '50');
      }

      try {
        const response = await api.get(`/api/hospitals/map-discovery/?${params.toString()}`);
        setHospitals(getResponseData(response));
      } catch (error) {
        // Fallback to regular endpoint
        try {
          const response = await api.get(`/api/hospitals/?${params.toString()}`);
          setHospitals(getResponseData(response));
        } catch (fallbackError) {
          console.error('Error fetching hospitals:', fallbackError);
          toast.error(handleApiError(fallbackError, 'Failed to fetch hospitals'));
        }
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
    setDialogOpen(true);
  };

  const handleSelectHospital = () => {
    if (onSelectHospital && selectedHospital) {
      onSelectHospital(selectedHospital);
      setDialogOpen(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="primary" />
          Find Hospitals Near You
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Hospitals"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              placeholder="Hospital name or city"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="State"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Specialization"
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              placeholder="Cardiology, etc."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchHospitals}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label="Emergency Available"
            color={filters.emergency_available ? 'primary' : 'default'}
            onClick={() => setFilters({ ...filters, emergency_available: !filters.emergency_available })}
            icon={<Emergency />}
            clickable
          />
          <Chip
            label="OPD Open"
            color={filters.opd_open ? 'primary' : 'default'}
            onClick={() => setFilters({ ...filters, opd_open: !filters.opd_open })}
            icon={<AccessTime />}
            clickable
          />
          <Chip
            label="ICU Available"
            color={filters.icu_available ? 'primary' : 'default'}
            onClick={() => setFilters({ ...filters, icu_available: !filters.icu_available })}
            icon={<Bed />}
            clickable
          />
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {hospitals.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No hospitals found matching your criteria
                </Typography>
              </Paper>
            </Grid>
          ) : (
            hospitals.map((hospital) => (
              <Grid item xs={12} md={6} key={hospital.id}>
                <Card elevation={2} sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleHospitalClick(hospital)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {hospital.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {hospital.emergency_available && (
                          <Chip icon={<Emergency />} label="Emergency" color="error" size="small" />
                        )}
                        {hospital.opd_open && (
                          <Chip icon={<AccessTime />} label="OPD Open" color="success" size="small" />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">
                        {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Doctors: {hospital.doctor_count || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Beds: {hospital.bed_availability?.available || 0} / {hospital.bed_availability?.total || 0}
                        </Typography>
                      </Grid>
                      {hospital.emergency_wait_time !== null && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="error">
                            Emergency Wait Time: {hospital.emergency_wait_time} minutes
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleHospitalClick(hospital); }}>
                      View Details
                    </Button>
                    {onSelectHospital && (
                      <Button size="small" color="primary" onClick={(e) => { e.stopPropagation(); onSelectHospital(hospital); }}>
                        Select
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedHospital?.name}</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedHospital && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{selectedHospital.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedHospital.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Doctors</Typography>
                <Typography variant="body1">{selectedHospital.doctor_count || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Bed Availability</Typography>
                <Typography variant="body1">
                  {selectedHospital.bed_availability?.available || 0} / {selectedHospital.bed_availability?.total || 0}
                </Typography>
              </Grid>
              {selectedHospital.emergency_wait_time !== null && (
                <Grid item xs={12}>
                  <Chip
                    icon={<Emergency />}
                    label={`Emergency Wait Time: ${selectedHospital.emergency_wait_time} minutes`}
                    color="error"
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {onSelectHospital && (
            <Button variant="contained" onClick={handleSelectHospital}>
              Select Hospital
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HospitalDiscovery;

