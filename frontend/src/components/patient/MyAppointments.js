import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  LocalHospital,
  Person,
  CalendarToday,
  AccessTime,
  Description,
  Phone,
  Email,
  Close,
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments/patient/my-appointments/');
      setAppointments(getResponseData(response));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(handleApiError(error, 'Failed to fetch appointments'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'warning',
      REVIEWED: 'info',
      ASSIGNED: 'primary',
      CONFIRMED: 'success',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      BILLED: 'success',
      CLOSED: 'default',
      CANCELLED: 'error',
      RESCHEDULED: 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      REQUESTED: 'Requested',
      REVIEWED: 'Under Review',
      ASSIGNED: 'Assigned',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      BILLED: 'Billed',
      CLOSED: 'Closed',
      CANCELLED: 'Cancelled',
      RESCHEDULED: 'Rescheduled',
    };
    return labels[status] || status;
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
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
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your appointments
        </Typography>
      </Box>

      {appointments.length === 0 ? (
        <Alert severity="info">
          No appointments found. Book your first appointment to get started!
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Hospital</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Fee</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow
                  key={appointment.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewDetails(appointment)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="primary" />
                      {appointment.appointment_date}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="primary" />
                      {appointment.appointment_time}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospital fontSize="small" color="primary" />
                      {appointment.hospital_name || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {appointment.doctor_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="primary" />
                        {appointment.doctor_name}
                      </Box>
                    ) : (
                      <Chip label="Not Assigned" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={appointment.appointment_type?.replace('_', ' ') || 'OPD'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.consultation_fee ? `₹${appointment.consultation_fee}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(appointment);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Appointment Details</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedAppointment.status)}
                      color={getStatusColor(selectedAppointment.status)}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarToday fontSize="small" color="primary" />
                          <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                        </Box>
                        <Typography variant="body1">{selectedAppointment.appointment_date}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AccessTime fontSize="small" color="primary" />
                          <Typography variant="subtitle2" color="text.secondary">Time</Typography>
                        </Box>
                        <Typography variant="body1">{selectedAppointment.appointment_time}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocalHospital fontSize="small" color="primary" />
                          <Typography variant="subtitle2" color="text.secondary">Hospital</Typography>
                        </Box>
                        <Typography variant="body1">{selectedAppointment.hospital_name || 'N/A'}</Typography>
                      </Grid>
                      {selectedAppointment.doctor_name && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Person fontSize="small" color="primary" />
                            <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                          </Box>
                          <Typography variant="body1">{selectedAppointment.doctor_name}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Type
                        </Typography>
                        <Chip label={selectedAppointment.appointment_type?.replace('_', ' ') || 'OPD'} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Priority
                        </Typography>
                        <Chip
                          label={selectedAppointment.priority || 'MEDIUM'}
                          color={selectedAppointment.priority === 'URGENT' ? 'error' : 'default'}
                        />
                      </Grid>
                      {selectedAppointment.reason && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Description fontSize="small" color="primary" />
                            <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                          </Box>
                          <Typography variant="body1">{selectedAppointment.reason}</Typography>
                        </Grid>
                      )}
                      {selectedAppointment.consultation_fee && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Consultation Fee
                          </Typography>
                          <Typography variant="h6" color="primary">
                            ₹{selectedAppointment.consultation_fee}
                          </Typography>
                        </Grid>
                      )}
                      {selectedAppointment.operations_notes && (
                        <Grid item xs={12}>
                          <Alert severity="info">
                            <Typography variant="subtitle2" gutterBottom>
                              Operations Manager Notes:
                            </Typography>
                            <Typography variant="body2">{selectedAppointment.operations_notes}</Typography>
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyAppointments;
