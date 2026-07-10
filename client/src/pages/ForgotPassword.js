import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../api/divaApi';
import '../components/Auth/Auth.css'; // Use same styling as Login/Signup

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1 = request code, 2 = verify code, 3 = reset password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim()) {
      setError(t('Please enter your email address'));
      return;
    }

    setLoading(true);
    try {
      await api.authForgotPassword(email.trim());
      setSuccess(t('A verification code has been generated and sent to your email.'));
      setStep(2);
    } catch (err) {
      setError(t(err.message) || t('Failed to request password reset code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token.trim()) {
      setError(t('Please enter the verification code'));
      return;
    }

    setLoading(true);
    try {
      await api.authVerifyResetCode(email.trim(), token.trim());
      setSuccess(t('Code verified successfully! You can now choose a new password.'));
      setStep(3);
    } catch (err) {
      setError(t(err.message) || t('Invalid or expired verification code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError(t('Please fill in all fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('Password must be at least 6 characters long'));
      return;
    }

    setLoading(true);
    try {
      await api.authResetPassword(email.trim(), token.trim(), newPassword);
      setSuccess(t('Your password has been reset successfully! Redirecting to login page...'));
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(t(err.message) || t('Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{t("Reset Password")}</h2>
          <p className="auth-subtitle">
            {step === 1 && t('Enter your email to receive a verification code')}
            {step === 2 && t('Enter the 6-digit verification code sent to your email')}
            {step === 3 && t('Choose a new strong password for your account')}
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
              <label htmlFor="email">{t("Email address")}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("Enter your email address")}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? t('Sending...') : t('Send Reset Code')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{t("Email address")}</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled={true}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="token" style={{ alignSelf: 'flex-start' }}>{t("Verification Code")}</label>
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
              {loading ? t('Verifying...') : t('Verify Code')}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">{t("New Password")}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("At least 6 characters")}
                  required
                  disabled={loading}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#888'
                  }}
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t("Confirm Password")}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("Confirm your new password")}
                  required
                  disabled={loading}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#888'
                  }}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? t('Resetting...') : t('Reset Password')}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            {t("Remembered your password?")}{' '}
            <Link to="/login" className="auth-link">
              {t("Sign In")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
