import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionDB } from '../utils/database';
import './CreateBlog.css'; // Importing the shared CSS file

function AskQuestion() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General'); 
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;
    
    setSubmitting(true);

    const q = {
      id: `${Date.now()}`,
      title: title.trim(),
      category: category, 
      details: details.trim(),
      author: user?.username || 'User',
      userId: user?.id, // Save user ID for filtering
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0
    };

    // Save to database
    questionDB.createQuestion(q);
    
    // Also save to old localStorage for backward compatibility
    const raw = localStorage.getItem('questions');
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem('questions', JSON.stringify([q, ...list]));
    
    setSubmitting(false);
    navigate('/forum');
  };

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">Ask a Question</h1>
      
      {/* UPDATE 1: Use the new WIDE class */}
      <form className="create-blog-card-wide" onSubmit={handleSubmit}>
        
        {/* Category Dropdown */}
        <div>
          <label className="field-label">Category</label>
          <select 
            className="text-input" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="General">General</option>
            <option value="Legal Rights">Legal Rights</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Career">Career Guidance</option>
            <option value="Safety">Safety</option>
          </select>
        </div>

        {/* Title Input */}
        <div>
          <label className="field-label">Title</label>
          <input 
            className="text-input" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., How do I file an FIR?"
            required 
          />
        </div>

        {/* Details Input */}
        <div>
          <label className="field-label">Details</label>
          <textarea 
            className="content-input" 
            rows={6} 
            value={details} 
            onChange={(e) => setDetails(e.target.value)} 
            placeholder="Describe your situation..."
            required 
            // Inline style to ensure textarea matches the new CSS inputs
            style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ff80ab',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Buttons */}
        {/* UPDATE 2: Use the new WIDE button group */}
        <div className="button-group-wide">
          <button 
            type="button" 
            className="save-draft-btn" 
            onClick={() => navigate('/forum')}
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button 
            className="publish-btn" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AskQuestion;