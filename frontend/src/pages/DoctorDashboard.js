import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday,
  Receipt,
  ExitToApp,
  LocalHospital,
  Person,
  AccessTime,
  MedicalServices,
  Edit,
  CheckCircle,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../utils/apiHelpers';

const drawerWidth = 260;

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcoming: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '' },
    { text: 'My Appointments', icon: <CalendarToday />, path: 'appointments' },
    { text: 'Create Prescription', icon: <Receipt />, path: 'prescriptions' },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/appointments/doctor/my-appointments/');
      const appointments = getResponseData(response);
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointments.filter((apt) => apt.appointment_date === today);
      const upcoming = appointments.filter(
        (apt) =>
          new Date(apt.appointment_date) >= new Date() &&
          (apt.status === 'ASSIGNED' || apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS')
      );
      const completed = appointments.filter((apt) => apt.status === 'COMPLETED');

      setStats({
        todayAppointments: todayAppts.length,
        upcoming: upcoming.length,
        completed: completed.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Don't show error, just use empty stats
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <MedicalServices sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Doctor Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
            Dr. {user?.full_name}
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 500 }}>
            <ExitToApp sx={{ mr: 1 }} /> Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => {
                    setSelectedIndex(index);
                    navigate(`/doctor/${item.path}`);
                  }}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: selectedIndex === index ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: 8, minHeight: '100vh' }}>
        <Routes>
          <Route path="" element={<DoctorHome stats={stats} loading={loading} />} />
          <Route path="appointments" element={<DoctorAppointments onUpdate={fetchDashboardStats} />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
        </Routes>
      </Box>
    </Box>
  );
}

function DoctorHome({ stats, loading }) {
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
        Doctor Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.todayAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Today's Appointments
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.upcoming}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Upcoming
                  </Typography>
                </Box>
                <AccessTime sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function DoctorAppointments({ onUpdate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/appointments/doctor/my-appointments/');
      setAppointments(getResponseData(response));
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to fetch appointments'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to update appointment status'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ASSIGNED: 'primary',
      CONFIRMED: 'success',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
        My Appointments
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Hospital</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No appointments assigned yet
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.appointment_date}</TableCell>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell>{appointment.patient_name}</TableCell>
                  <TableCell>{appointment.hospital_name}</TableCell>
                  <TableCell>
                    <Chip label={appointment.appointment_type?.replace('_', ' ') || 'OPD'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={appointment.status} color={getStatusColor(appointment.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {(appointment.status === 'ASSIGNED' || appointment.status === 'CONFIRMED') && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleStatusChange(appointment.id, 'IN_PROGRESS')}
                        sx={{ mr: 1 }}
                      >
                        Start
                      </Button>
                    )}
                    {appointment.status === 'IN_PROGRESS' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

function DoctorPrescriptions() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Create Prescription
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Prescription creation feature coming soon...
      </Typography>
    </Container>
  );
}

export default DoctorDashboard;
