import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB } from '../utils/database';
import './CreateBlog.css';

const Privacy = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const dbUser = userDB.getUserById(user.id);
      if (dbUser) {
        setIsPrivate(dbUser.isPrivate || false);
      }
    }
  }, [user?.id]);

  const handleTogglePrivacy = async () => {
    if (!user?.id) return;
    setSaving(true);
    
    try {
      const updatedUser = userDB.updateUser(user.id, { isPrivate: !isPrivate });
      if (updatedUser) {
        const { password, ...userData } = updatedUser;
        if (login) {
          login(userData);
        }
        setIsPrivate(!isPrivate);
        alert(`Account set to ${!isPrivate ? 'Private' : 'Public'}`);
      }
    } catch (error) {
      console.error('Error updating privacy:', error);
      alert('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">Privacy Settings</h1>
      
      <div className="create-blog-card-wide">
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#e91e63', marginBottom: '15px' }}>Account Privacy</h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '15px',
            background: '#fff0f6',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                {isPrivate ? 'Private Account' : 'Public Account'}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {isPrivate 
                  ? 'Only approved followers can see your posts and profile details'
                  : 'Everyone can see your posts and profile'}
              </div>
            </div>
            <label style={{ 
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '26px'
            }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={handleTogglePrivacy}
                disabled={saving}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: saving ? 'not-allowed' : 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isPrivate ? '#e91e63' : '#ccc',
                borderRadius: '26px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: isPrivate ? 'translateX(24px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#e91e63', marginBottom: '10px' }}>Data Privacy</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Your data is stored locally in your browser. We respect your privacy and do not share your information with third parties.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#e91e63', marginBottom: '10px' }}>Content Visibility</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            {isPrivate 
              ? 'With a private account, only approved followers can see your blogs and profile details. Others will only see your follower and following counts.'
              : 'Your blogs and questions are visible to all users. You can delete them anytime from your profile.'}
          </p>
        </div>

        <div className="button-group-wide">
          <button
            type="button"
            className="save-draft-btn"
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

