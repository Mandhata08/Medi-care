import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ExpandMore,
  LocalHospital,
  Person,
  CalendarToday,
  MedicalServices,
  Favorite,
  MonitorHeart,
  Description,
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function MyEMR() {
  const { user } = useAuth();
  const [emrRecords, setEmrRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchEMRRecords();
    }
  }, [patientId]);

  const fetchPatientProfile = async () => {
    try {
      const response = await api.get('/api/appointments/patients/');
      const patients = getResponseData(response);
      if (patients.length > 0) {
        setPatientId(patients[0].id);
      } else {
        // Create patient profile if doesn't exist
        try {
          const createResponse = await api.post('/api/appointments/patients/', {
            date_of_birth: '2000-01-01',
            gender: 'O',
          });
          setPatientId(createResponse.data.id);
        } catch (createError) {
          console.error('Error creating patient profile:', createError);
        }
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      // Don't show error if patient doesn't exist yet
    }
  };

  const fetchEMRRecords = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/emr/patient/${patientId}/`);
      setEmrRecords(getResponseData(response));
    } catch (error) {
      console.error('Error fetching EMR records:', error);
      // Don't show error if no EMR records exist yet
      setEmrRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          My Medical Records
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete lifetime medical history across all hospitals
        </Typography>
      </Box>

      {emrRecords.length === 0 ? (
        <Alert severity="info">
          No medical records found. Your records will appear here after your first appointment.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {emrRecords.map((record) => (
            <Accordion key={record.id} elevation={2}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <CalendarToday color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{formatDate(record.visit_date)}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={record.visit_type} size="small" />
                      <Chip
                        icon={<LocalHospital />}
                        label={record.hospital?.name || 'N/A'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {record.doctor && (
                        <Chip
                          icon={<Person />}
                          label={`Dr. ${record.doctor?.doctor_name || 'N/A'}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Diagnosis */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <MedicalServices color="primary" />
                          <Typography variant="h6">Diagnosis</Typography>
                        </Box>
                        <Typography variant="body1">{record.diagnosis || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Chief Complaint */}
                  {record.chief_complaint && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Chief Complaint
                          </Typography>
                          <Typography variant="body1">{record.chief_complaint}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Treatment Plan */}
                  {record.treatment_plan && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Treatment Plan
                          </Typography>
                          <Typography variant="body1">{record.treatment_plan}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Vitals */}
                  {(record.temperature || record.blood_pressure_systolic || record.heart_rate) && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <MonitorHeart color="primary" />
                            <Typography variant="h6">Vitals</Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {record.temperature && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="text.secondary">Temperature</Typography>
                                <Typography variant="h6">{record.temperature}°F</Typography>
                              </Grid>
                            )}
                            {record.blood_pressure_systolic && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="text.secondary">Blood Pressure</Typography>
                                <Typography variant="h6">
                                  {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                                </Typography>
                              </Grid>
                            )}
                            {record.heart_rate && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="text.secondary">Heart Rate</Typography>
                                <Typography variant="h6">{record.heart_rate} bpm</Typography>
                              </Grid>
                            )}
                            {record.oxygen_saturation && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="text.secondary">O2 Saturation</Typography>
                                <Typography variant="h6">{record.oxygen_saturation}%</Typography>
                              </Grid>
                            )}
                            {record.weight && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="text.secondary">Weight</Typography>
                                <Typography variant="h6">{record.weight} kg</Typography>
                              </Grid>
                            )}
                            {record.height && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="text.secondary">Height</Typography>
                                <Typography variant="h6">{record.height} cm</Typography>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Clinical Notes */}
                  {record.clinical_notes && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Description color="primary" />
                            <Typography variant="h6">Clinical Notes</Typography>
                          </Box>
                          <Typography variant="body1">{record.clinical_notes}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Doctor Notes */}
                  {record.doctor_notes && record.doctor_notes.length > 0 && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                          {record.doctor_notes.map((note, idx) => (
                            <Box key={idx} sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {formatDate(note.created_at)} - {note.doctor_name}
                              </Typography>
                              <Typography variant="body1">{note.note}</Typography>
                              {idx < record.doctor_notes.length - 1 && <Divider sx={{ mt: 2 }} />}
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default MyEMR;
