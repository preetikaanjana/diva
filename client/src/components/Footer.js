import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Join Us in Empowering Women</h3>
        <p>
          Diva is dedicated to providing essential information about women&apos;s rights and supporting
          women in rural communities.
        </p>
        <div className="social-links">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=preetikaanjana%40gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/preetika-anjana/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/preetikaanjana/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
        <p className="copyright">
          &copy; 2025 Diva | Empowering Women in Rural Communities | All Rights Reserved
        </p>
        <p>Made with &hearts; by Preetika</p>
      </div>
    </footer>
  );
}

export default Footer;
