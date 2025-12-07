import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateBlog.css';

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">Help & Support</h1>
      
      <div className="create-blog-card-wide">
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#e91e63', marginBottom: '15px' }}>Getting Started</h3>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '10px' }}>
            Welcome to our platform! Here are some tips to get you started:
          </p>
          <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Create your profile and add a profile picture</li>
            <li>Share your thoughts by creating blogs</li>
            <li>Ask questions in the forum to get help from the community</li>
            <li>Explore resources and connect with others</li>
          </ul>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#e91e63', marginBottom: '15px' }}>Frequently Asked Questions</h3>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#333' }}>How do I edit my profile?</strong>
            <p style={{ color: '#666', lineHeight: '1.6', marginTop: '5px' }}>
              Go to your profile page and click "Edit profile" button. You can update your username, bio, and profile picture.
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#333' }}>How do I create a blog?</strong>
            <p style={{ color: '#666', lineHeight: '1.6', marginTop: '5px' }}>
              Click on "Create New Blog" on your profile page or navigate to the blog section.
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#333' }}>How do I ask a question?</strong>
            <p style={{ color: '#666', lineHeight: '1.6', marginTop: '5px' }}>
              Go to the Forum section and click "Ask Question" to post your question.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#e91e63', marginBottom: '15px' }}>Contact Us</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            If you need further assistance, please visit the Contact Us page or reach out through the forum.
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

export default Help;

