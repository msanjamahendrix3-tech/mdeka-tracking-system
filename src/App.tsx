/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import FollowUp from './pages/FollowUp';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import CHWDashboard from './pages/CHWDashboard';
import NewFollowUp from './pages/NewFollowUp';
import Appointments from './pages/Appointments';
import Register from './pages/Register';
import StartVisit from './pages/StartVisit';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user?.role || '')) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'CHW') {
    return <CHWDashboard />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Home /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL', 'CHW']}>
                <Layout><DashboardRouter /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL']}>
                <Layout><Patients /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-patient" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL']}>
                <Layout><AddPatient /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/follow-up" element={
              <ProtectedRoute>
                <Layout><FollowUp /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/new-follow-up" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL']}>
                <Layout><NewFollowUp /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/start-visit/:patientId" element={
              <ProtectedRoute roles={['CHW', 'ADMIN']}>
                <Layout><StartVisit /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <Layout><Community /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
            {/* Fallback routes */}
            <Route path="/appointments" element={<ProtectedRoute roles={['ADMIN', 'CLINICAL']}><Layout><Appointments /></Layout></ProtectedRoute>} />
            <Route path="/clinics" element={<ProtectedRoute roles={['ADMIN', 'CLINICAL']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute roles={['ADMIN', 'CLINICAL']}><Layout><Community /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
      </PatientProvider>
    </AuthProvider>
  );
}



