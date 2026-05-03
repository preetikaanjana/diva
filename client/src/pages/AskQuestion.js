import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import '../styles/FormsDiva.css';
import './CreateBlog.css';

function AskQuestion() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await api.createQuestion({
        title: title.trim(),
        category,
        details: details.trim()
      });
      navigate('/forum');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-blog-wrapper diva-form-page">
      <h1>Ask a Question</h1>

      <form className="diva-form-panel diva-form-panel--compact" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="aq-category">
            Category
          </label>
          <select
            id="aq-category"
            className="text-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Legal Rights">Legal Rights</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Career">Career Guidance</option>
            <option value="Safety">Safety</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="aq-title">
            Title
          </label>
          <input
            id="aq-title"
            className="text-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I file an FIR?"
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="aq-details">
            Details
          </label>
          <textarea
            id="aq-details"
            className="text-input"
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe your situation..."
            required
          />
        </div>

        <div className="button-group-wide" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="save-draft-btn"
            onClick={() => navigate('/forum')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button className="publish-btn" type="submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post question'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AskQuestion;
