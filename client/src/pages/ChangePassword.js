import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB } from '../utils/database';
import './CreateBlog.css';

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Get user from database
    const dbUser = userDB.getUserById(user.id);
    if (!dbUser) {
      setError('User not found');
      return;
    }

    // Verify current password
    if (dbUser.password !== formData.currentPassword) {
      setError('Current password is incorrect');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setSubmitting(true);

    try {
      // Update password in database
      userDB.updateUser(user.id, { password: formData.newPassword });
      setSuccess('Password updated successfully!');
      
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError('Failed to update password. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">Change Password</h1>
      
      <form className="create-blog-card-wide" onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ marginBottom: '20px', padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '8px' }}>{error}</div>}
        {success && <div className="success-message" style={{ marginBottom: '20px', padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px' }}>{success}</div>}
        
        <div>
          <label className="field-label">Current Password</label>
          <input
            className="text-input"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Enter your current password"
            required
          />
        </div>

        <div>
          <label className="field-label">New Password</label>
          <input
            className="text-input"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter your new password"
            required
          />
        </div>

        <div>
          <label className="field-label">Confirm New Password</label>
          <input
            className="text-input"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            required
          />
        </div>

        <div className="button-group-wide">
          <button
            type="button"
            className="save-draft-btn"
            onClick={() => navigate('/profile')}
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="publish-btn"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;

