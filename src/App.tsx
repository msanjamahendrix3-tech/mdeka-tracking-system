/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import FollowUp from './pages/FollowUp';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import SystemStatus from './pages/SystemStatus';
import Login from './pages/Login';
import CHWDashboard from './pages/CHWDashboard';
import NewFollowUp from './pages/NewFollowUp';
import Appointments from './pages/Appointments';
import Register from './pages/Register';
import RegisterClinic from './pages/RegisterClinic';
import StartVisit from './pages/StartVisit';
import Library from './pages/Library';
import NCDRegistration from './pages/NCDRegistration';
import Settings from './pages/Settings';
import FollowedUpDashboard from './pages/FollowedUpDashboard';
import { MalawiBackground } from './components/MalawiBackground';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-10 text-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Initializing MDEKA TRACKING SYSTEM...</p>
        <p className="text-xs text-slate-400 mt-2">Checking secure connection to clinic database</p>
      </div>
    );
  }
  
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
  console.log('App: Rendering component');
  return (
    <AuthProvider>
      <PatientProvider>
        <NotificationProvider>
          <Router>
            <MalawiBackground />
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-clinic" element={<RegisterClinic />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Home /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL', 'CHW', 'SUPER_ADMIN']}>
                <Layout><DashboardRouter /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL', 'CHW', 'SUPER_ADMIN']}>
                <Layout><Patients /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-patient" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL', 'SUPER_ADMIN']}>
                <Layout><AddPatient /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/register-ncd" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL', 'SUPER_ADMIN']}>
                <Layout><NCDRegistration /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/follow-up" element={
              <ProtectedRoute>
                <Layout><FollowUp /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/followed-up-dashboard" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN', 'CLINICAL', 'CHW']}>
                <Layout><FollowedUpDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/new-follow-up" element={
              <ProtectedRoute roles={['ADMIN', 'CLINICAL', 'SUPER_ADMIN']}>
                <Layout><NewFollowUp /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/start-visit/:patientId" element={
              <ProtectedRoute roles={['CHW', 'ADMIN', 'SUPER_ADMIN', 'CLINICAL']}>
                <Layout><StartVisit /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <Layout><Community /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/system-status" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                <Layout><SystemStatus /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/library" element={
              <ProtectedRoute>
                <Layout><Library /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />
            {/* Fallback routes */}
            <Route path="/appointments" element={<ProtectedRoute roles={['ADMIN', 'CLINICAL', 'SUPER_ADMIN']}><Layout><Appointments /></Layout></ProtectedRoute>} />
            <Route path="/clinics" element={<ProtectedRoute roles={['ADMIN', 'CLINICAL', 'SUPER_ADMIN']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute roles={['ADMIN', 'CLINICAL', 'SUPER_ADMIN']}><Layout><Community /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </PatientProvider>
  </AuthProvider>
  );
}



