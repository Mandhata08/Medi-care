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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  CalendarToday,
  ExitToApp,
  Assignment,
  LocalHospital,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DoctorApplications from '../components/hospital/DoctorApplications';
import api from '../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../utils/apiHelpers';

const drawerWidth = 260;

function HospitalAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stats, setStats] = useState({
    doctors: 0,
    pendingApplications: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '' },
    { text: 'Doctor Applications', icon: <Pending />, path: 'applications' },
    { text: 'Doctors', icon: <People />, path: 'doctors' },
    { text: 'Appointments', icon: <CalendarToday />, path: 'appointments' },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch doctor applications
      let pendingApplications = [];
      try {
        const applicationsRes = await api.get('/api/hospitals/doctor-applications/?status=PENDING');
        pendingApplications = getResponseData(applicationsRes);
      } catch (e) {
        console.log('Could not fetch applications');
      }

      // Fetch doctors
      let doctors = [];
      try {
        const doctorsRes = await api.get('/api/hospitals/doctors/');
        doctors = getResponseData(doctorsRes);
      } catch (e) {
        console.log('Could not fetch doctors');
      }

      // Fetch appointments
      let appointments = [];
      try {
        const appointmentsRes = await api.get('/api/appointments/');
        appointments = getResponseData(appointmentsRes);
      } catch (e) {
        console.log('Could not fetch appointments');
      }

      setStats({
        doctors: doctors.length,
        pendingApplications: pendingApplications.length,
        appointments: appointments.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          <LocalHospital sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Hospital Admin Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
            {user?.full_name}
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 500 }}>
            <ExitToApp sx={{ mr: 1 }} />
            Logout
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
                    navigate(`/hospital-admin/${item.path}`);
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
          <Route path="" element={<HospitalHome stats={stats} loading={loading} />} />
          <Route path="applications" element={<DoctorApplications />} />
          <Route path="doctors" element={<HospitalDoctors />} />
          <Route path="appointments" element={<HospitalAppointments />} />
        </Routes>
      </Box>
    </Box>
  );
}

function HospitalHome({ stats, loading }) {
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
        Hospital Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your hospital, review doctor applications, and oversee operations.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.doctors}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approved Doctors
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    {stats.pendingApplications}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Applications
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.appointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Appointments
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function HospitalDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/hospitals/doctors/');
      setDoctors(getResponseData(response));
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to fetch doctors'));
      setDoctors([]);
    } finally {
      setLoading(false);
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
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
        Hospital Doctors
      </Typography>

      {doctors.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No doctors found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Doctor Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Consultation Fee</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.doctor_name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.department_name || 'N/A'}</TableCell>
                  <TableCell>₹{doctor.consultation_fee}</TableCell>
                  <TableCell>
                    <Chip
                      label={doctor.is_approved ? 'Approved' : 'Pending'}
                      color={doctor.is_approved ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

function HospitalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/appointments/');
      setAppointments(getResponseData(response));
    } catch (error) {
      toast.error(handleApiError(error, 'Failed to fetch appointments'));
      setAppointments([]);
    } finally {
      setLoading(false);
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
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
        Hospital Appointments
      </Typography>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No appointments found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.appointment_date}</TableCell>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell>{appointment.patient_name}</TableCell>
                  <TableCell>{appointment.doctor_name || 'Not Assigned'}</TableCell>
                  <TableCell>
                    <Chip label={appointment.status} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default HospitalAdminDashboard;
