import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Fade,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  LocalHospital,
  People,
  Assignment,
  Science,
  LocalPharmacy,
  Security,
  AccessTime,
  VerifiedUser,
  TrendingUp,
  Menu as MenuIcon,
  ArrowForward,
  CheckCircle,
  Star,
  Phone,
  Email,
  LocationOn,
  Speed,
  CloudUpload,
  Analytics,
  Shield,
} from '@mui/icons-material';

function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const features = [
    {
      icon: <LocalHospital sx={{ fontSize: 50, color: '#1976d2' }} />,
      title: 'Multi-Hospital Network',
      description: 'Access multiple hospitals and healthcare providers from a single platform.',
      color: '#1976d2',
    },
    {
      icon: <AccessTime sx={{ fontSize: 50, color: '#2e7d32' }} />,
      title: 'Easy Appointments',
      description: 'Book appointments with doctors instantly. View and manage your schedule online.',
      color: '#2e7d32',
    },
    {
      icon: <Assignment sx={{ fontSize: 50, color: '#ed6c02' }} />,
      title: 'Digital Prescriptions',
      description: 'Receive and store digital prescriptions. Never lose your medical records.',
      color: '#ed6c02',
    },
    {
      icon: <Science sx={{ fontSize: 50, color: '#9c27b0' }} />,
      title: 'Lab Reports',
      description: 'Access your lab test results online. Download reports anytime, anywhere.',
      color: '#9c27b0',
    },
    {
      icon: <LocalPharmacy sx={{ fontSize: 50, color: '#d32f2f' }} />,
      title: 'Pharmacy Integration',
      description: 'Order medicines directly from prescriptions. Track your orders in real-time.',
      color: '#d32f2f',
    },
    {
      icon: <Security sx={{ fontSize: 50, color: '#0288d1' }} />,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and secure. HIPAA compliant platform.',
      color: '#0288d1',
    },
  ];

  const benefits = [
    '24/7 Access to Medical Records',
    'Real-time Appointment Booking',
    'Secure Data Encryption',
    'Multi-device Compatibility',
    'Automated Reminders',
    'Integrated Payment System',
  ];

  const stats = [
    { number: '100+', label: 'Hospitals', icon: <LocalHospital /> },
    { number: '500+', label: 'Doctors', icon: <People /> },
    { number: '10K+', label: 'Patients', icon: <VerifiedUser /> },
    { number: '50K+', label: 'Appointments', icon: <AccessTime /> },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Premium Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
          color: scrolled ? 'text.primary' : 'white',
          transition: 'all 0.3s ease',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <LocalHospital sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: scrolled ? '#1976d2' : 'white' }}>
            HealthCare Platform
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: 500 }}>
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' },
                  px: 3,
                  fontWeight: 600,
                }}
              >
                Get Started
              </Button>
              <IconButton onClick={handleMenuOpen} color="inherit">
                <MenuIcon />
              </IconButton>
            </Box>
          )}
          {isMobile && (
            <IconButton onClick={handleMenuOpen} color="inherit">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: 3 }
        }}
      >
        <MenuItem onClick={() => { navigate('/register/doctor'); handleMenuClose(); }}>
          <People sx={{ mr: 1 }} /> Register as Doctor
        </MenuItem>
        <MenuItem onClick={() => { navigate('/register/hospital-admin'); handleMenuClose(); }}>
          <LocalHospital sx={{ mr: 1 }} /> Register as Hospital Admin
        </MenuItem>
        <MenuItem onClick={() => { navigate('/register/lab-admin'); handleMenuClose(); }}>
          <Science sx={{ mr: 1 }} /> Register as Lab Admin
        </MenuItem>
        <MenuItem onClick={() => { navigate('/register/pharmacy-admin'); handleMenuClose(); }}>
          <LocalPharmacy sx={{ mr: 1 }} /> Register as Pharmacy Admin
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate('/register/admin/secret'); handleMenuClose(); }}>
          <Shield sx={{ mr: 1 }} /> Admin Registration
        </MenuItem>
      </Menu>

      {/* Hero Section with Premium Design */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          py: { xs: 15, md: 20 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Trusted by Healthcare Professionals"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  mb: 3,
                  fontWeight: 600,
                }}
                icon={<VerifiedUser />}
              />
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  lineHeight: 1.2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Your Complete Healthcare Solution
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, lineHeight: 1.8 }}>
                Connect with doctors, manage appointments, access prescriptions, and track your health records—all in one secure, comprehensive platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: 4,
                    '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)', boxShadow: 6 },
                    transition: 'all 0.3s',
                  }}
                  endIcon={<ArrowForward />}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    borderWidth: 2,
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', borderWidth: 2 },
                  }}
                >
                  Sign In
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {benefits.slice(0, 3).map((benefit, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    <Typography variant="body2">{benefit}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    animation: 'float 6s ease-in-out infinite',
                  }}
                >
                  <LocalHospital sx={{ fontSize: 400, opacity: 0.3 }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    animation: 'float 4s ease-in-out infinite',
                    animationDelay: '1s',
                  }}
                >
                  <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 4 }}>
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      <Star sx={{ color: '#ffc107', mr: 0.5 }} />
                      4.9/5 Rating
                    </Typography>
                  </Card>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 6, mt: -5, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Card
                  elevation={3}
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                    bgcolor: 'white',
                  }}
                >
                  <Box sx={{ color: '#1976d2', mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Why Choose Us?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need for comprehensive healthcare management
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  transition: 'all 0.3s',
                  border: '1px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: 8,
                    borderColor: feature.color,
                  },
                }}
              >
                <Box sx={{ mb: 2, color: feature.color }}>{feature.icon}</Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Additional Features Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Advanced Features for Modern Healthcare
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { icon: <Speed />, title: 'Lightning Fast', desc: 'Optimized performance for instant access' },
                  { icon: <CloudUpload />, title: 'Cloud Storage', desc: 'Your data safely stored in the cloud' },
                  { icon: <Analytics />, title: 'Health Analytics', desc: 'Track your health trends over time' },
                  { icon: <Shield />, title: 'Enterprise Security', desc: 'Bank-level encryption and security' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ color: '#1976d2', mt: 0.5 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={6} sx={{ p: 4, bgcolor: 'white' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  All Benefits Included
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {benefits.map((benefit, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ color: '#2e7d32' }} />
                      <Typography>{benefit}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
              Join thousands of patients who trust us with their healthcare needs
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: 6,
                '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-3px)', boxShadow: 8 },
                transition: 'all 0.3s',
              }}
              endIcon={<ArrowForward />}
            >
              Create Your Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Premium Footer */}
      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospital sx={{ fontSize: 30, mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  HealthCare Platform
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Your trusted partner in healthcare management. Connecting patients, doctors, and healthcare providers worldwide.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip icon={<Star />} label="4.9/5" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Chip icon={<VerifiedUser />} label="Verified" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" onClick={() => navigate('/login')} sx={{ justifyContent: 'flex-start' }}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')} sx={{ justifyContent: 'flex-start' }}>
                  Register
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                For Professionals
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" onClick={() => navigate('/register/doctor')} sx={{ justifyContent: 'flex-start' }}>
                  Doctor Registration
                </Button>
                <Button color="inherit" onClick={() => navigate('/register/hospital-admin')} sx={{ justifyContent: 'flex-start' }}>
                  Hospital Admin
                </Button>
                <Button color="inherit" onClick={() => navigate('/register/lab-admin')} sx={{ justifyContent: 'flex-start' }}>
                  Lab Admin
                </Button>
                <Button color="inherit" onClick={() => navigate('/register/pharmacy-admin')} sx={{ justifyContent: 'flex-start' }}>
                  Pharmacy Admin
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 20 }} />
                  <Typography variant="body2">support@healthcare.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 20 }} />
                  <Typography variant="body2">+1 (555) 123-4567</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20 }} />
                  <Typography variant="body2">Global Healthcare Network</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2024 HealthCare Platform. All rights reserved. | HIPAA Compliant | ISO 27001 Certified
            </Typography>
          </Box>
        </Container>
      </Box>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </Box>
  );
}

export default Landing;
