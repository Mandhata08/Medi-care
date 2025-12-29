import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function PharmacyAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed"><Toolbar><Typography variant="h6" sx={{ flexGrow: 1 }}>Pharmacy Admin Portal</Typography><Button color="inherit" onClick={() => { logout(); navigate('/login'); }}><ExitToApp /> Logout</Button></Toolbar></AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}><Container><Typography variant="h4">Pharmacy Admin Dashboard</Typography></Container></Box>
    </Box>
  );
}

export default PharmacyAdminDashboard;

