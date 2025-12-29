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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday,
  People,
  LocalHospital,
  ExitToApp,
  Assignment,
  Queue,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AppointmentReview from '../components/operations/AppointmentReview';
import api from '../services/api';
import { getResponseData, handleApiError } from '../utils/apiHelpers';

const drawerWidth = 260;

function OperationsManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    assigned: 0,
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '' },
    { text: 'Appointment Requests', icon: <CalendarToday />, path: 'appointments' },
    { text: 'Queues', icon: <Queue />, path: 'queues' },
    { text: 'Doctors', icon: <People />, path: 'doctors' },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const requestedRes = await api.get('/api/appointments/operations/?status=REQUESTED');
      const requested = getResponseData(requestedRes);
      
      const today = new Date().toISOString().split('T')[0];
      let todayAppts = [];
      try {
        const todayRes = await api.get(`/api/appointments/operations/?status=ASSIGNED`);
        const allAssigned = getResponseData(todayRes);
        todayAppts = allAssigned.filter(apt => apt.appointment_date === today);
      } catch (e) {
        console.log('Could not fetch today appointments');
      }

      const assignedRes = await api.get('/api/appointments/operations/?status=ASSIGNED');
      const assigned = getResponseData(assignedRes);

      setStats({
        pending: requested.length,
        today: todayAppts.length,
        assigned: assigned.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          <Assignment sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Operations Manager Portal
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
                    navigate(`/operations-manager/${item.path}`);
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
          <Route path="" element={<OperationsHome stats={stats} loading={loading} />} />
          <Route path="appointments" element={<AppointmentReview />} />
          <Route path="queues" element={<OperationsQueues />} />
          <Route path="doctors" element={<OperationsDoctors />} />
        </Routes>
      </Box>
    </Box>
  );
}

function OperationsHome({ stats, loading }) {
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
        Operations Manager Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review appointment requests, assign doctors, and manage hospital operations.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Requests
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    {stats.today}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Today's Appointments
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    {stats.assigned}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Assigned
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function OperationsQueues() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        OPD & Emergency Queues
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Queue management feature coming soon...
      </Typography>
    </Container>
  );
}

function OperationsDoctors() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Doctors
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Doctor management feature coming soon...
      </Typography>
    </Container>
  );
}

export default OperationsManagerDashboard;
