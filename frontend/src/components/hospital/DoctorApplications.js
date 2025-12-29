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
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function DoctorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hospitals/doctor-applications/');
      setApplications(getResponseData(response));
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(handleApiError(error, 'Failed to fetch applications'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application, actionType) => {
    setSelectedApp(application);
    setAction(actionType);
    setNotes('');
    setOpenDialog(true);
  };

  const handleSubmitReview = async () => {
    try {
      await api.patch(`/api/hospitals/doctor-applications/${selectedApp.id}/`, {
        status: action,
        notes: notes,
      });
      toast.success(`Application ${action.toLowerCase()} successfully`);
      setOpenDialog(false);
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error(handleApiError(error, 'Failed to review application'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return <Container>Loading applications...</Container>;
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Doctor Applications
      </Typography>

      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No pending applications
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Qualification</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Consultation Fee</TableCell>
                <TableCell>Applied At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.doctor_name}</TableCell>
                  <TableCell>{app.doctor_email}</TableCell>
                  <TableCell>{app.specialization}</TableCell>
                  <TableCell>{app.qualification}</TableCell>
                  <TableCell>{app.experience_years} years</TableCell>
                  <TableCell>₹{app.consultation_fee}</TableCell>
                  <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {app.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleReview(app, 'APPROVED')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleReview(app, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {app.status !== 'PENDING' && app.notes && (
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => {
                          setSelectedApp(app);
                          setNotes(app.notes);
                          setAction(app.status);
                          setOpenDialog(true);
                        }}
                      >
                        View Notes
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'APPROVED' ? 'Approve' : action === 'REJECTED' ? 'Reject' : 'View'} Application
        </DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Doctor: {selectedApp.doctor_name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Specialization: {selectedApp.specialization}
              </Typography>
              {action !== 'REJECTED' && action !== 'APPROVED' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Status: {selectedApp.status}
                </Alert>
              )}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
                placeholder={action === 'APPROVED' ? 'Add approval notes (optional)' : action === 'REJECTED' ? 'Add rejection reason (optional)' : ''}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {(action === 'APPROVED' || action === 'REJECTED') && (
            <Button onClick={handleSubmitReview} variant="contained" color={action === 'APPROVED' ? 'success' : 'error'}>
              {action === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DoctorApplications;

