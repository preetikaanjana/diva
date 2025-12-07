import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userDB } from '../../utils/database';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Verify password from database
      const verifiedUser = userDB.verifyPassword(formData.email, formData.password);
      
      if (!verifiedUser) {
        setError('Invalid email or password');
        return;
      }
      
      // Login the user (without password in the user object for security)
      const { password, ...userData } = verifiedUser;
      login(userData);
      navigate('/profile');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Check if user already exists
      const existingUser = userDB.getUserByEmail(formData.email);
      if (existingUser) {
        setError('An account with this email already exists');
        return;
      }

      // Create user in database with password
      const username = formData.email.split('@')[0];
      const existingUsername = userDB.getUserByUsername(username);
      if (existingUsername) {
        setError('Username already taken. Please use a different email.');
        return;
      }

      const newUser = userDB.createUser({
        username: username,
        fullName: username,
        email: formData.email,
        password: formData.password, // Store password (in production, hash it)
        followers: 0,
        following: 0,
        bio: 'New user',
        posts: 0,
        profileImage: null,
        isPrivate: false // Default to public account
      });
      
      // Login the user (without password in the user object for security)
      const { password, ...userData } = newUser;
      login(userData);
      navigate('/profile');
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isSignup ? 'Join our community' : 'Sign in to your account'}
          </p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={isSignup ? handleSignup : handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isSignup ? "Create a password" : "Enter your password"}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"} 
            <button 
              className="auth-toggle-btn"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
