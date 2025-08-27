import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import heroBackground from '../images/hero-bg.jpeg';

const galleryImages = [
  '/gallery1.jpeg',
  '/gallery2.jpeg',
  '/gallery3.jpeg',
  '/gallery4.jpeg',
  '/gallery5.jpg',
  '/gallery6.jpg',
];

function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      setShowAuth(true);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="home">
      {/* Hero Section - Clean image only */}
      <div className="hero-section" style={{'--hero-bg': `url(${heroBackground})`}}>
        <div className="hero-overlay">
          <h1>Empower Women, Empower the World</h1>
          <p>Let's inspire, educate, and create a brighter future for every woman in our community.</p>
        </div>
      </div>
      
      {/* Community Section with Login Options - Below the image */}
      {!isAuthenticated && (
        <div className="community-section">
          <div className="community-content">
            <h2>Join Our Community</h2>
            <p>Connect with thousands of women, share your stories, and access exclusive resources</p>
            <div className="auth-buttons">
              <button className="auth-btn login-btn" onClick={handleLogin}>
                Sign In
              </button>
              <button className="auth-btn signup-btn" onClick={handleSignup}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Welcome Section for Authenticated Users */}
      {isAuthenticated && (
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Welcome back, {user?.username}!</h2>
            <p>Ready to continue your journey?</p>
            <button className="get-started-btn" onClick={handleGetStarted}>
              Go to Profile
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content Section */}
      <div className="main-content-section">
        <div className="container">
          <div className="welcome-header">
            <h1>Welcome to Devi</h1>
            <p>Empowering women through knowledge and resources.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Educational Resources</h3>
              <p>Access a wide range of educational materials and legal support.</p>
              <div className="feature-highlight">Free Access</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Forum</h3>
              <p>Connect with over 5,000 women and seek mentorship.</p>
              <div className="feature-highlight">5K+ Members</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Chatbot</h3>
              <p>Get instant support with our NLP-based chatbot.</p>
              <div className="feature-highlight">24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Choose Devi Section */}
      <div className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Devi?</h2>
            <p>Discover what makes our platform unique and empowering</p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">💪</div>
              <h4>Empowerment Focus</h4>
              <p>Built specifically for women's growth and success</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🔒</div>
              <h4>Safe Space</h4>
              <p>Private, secure environment for open discussions</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🌍</div>
              <h4>Global Community</h4>
              <p>Connect with women from around the world</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📱</div>
              <h4>Always Accessible</h4>
              <p>Available on all devices, anytime, anywhere</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="gallery-section">
        <h2>Our Community in Action</h2>
        <div className="gallery-grid">
          {galleryImages.map((src, idx) => (
            <div className="gallery-item" key={idx}>
              <img src={src} alt={`Gallery ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 