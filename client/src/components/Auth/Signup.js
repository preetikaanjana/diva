import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/divaApi';
import { useLanguage } from '../../context/LanguageContext';
import './Auth.css';

const Signup = () => {
  const { t, language } = useLanguage();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setError(t('Please fill in all required fields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("Password doesn't match"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('Password must be at least 6 characters long'));
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
        setSuccess(t('A verification code has been sent to your email.'));
      } else {
        login(res.user, res.token);
        navigate('/profile');
      }
    } catch (err) {
      setError(t(err.message) || t('Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode.trim()) {
      setError(t('Please enter the verification code'));
      return;
    }

    setLoading(true);
    try {
      const { user: u, token } = await api.authVerifyRegistration(emailForVerification, verificationCode.trim());
      setSuccess(t('Email verified successfully! Redirecting...'));
      setTimeout(() => {
        login(u, token);
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(t(err.message) || t('Invalid or expired verification code.'));
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
      setSuccess(t('A new verification code has been sent to your email.'));
    } catch (err) {
      setError(t(err.message) || t('Failed to resend code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-container--signup">
      <div className="auth-card auth-card--wide">
        <h2>{step === 1 ? t('Create your account') : t('Verify your email')}</h2>

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
              <label htmlFor="fullName">{t("Full name *")}</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t("e.g. Preetika Anjana")}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">{t("Username *")}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t("Choose a unique username")}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="email">{t("Email *")}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("you@example.com")}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t("Phone (optional)")}</label>
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
              <label htmlFor="city">{t("City / location (optional)")}</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t("Your city")}
                disabled={loading}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="bio">{t("Bio (optional)")}</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder={t("A short line about you")}
                className="auth-textarea"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t("Password *")}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("At least 6 characters")}
                  required
                  disabled={loading}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? (
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
              <label htmlFor="confirmPassword">{t("Confirm password *")}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("Repeat password")}
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

            <button type="submit" className="auth-button form-group--full" disabled={loading}>
              {loading ? t('Creating account...') : t('Create account')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
              {t("We sent a 6-digit confirmation code to")} <strong style={{ color: '#e91e63' }}>{emailForVerification}</strong>. {t("Please enter it below to confirm your account.")}
            </p>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '25px' }}>
              <label htmlFor="verificationCode" style={{ alignSelf: 'flex-start', marginBottom: '5px' }}>{t("Verification Code")}</label>
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
              {loading ? t('Verifying...') : t('Verify & Complete Sign Up')}
            </button>

            <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
              {t("Didn't receive the code?")}{' '}
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
                {t("Resend Code")}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          {step === 1 ? (
            <p>
              {t("Already have an account?")}{' '}
              <Link to="/login" className="auth-link">
                {t("Sign in")}
              </Link>
            </p>
          ) : (
            <p>
              {t("Need to change your details?")}{' '}
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
                {t("Go Back")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
