import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ContactUs.css';

function ContactUs() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Legal Rights',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch("https://formsubmit.co/ajax/preetikaanjana@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok && (result.success === "true" || result.success === true)) {
        setStatus({
          type: 'success',
          message: t('Thank you! Your concern has been submitted successfully to Preetika Anjana.')
        });
        setFormData({
          name: '',
          email: '',
          topic: 'Legal Rights',
          message: ''
        });
      } else {
        setStatus({
          type: 'error',
          message: t(result.message) || t('Something went wrong. Please try again.')
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: t('Could not connect to the server. Please check your internet connection and try again.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-section">
      <h1>{t("Share Your Problem or Concern")}</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        {status.message && (
          <div className={`form-status ${status.type}`}>
            {status.message}
          </div>
        )}
        
        <label htmlFor="name">{t("Your Name")}:</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          placeholder={t("Enter your name")} 
          value={formData.name}
          onChange={handleChange}
          required 
          disabled={isSubmitting}
        />

        <label htmlFor="email">{t("Your Email")}:</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder={t("Enter your email")} 
          value={formData.email}
          onChange={handleChange}
          required 
          disabled={isSubmitting}
        />

        <label htmlFor="topic">{t("Topic of Concern:")}</label>
        <select 
          id="topic" 
          name="topic" 
          value={formData.topic}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        >
          <option value="Legal Rights">{t("Legal Rights")}</option>
          <option value="Education">{t("Education")}</option>
          <option value="Marriage Issues">{t("Marriage Issues")}</option>
          <option value="Domestic Violence">{t("Domestic Violence")}</option>
          <option value="Financial Independence">{t("Financial Independence")}</option>
          <option value="Other">{t("Other")}</option>
        </select>

        <label htmlFor="message">{t("Message")}:</label>
        <textarea 
          id="message" 
          name="message" 
          rows="5" 
          placeholder={t("Describe your problem or concern here...")} 
          value={formData.message}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        ></textarea>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? t('Submitting...') : t('Submit')}
        </button>
      </form>
    </div>
  );
}

export default ContactUs;
 