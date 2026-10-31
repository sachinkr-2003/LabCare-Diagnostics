import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Tests from './pages/Tests';
import Reports from './pages/Reports';
import SearchReport from './pages/SearchReport';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import EnterResult from './pages/EnterResult';
import CreateOrder from './pages/CreateOrder';
import Login from './pages/Login';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('lms_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Route Guard (prevents logged-in users from seeing login page again)
function PublicRoute({ children }) {
  const token = localStorage.getItem('lms_token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="tests" element={<Tests />} />
          <Route path="reports" element={<Reports />} />
          <Route path="enter-result" element={<EnterResult />} />
          <Route path="create-order" element={<CreateOrder />} />
          <Route path="search" element={<SearchReport />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
