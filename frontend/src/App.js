import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import ParentLogin from './components/ParentLogin';
import ParentSignup from './components/ParentSignup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ParentDashboard from './components/ParentDashboard';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';
import PracticePage from './components/PracticePage';
import ProgressPage from './components/ProgressPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/parent-login" element={<ParentLogin />} />
            <Route path="/parent-signup" element={<ParentSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route 
              path="/parent-dashboard" 
              element={
                <ProtectedRoute userType="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute userType="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice" 
              element={
                <ProtectedRoute userType="student">
                  <PracticePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute userType="parent">
                  <ProgressPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
