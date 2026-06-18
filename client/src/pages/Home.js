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
  '/gallery7.webp',
  '/gallery8.png'
];

/** Women empowering women — one story per gallery photo */
const GALLERY_STORIES = [
  {
    title: 'Economic power, woman to woman',
    body: 'Twelve women sat in a circle and named their first savings targets out loud. No shame—only cheers. Within months, several launched tiny businesses; others went back to school. Empowerment looked like shared numbers, shared childcare, and the belief that her rupee matters as much as his.'
  },
  {
    title: 'Her voice, finally believed',
    body: 'She had never said the words “domestic violence” before. A volunteer listened without fixing, without judging, and helped her see legal options and a safe next step. Choosing to speak is courage; having someone receive it is empowerment—and it starts a chain for sisters who watch her rise.'
  },
  {
    title: 'Education opens every door',
    body: 'After a decade away from books, she passed her bridge exam with notes passed hand-to-hand by other women. Her daughter saw her zip a bag for college orientation. That image—mother as learner—is women empowering the next generation to claim their right to knowledge.'
  },
  {
    title: 'Sisterhood in the waiting room',
    body: 'Strangers compared notes on buses, doctors, and babysitters—and left as a chat group that still shares rides and reminders. Women empowering women is sometimes whispered tips in a corridor: you are not alone, and we will figure this out together.'
  },
  {
    title: 'Lifting her into tech',
    body: 'A woman engineer answered late-night messages from newcomers until one of them landed an internship. Mentorship is not charity; it is passing the ladder back. Every woman who codes, leads, or hires widens the path for those behind her.'
  },
  {
    title: 'Safety is a skill we teach',
    body: 'Workshop leaders drew maps of exits, documents, and people to trust—at her pace, her choice. Empowerment is knowing the plan exists even before she uses it. When women share safety knowledge, we shrink fear and grow agency.'
  },
  {
    title: 'Her story, her canvas',
    body: 'Women painted their own hands—holding tools, babies, pens—and hung them for the city to see. Art became testimony: we are here, we create, we heal. Public creativity is political; it tells every girl that her perspective deserves walls, not whispers.'
  },
  {
    title: 'From eight chairs to a movement',
    body: 'What began as tea and honesty in one hall became chapters across towns and a library of shared PDFs. Women empowering women scales when we copy the recipe: listen first, credit each other, and never gatekeep the microphone.'
  }
];

function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [galleryOpen, setGalleryOpen] = useState(null);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/signup');
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
      <div className="hero-section" style={{ '--hero-bg': `url(${heroBackground})` }}>
        <div className="hero-overlay">
          <h1>Empower Women, Empower the World</h1>
          <p>Let's inspire, educate, and create a brighter future for every woman in our community.</p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="community-section">
          <div className="community-content">
            <h2>Join Our Community</h2>
            <p>Connect with thousands of women, share your stories, and access exclusive resources</p>
            <div className="auth-buttons">
              <button type="button" className="auth-btn login-btn" onClick={handleLogin}>
                Sign In
              </button>
              <button type="button" className="auth-btn signup-btn" onClick={handleSignup}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Welcome back, {user?.username}!</h2>
            <p>Ready to continue your journey?</p>
            <button type="button" className="get-started-btn" onClick={handleGetStarted}>
              Go to Profile
            </button>
          </div>
        </div>
      )}

      <div className="main-content-section">
        <div className="container">
          <div className="welcome-header">
            <h1>Welcome to Diva</h1>
            <p>Empowering women through knowledge and resources.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Educational Resources</h3>
              <p>Access a wide range of educational materials and legal support.</p>
              <div className="feature-highlight">Free Access</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Community Forum</h3>
              <p>Connect with over 500+ women and seek mentorship.</p>
              <div className="feature-highlight">500+ Members</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>AI Chatbot</h3>
              <p>Get instant support with our NLP-powered AI assistant.</p>
              <div className="feature-highlight">24/7 Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Diva?</h2>
            <p>Discover what makes our platform unique and empowering</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <h4>Empowerment Focus</h4>
              <p>Built specifically for women's growth and success</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <h4>Safe Space</h4>
              <p>Private, secure environment for open discussions</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <h4>Global Community</h4>
              <p>Connect with women from around the world</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"></div>
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
            <button
              type="button"
              key={src}
              className="gallery-item"
              onClick={() => setGalleryOpen(idx)}
              aria-label={`Open story ${idx + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>

      {galleryOpen !== null && GALLERY_STORIES[galleryOpen] && (
        <div
          className="gallery-story-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-story-title"
          onClick={() => setGalleryOpen(null)}
        >
          <div className="gallery-story-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gallery-story-close"
              onClick={() => setGalleryOpen(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="gallery-story-image-wrap">
              <img src={galleryImages[galleryOpen]} alt="" />
            </div>
            <p className="gallery-story-kicker">Women empowering women</p>
            <h3 id="gallery-story-title">{GALLERY_STORIES[galleryOpen].title}</h3>
            <p className="gallery-story-body">{GALLERY_STORIES[galleryOpen].body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
