import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterDoctor from './pages/RegisterDoctor';
import RegisterHospitalAdmin from './pages/RegisterHospitalAdmin';
import RegisterLabAdmin from './pages/RegisterLabAdmin';
import RegisterPharmacyAdmin from './pages/RegisterPharmacyAdmin';
import RegisterSuperAdmin from './pages/RegisterSuperAdmin';

// Role-based dashboards
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import OperationsManagerDashboard from './pages/OperationsManagerDashboard';
import LabAdminDashboard from './pages/LabAdminDashboard';
import PharmacyAdminDashboard from './pages/PharmacyAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />
          <Route path="/register/hospital-admin" element={<RegisterHospitalAdmin />} />
          <Route path="/register/lab-admin" element={<RegisterLabAdmin />} />
          <Route path="/register/pharmacy-admin" element={<RegisterPharmacyAdmin />} />
          <Route path="/register/admin/secret" element={<RegisterSuperAdmin />} />
          
          <Route
            path="/patient/*"
            element={
              <PrivateRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/*"
            element={
              <PrivateRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/hospital-admin/*"
            element={
              <PrivateRoute allowedRoles={['HOSPITAL_ADMIN']}>
                <HospitalAdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/operations-manager/*"
            element={
              <PrivateRoute allowedRoles={['OPERATIONS_MANAGER']}>
                <OperationsManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/lab-admin/*"
            element={
              <PrivateRoute allowedRoles={['LAB_ADMIN']}>
                <LabAdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacy-admin/*"
            element={
              <PrivateRoute allowedRoles={['PHARMACY_ADMIN']}>
                <PharmacyAdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/super-admin/*"
            element={
              <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </PrivateRoute>
            }
          />
          
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

