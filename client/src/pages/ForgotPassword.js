import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api/divaApi';
import '../components/Auth/Auth.css'; // Use same styling as Login/Signup

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = request code, 2 = verify code, 3 = reset password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await api.authForgotPassword(email.trim());
      setSuccess('A verification code has been generated and sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request password reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      await api.authVerifyResetCode(email.trim(), token.trim());
      setSuccess('Code verified successfully! You can now choose a new password.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.authResetPassword(email.trim(), token.trim(), newPassword);
      setSuccess('Your password has been reset successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">
            {step === 1 && 'Enter your email to receive a verification code'}
            {step === 2 && 'Enter the 6-digit verification code sent to your email'}
            {step === 3 && 'Choose a new strong password for your account'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="form-status success" style={{ 
            backgroundColor: '#f1f8e9', 
            border: '1px solid #c5e1a5', 
            color: '#33691e',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled={true}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="token" style={{ alignSelf: 'flex-start' }}>Verification Code</label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '8px', 
                  fontSize: '22px', 
                  fontWeight: 'bold',
                  width: '180px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #ff69b4',
                  backgroundColor: '#fff5f8',
                  color: '#e91e63',
                  marginTop: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remembered your password?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
