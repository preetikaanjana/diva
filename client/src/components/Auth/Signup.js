import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/divaApi';
import './Auth.css';

const Signup = () => {
  const [step, setStep] = useState(1); // 1 = signup details, 2 = verify email
  const [verificationCode, setVerificationCode] = useState('');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.requiresVerification && location.state?.email) {
      setEmailForVerification(location.state.email);
      setStep(2);
      setSuccess('Please enter the verification code sent to your email.');
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !formData.fullName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password doesn't match");
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const emailNorm = formData.email.trim().toLowerCase();
      const res = await api.authRegister({
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: emailNorm,
        phone: formData.phone.trim() || '',
        city: formData.city.trim() || '',
        bio: formData.bio.trim() || 'New to Diva — nice to meet you!',
        password: formData.password
      });

      if (res.requiresVerification) {
        setEmailForVerification(emailNorm);
        setStep(2);
        setSuccess('A verification code has been sent to your email.');
      } else {
        login(res.user, res.token);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const { user: u, token } = await api.authVerifyRegistration(emailForVerification, verificationCode.trim());
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        login(u, token);
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.authResendVerificationOtp(emailForVerification);
      setSuccess('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-container--signup">
      <div className="auth-card auth-card--wide">
        <h2>{step === 1 ? 'Create your account' : 'Verify your email'}</h2>

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
          <form onSubmit={handleSubmit} className="auth-form auth-form--grid">
            <div className="form-group">
              <label htmlFor="fullName">Full name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Preetika Anjana"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 ..."
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City / location (optional)</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your city"
                disabled={loading}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="bio">Bio (optional)</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="A short line about you"
                className="auth-textarea"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button form-group--full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
              We sent a 6-digit confirmation code to <strong style={{ color: '#e91e63' }}>{emailForVerification}</strong>. Please enter it below to confirm your account.
            </p>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '25px' }}>
              <label htmlFor="verificationCode" style={{ alignSelf: 'flex-start', marginBottom: '5px' }}>Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
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

            <button type="submit" className="auth-button form-group--full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete Sign Up'}
            </button>

            <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                onClick={handleResendOtp} 
                disabled={loading}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#e91e63', 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: 0
                }}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          {step === 1 ? (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              Need to change your details?{' '}
              <button 
                onClick={() => setStep(1)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#e91e63', 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: 0
                }}
              >
                Go Back
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
