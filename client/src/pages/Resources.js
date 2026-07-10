import React, { useState } from 'react';
import { resourcesData } from '../data/resourcesList';
import { useLanguage } from '../context/LanguageContext';
import './Resources.css';

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useLanguage();

  const filteredResources =
    activeCategory === 'all'
      ? resourcesData
      : resourcesData.filter((item) => item.category === activeCategory);

  return (
    <div className="resources-page">
      <div className="emergency-banner">
        <div className="emergency-content">
          <span className="emergency-icon">🚨</span>
          <div className="emergency-text">
            <h3>{t("Immediate Help Needed?")}</h3>
            <p>
              {t("Women Helpline: ")}<strong>1091</strong> | {t("Domestic Abuse: ")}<strong>181</strong> | {t("Police: ")}{' '}
              <strong>100</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="resources-header">
        <h1>{t("Empowerment Hub")}</h1>
        <p>{t("Curated tools, legal aid, and educational materials to support your journey.")}</p>
      </div>

      <div className="category-tabs">
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          {t("All Resources")}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'legal' ? 'active' : ''}`}
          onClick={() => setActiveCategory('legal')}
        >
          {t("⚖️ Legal")}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'education' ? 'active' : ''}`}
          onClick={() => setActiveCategory('education')}
        >
          {t("🎓 Education")}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'health' ? 'active' : ''}`}
          onClick={() => setActiveCategory('health')}
        >
          {t("🏥 Health")}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveCategory('finance')}
        >
          {t("💰 Finance")}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'career' ? 'active' : ''}`}
          onClick={() => setActiveCategory('career')}
        >
          {t("💼 Career")}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'safety' ? 'active' : ''}`}
          onClick={() => setActiveCategory('safety')}
        >
          {t("🛡️ Safety")}
        </button>
      </div>

      <div className="resource-grid">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="resource-card">
            <div className="card-icon">{resource.icon}</div>
            <div className="card-content">
              <h3>{t(resource.title)}</h3>
              <span className={`category-tag ${resource.category}`}>{t(resource.category)}</span>
              <p>{t(resource.description)}</p>
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="visit-btn">
                {t("Visit Website ↗")}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;

