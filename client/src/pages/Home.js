import React from 'react';
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
  return (
    <div className="home">
      <div className="hero-section" style={{'--hero-bg': `url(${heroBackground})`}}>
        <div className="hero-overlay">
          <h1>Empower Women, Empower the World</h1>
          <p>Let's inspire, educate, and create a brighter future for every woman in our community.</p>
        </div>
      </div>
      <h1>Welcome to Devi</h1>
      <p>Empowering women through knowledge and resources.</p>
      <div className="features">
        <div className="feature">
          <h2>Educational Resources</h2>
          <p>Access a wide range of educational materials and legal support.</p>
        </div>
        <div className="feature">
          <h2>Community Forum</h2>
          <p>Connect with over 5,000 women and seek mentorship.</p>
        </div>
        <div className="feature">
          <h2>AI Chatbot</h2>
          <p>Get instant support with our NLP-based chatbot.</p>
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