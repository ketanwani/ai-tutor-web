import axios from 'axios';

// Use env var in production; fallback to local dev
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and user data to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  
  if (user) {
    config.headers['X-User-Data'] = user;
  }
  
  return config;
});

// Public API instance for endpoints that don't need authentication
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  // Health check
  healthCheck: async () => {
    const response = await publicApi.get('/auth/health/');
    return response.data;
  },
  
  // Parent login with Google (handled by Django Allauth)
  loginWithGoogle: () => {
    window.location.href = 'http://localhost:8000/accounts/google/login/';
  },
  
  // Parent login with email and password
  parentLogin: async (email, password) => {
    const response = await api.post('/auth/parent-login/', { email, password });
    return response.data;
  },
  
  // Student login with join code
  studentLogin: async (joinCode) => {
    const response = await api.post('/auth/student-login/', { join_code: joinCode });
    return response.data;
  },
  
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  
  // Create child
  createChild: async (childData) => {
    const response = await api.post('/auth/create-child/', childData);
    return response.data;
  },
  
  // Get children
  getChildren: async () => {
    const response = await api.get('/auth/children/');
    return response.data;
  },
  
  // Delete child
  deleteChild: async (childId) => {
    const response = await api.delete(`/auth/delete-child/${childId}/`);
    return response.data;
  },
  
  // Parent signup with email verification
  parentSignup: async (userData) => {
    const response = await publicApi.post('/auth/parent-signup/', userData);
    return response.data;
  },
  
  // Verify email
  verifyEmail: async (token) => {
    const response = await publicApi.post('/auth/verify-email/', { token });
    return response.data;
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await publicApi.post('/auth/request-password-reset/', { email });
    return response.data;
  },
  
  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await publicApi.post('/auth/reset-password/', { 
      token, 
      new_password: newPassword 
    });
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  // Get topics for a level and subject
  getTopics: async (level, subject = 'Math') => {
    const response = await api.get(`/topics/?level=${level}&subject=${subject}`);
    return response.data;
  },
  // Get random question from bank
  getRandomQuestion: async (params) => {
    const q = new URLSearchParams(params).toString();
    const response = await api.get(`/questions/random/?${q}`);
    return response.data;
  },
  
  // Generate question
  generateQuestion: async (topic, level, subject = 'Math') => {
    const response = await api.get(`/generate-question/?topic=${topic}&level=${level}&subject=${subject}`);
    return response.data;
  },
  
  // Start quiz session
  startSession: async (sessionData) => {
    const response = await api.post('/start-session/', sessionData);
    return response.data;
  },
  
  // Submit answer
  submitAnswer: async (answerData) => {
    const response = await api.post('/submit-answer/', answerData);
    return response.data;
  },
  
  // Get progress
  getProgress: async (studentId) => {
    const response = await api.get(`/progress/${studentId}/`);
    return response.data;
  },
};

export default api;
