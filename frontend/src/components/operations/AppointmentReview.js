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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel, Schedule, Visibility } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function AppointmentReview() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    department_id: '',
    notes: '',
    status: 'ASSIGNED',
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/appointments/operations/?status=REQUESTED');
      setAppointments(getResponseData(response));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(handleApiError(error, 'Failed to fetch appointments'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/api/hospitals/doctors/?is_active=true&is_approved=true');
      setDoctors(getResponseData(response));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/hospitals/departments/');
      setDepartments(getResponseData(response));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleReview = (appointment) => {
    setSelectedApp(appointment);
    setFormData({
      doctor_id: appointment.doctor_id || '',
      department_id: appointment.department_id || '',
      notes: '',
      status: 'ASSIGNED',
    });
    setOpenDialog(true);
  };

  const handleSubmitReview = async () => {
    try {
      await api.post(`/api/appointments/${selectedApp.id}/assign/`, formData);
      toast.success('Appointment assigned successfully');
      setOpenDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error assigning appointment:', error);
      toast.error(handleApiError(error, 'Failed to assign appointment'));
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/`, { status: newStatus });
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(handleApiError(error, 'Failed to update appointment'));
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
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return <Container>Loading appointments...</Container>;
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Appointment Requests
      </Typography>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No pending appointment requests
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.patient_name}</TableCell>
                  <TableCell>
                    {app.appointment_date} {app.appointment_time}
                  </TableCell>
                  <TableCell>{app.appointment_type}</TableCell>
                  <TableCell>
                    <Chip label={app.priority} size="small" color={app.priority === 'URGENT' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>{app.reason || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {app.status === 'REQUESTED' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircle />}
                          onClick={() => handleReview(app)}
                        >
                          Review & Assign
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusChange(app.id, 'CANCELLED')}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                    {app.status !== 'REQUESTED' && (
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => {
                          setSelectedApp(app);
                          setOpenDialog(true);
                        }}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedApp && selectedApp.status === 'REQUESTED' ? 'Review & Assign Appointment' : 'Appointment Details'}
        </DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Patient</Typography>
                  <Typography variant="body1">{selectedApp.patient_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Date & Time</Typography>
                  <Typography variant="body1">
                    {selectedApp.appointment_date} {selectedApp.appointment_time}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Type</Typography>
                  <Typography variant="body1">{selectedApp.appointment_type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Priority</Typography>
                  <Chip label={selectedApp.priority} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Reason</Typography>
                  <Typography variant="body1">{selectedApp.reason || 'N/A'}</Typography>
                </Grid>
                {selectedApp.status === 'REQUESTED' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                          value={formData.department_id}
                          onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                          label="Department"
                        >
                          <MenuItem value="">Select Department</MenuItem>
                          {departments
                            .filter(d => d.hospital === selectedApp.hospital_id)
                            .map((dept) => (
                              <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Assign Doctor</InputLabel>
                        <Select
                          value={formData.doctor_id}
                          onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                          label="Assign Doctor"
                        >
                          <MenuItem value="">Select Doctor</MenuItem>
                          {doctors
                            .filter(d => d.hospital === selectedApp.hospital_id)
                            .map((doctor) => (
                              <MenuItem key={doctor.id} value={doctor.id}>
                                {doctor.doctor_name} - {doctor.specialization}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Operations Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add notes about this appointment..."
                      />
                    </Grid>
                  </>
                )}
                {selectedApp.status !== 'REQUESTED' && selectedApp.operations_notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Operations Notes</Typography>
                    <Typography variant="body1">{selectedApp.operations_notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedApp && selectedApp.status === 'REQUESTED' && (
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              disabled={!formData.doctor_id}
            >
              Assign & Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AppointmentReview;

