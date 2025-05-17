import React from 'react';
import './Resources.css';

function Resources() {
  return (
    <div className="resources">
      <h1>Educational Resources</h1>
      <p>Explore our curated list of educational materials and legal support.</p>
      <div className="resource-list">
        <div className="resource-item">
          <h2>Legal Support</h2>
          <p>Access legal resources and support for women facing societal barriers.</p>
        </div>
        <div className="resource-item">
          <h2>Educational Materials</h2>
          <p>Find articles, videos, and courses to enhance your knowledge.</p>
        </div>
      </div>
    </div>
  );
}

export default Resources; 