import React from 'react';
import './AboutMe.css';

const AboutMe = () => {
  return (
    <div className="about-me-container">
      <div className="about-me-header">
        <h1>About Me</h1>
        <p>Learn more about who I am and what I do</p>
      </div>
      
      <div className="about-me-content">
        <div className="about-section">
          <div className="about-image">
            <div className="profile-placeholder">
              <span>👩‍💻</span>
            </div>
          </div>
          
          <div className="about-text">
            <h2>Hi, I'm Devi</h2>
            <p>
              I'm a passionate developer and tech enthusiast who loves creating meaningful 
              applications that make a difference. With expertise in modern web technologies, 
              I enjoy building user-friendly interfaces and solving complex problems.
            </p>
            
            <div className="skills-section">
              <h3>Skills & Technologies</h3>
              <div className="skills-grid">
                <span className="skill-tag">React</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">CSS3</span>
                <span className="skill-tag">HTML5</span>
                <span className="skill-tag">Git</span>
                <span className="skill-tag">AWS</span>
              </div>
            </div>
            
            <div className="experience-section">
              <h3>Experience</h3>
              <div className="experience-item">
                <h4>Full Stack Developer</h4>
                <p className="company">Tech Solutions Inc.</p>
                <p className="duration">2022 - Present</p>
                <p>Building scalable web applications and mentoring junior developers.</p>
              </div>
              
              <div className="experience-item">
                <h4>Frontend Developer</h4>
                <p className="company">Digital Creations</p>
                <p className="duration">2020 - 2022</p>
                <p>Creating responsive and accessible user interfaces.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="interests-section">
          <h3>Interests & Hobbies</h3>
          <div className="interests-grid">
            <div className="interest-item">
              <span className="interest-icon">📚</span>
              <span>Reading Tech Books</span>
            </div>
            <div className="interest-item">
              <span className="interest-icon">🎨</span>
              <span>UI/UX Design</span>
            </div>
            <div className="interest-item">
              <span className="interest-icon">🌱</span>
              <span>Open Source</span>
            </div>
            <div className="interest-item">
              <span className="interest-icon">🚀</span>
              <span>Space Exploration</span>
            </div>
          </div>
        </div>
        
        <div className="contact-section">
          <h3>Get In Touch</h3>
          <p>I'm always open to discussing new opportunities and interesting projects.</p>
          <div className="contact-buttons">
            <button className="contact-btn primary">Send Message</button>
            <button className="contact-btn secondary">View Resume</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
