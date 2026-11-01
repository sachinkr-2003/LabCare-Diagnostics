import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Code-split route components for fast startup & instant loads
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const Tests = lazy(() => import('./pages/Tests'));
const Reports = lazy(() => import('./pages/Reports'));
const SearchReport = lazy(() => import('./pages/SearchReport'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const EnterResult = lazy(() => import('./pages/EnterResult'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const Login = lazy(() => import('./pages/Login'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full">
      <div className="flex items-center gap-2 bg-white border border-slate-300 p-3 shadow-xs">
        <div className="w-3.5 h-3.5 bg-blue-600 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading module...</span>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
