import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token') || '';

  useEffect(() => {
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authAPI.resetPassword(token, newPassword);
      setMessage(res.message || 'Password reset successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your new password</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input id="newPassword" name="newPassword" type={showPassword ? 'text' : 'password'} required className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5-10-7 0-.779 1.002-2.64 3.004-4.38M6.223 6.223C8.028 5.118 9.99 5 12 5c5.523 0 10 5 10 7 0 1.019-1.217 3.114-3.62 4.98M3 3l18 18M9.88 9.88A3 3 0 0114.12 14.12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <button type="submit" disabled={loading || !token} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>

          <div className="text-center">
            <button type="button" onClick={() => navigate('/parent-login')} className="text-primary-600 hover:text-primary-500 text-sm">← Back to Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


