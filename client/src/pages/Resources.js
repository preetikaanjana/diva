import React, { useState } from 'react';
import './Resources.css';

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Resource Data - You can easily add more links here
  const resourcesData = [
    {
      id: 1,
      category: 'legal',
      title: 'National Commission for Women',
      description: 'The apex national level organization of India with the mandate of protecting and promoting the interests of women.',
      link: 'http://ncw.nic.in/',
      icon: '⚖️'
    },
    {
      id: 2,
      category: 'education',
      title: 'Google for Startups: Women',
      description: 'Programs and resources designed to help women entrepreneurs build and scale their businesses.',
      link: 'https://www.google.com/entrepreneurs/communities/women/',
      icon: '🎓'
    },
    {
      id: 3,
      category: 'health',
      title: 'Women\'s Health (WHO)',
      description: 'Global data, factsheets, and resources regarding women\'s physical and mental health.',
      link: 'https://www.who.int/health-topics/women-s-health',
      icon: '🏥'
    },
    {
      id: 4,
      category: 'legal',
      title: 'Majlis Law',
      description: 'Legal support and social work for women and children facing domestic violence.',
      link: 'https://majlislaw.com/',
      icon: '👩‍⚖️'
    },
    {
      id: 5,
      category: 'finance',
      title: 'Mann Deshi Foundation',
      description: 'Empowering rural women with financial literacy, business skills, and access to capital.',
      link: 'https://manndeshi.org/',
      icon: '💰'
    },
    {
      id: 6,
      category: 'education',
      title: 'Swayam (Free Education)',
      description: 'Free online courses by the Govt of India to bridge the digital divide for students.',
      link: 'https://swayam.gov.in/',
      icon: '📚'
    },
    {
      id: 7,
      category: 'finance',
      title: 'Mahila E-Haat',
      description: 'An online marketing platform to support women entrepreneurs and SHGs.',
      link: 'https://wcd.nic.in/mahila-e-haat',
      icon: '📈'
    },
    {
      id: 8,
      category: 'health',
      title: 'SNEHA',
      description: 'Works on health, nutrition, and prevention of violence against women and children in urban slums.',
      link: 'https://snehamumbai.org/',
      icon: '🩺'
    }
  ];

  const filteredResources = activeCategory === 'all' 
    ? resourcesData 
    : resourcesData.filter(item => item.category === activeCategory);

  return (
    <div className="resources-page">
      {/* Emergency Banner */}
      <div className="emergency-banner">
        <div className="emergency-content">
          <span className="emergency-icon">🚨</span>
          <div className="emergency-text">
            <h3>Immediate Help Needed?</h3>
            <p>Women Helpline: <strong>1091</strong> | Domestic Abuse: <strong>181</strong> | Police: <strong>100</strong></p>
          </div>
        </div>
      </div>

      <div className="resources-header">
        <h1>Empowerment Hub</h1>
        <p>Curated tools, legal aid, and educational materials to support your journey.</p>
      </div>

      {/* Filter Tabs */}
      <div className="category-tabs">
        <button 
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`} 
          onClick={() => setActiveCategory('all')}
        >
          All Resources
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'legal' ? 'active' : ''}`} 
          onClick={() => setActiveCategory('legal')}
        >
          ⚖️ Legal Aid
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'education' ? 'active' : ''}`} 
          onClick={() => setActiveCategory('education')}
        >
          🎓 Education
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'health' ? 'active' : ''}`} 
          onClick={() => setActiveCategory('health')}
        >
          🏥 Health
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'finance' ? 'active' : ''}`} 
          onClick={() => setActiveCategory('finance')}
        >
          💰 Finance
        </button>
      </div>

      {/* Resource Grid */}
      <div className="resource-grid">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="resource-card">
            <div className="card-icon">{resource.icon}</div>
            <div className="card-content">
              <h3>{resource.title}</h3>
              <span className={`category-tag ${resource.category}`}>{resource.category}</span>
              <p>{resource.description}</p>
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="visit-btn">
                Visit Website ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resources;