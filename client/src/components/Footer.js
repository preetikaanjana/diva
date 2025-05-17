import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Join Us in Empowering Women</h3>
        <p>SheKnows is dedicated to providing essential information about women's rights and supporting women in rural communities.</p>
        <div className="social-links">
          <a href="#">Facebook</a>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
        </div>
        <p className="copyright">&copy; 2024 She Knows | Empowering Women in Rural Communities | All Rights Reserved</p>
        <p>Made with &hearts; by Preetika</p>
      </div>
    </footer>
  );
}

export default Footer; 