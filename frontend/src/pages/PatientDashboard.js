import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday,
  Receipt,
  LocalPharmacy,
  Science,
  ExitToApp,
  Person,
  LocalHospital,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import BookAppointment from '../components/patient/BookAppointment';
import MyAppointments from '../components/patient/MyAppointments';
import MyPrescriptions from '../components/patient/MyPrescriptions';
import MyEMR from '../components/patient/MyEMR';
import PatientProfile from '../components/patient/PatientProfile';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../utils/apiHelpers';

const drawerWidth = 260;

function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stats, setStats] = useState({
    appointments: 0,
    upcoming: 0,
    prescriptions: 0,
    emrRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '' },
    { text: 'Book Appointment', icon: <CalendarToday />, path: 'book-appointment' },
    { text: 'My Appointments', icon: <CalendarToday />, path: 'appointments' },
    { text: 'Medical Records (EMR)', icon: <Science />, path: 'emr' },
    { text: 'Prescriptions', icon: <Receipt />, path: 'prescriptions' },
    { text: 'Profile', icon: <Person />, path: 'profile' },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsRes = await api.get('/api/appointments/patient/my-appointments/');
      const appointments = getResponseData(appointmentsRes);
      const upcoming = appointments.filter(
        (apt) => new Date(apt.appointment_date) >= new Date() && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
      );

      // Fetch prescriptions
      let prescriptions = [];
      try {
        const prescriptionsRes = await api.get('/api/prescriptions/');
        prescriptions = getResponseData(prescriptionsRes);
      } catch (presError) {
        console.log('Prescriptions not available:', presError);
      }

      // Fetch EMR records
      let emrRecords = [];
      try {
        const patientsRes = await api.get('/api/appointments/patients/');
        const patients = getResponseData(patientsRes);
        if (patients.length > 0) {
          const emrRes = await api.get(`/api/emr/patient/${patients[0].id}/`);
          emrRecords = getResponseData(emrRes);
        }
      } catch (emrError) {
        console.log('EMR not available:', emrError);
      }

      setStats({
        appointments: appointments.length,
        upcoming: upcoming.length,
        prescriptions: prescriptions.length,
        emrRecords: emrRecords.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(handleApiError(error, 'Failed to load dashboard stats'));
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
            Patient Portal
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
                    navigate(`/patient/${item.path}`);
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
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          mt: 8,
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="" element={<PatientHome stats={stats} loading={loading} />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="emr" element={<MyEMR />} />
          <Route path="prescriptions" element={<MyPrescriptions />} />
          <Route path="profile" element={<PatientProfile />} />
        </Routes>
      </Box>
    </Box>
  );
}

function PatientHome({ stats, loading }) {
  const { user } = useAuth();

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
        Welcome back, {user?.first_name}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.prescriptions}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Prescriptions
                  </Typography>
                </Box>
                <Receipt sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.emrRecords}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Medical Records
                  </Typography>
                </Box>
                <Science sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarToday color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Book Appointment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule a new appointment
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Science color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    View Medical Records
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access your EMR history
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    My Prescriptions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View all prescriptions
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}

export default PatientDashboard;
