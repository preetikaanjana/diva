import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('grid');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateBlog = () => {
    navigate('/blog');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      {/* Profile Header Section */}
      <div className="profile-header">
        <div className="profile-left">
          {/* Profile Picture */}
          <div className="profile-picture">
            <div className="profile-avatar">
              <span>{user?.username?.charAt(0).toUpperCase() || '👤'}</span>
            </div>
            <div className="profile-note">
              <span>Note...</span>
              <div className="note-arrows">
                <span>↑</span>
                <span>↓</span>
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="profile-info">
            <div className="profile-top-row">
              <div className="profile-username">{user?.username || 'username'}</div>
              
              {/* Profile Stats */}
              <div className="profile-stats">
                <span><strong>{user?.posts || 0}</strong> blogs</span>
                <span><strong>{user?.followers || 0}</strong> follower</span>
                <span><strong>{user?.following || 0}</strong> following</span>
              </div>
            </div>
            
            {/* Name and Bio - Left side below blogs */}
            <div className="profile-details">
              <div className="profile-fullname">{user?.fullName || user?.username || 'Full Name'}</div>
              <div className="profile-bio">{user?.bio || 'Your bio goes here...'}</div>
            </div>
          </div>
        </div>
        
        {/* Profile Actions */}
        <div className="profile-actions">
          <button className="profile-btn edit-btn">Edit profile</button>
          <button className="profile-btn archive-btn">View archive</button>
          <button className="profile-settings">
            <span>⚙️</span>
          </button>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="highlights-section">
        <div className="highlights-header">
          <h3>Highlights</h3>
        </div>
        <div className="highlights-grid">
          <div className="highlight-item">
            <div className="highlight-icon">⭐</div>
            <span>Featured</span>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">🏆</div>
            <span>Achievements</span>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">💡</div>
            <span>Ideas</span>
          </div>
          <div className="highlight-item add-highlight">
            <div className="highlight-icon">+</div>
            <span>New</span>
          </div>
        </div>
      </div>

      {/* Create Blog Section */}
      <div className="create-blog-section">
        <div className="create-blog-card">
          <h2>Ready to Share Your Thoughts?</h2>
          <p>Create a new blog post and share your knowledge with the community</p>
          <button className="create-blog-main-btn" onClick={handleCreateBlog}>
            ✍️ Create New Blog
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          📱 Grid
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved
        </button>
        <button 
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          ❤️ Liked
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === 'grid' && (
          <div className="content-grid">
            <div className="content-placeholder">
              <div className="placeholder-icon">📝</div>
              <p>Your blogs will appear here</p>
              <button className="create-first-blog-btn" onClick={handleCreateBlog}>
                Create Your First Blog
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div className="content-grid">
            <div className="content-placeholder">
              <div className="placeholder-icon">💾</div>
              <p>Saved blogs will appear here</p>
            </div>
          </div>
        )}
        
        {activeTab === 'liked' && (
          <div className="content-grid">
            <div className="content-placeholder">
              <div className="placeholder-icon">❤️</div>
              <p>Liked blogs will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
