import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      // First, try to restore user from localStorage
      const storedUser = localStorage.getItem('user');
      const storedStudent = localStorage.getItem('student');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // don't return; also try to restore student if present
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }
      if (storedStudent) {
        try {
          const studentData = JSON.parse(storedStudent);
          setStudent(studentData);
        } catch (e) {
          console.error('Failed to parse stored student:', e);
        }
      }

      // If no stored user, try to get profile from API
      if (token) {
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginStudent = async (studentData) => {
    setStudent(studentData);
    localStorage.setItem('student', JSON.stringify(studentData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setStudent(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
  };

  const value = {
    user,
    student,
    token,
    loading,
    login,
    loginStudent,
    logout,
    isAuthenticated: !!user || !!student,
    isParent: !!(user?.is_parent),
    isStudent: !!student,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
