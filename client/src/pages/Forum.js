import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Forum.css';

// 1. Defined default data outside the component for cleaner code
const DEFAULT_QUESTIONS = [
  { 
    id: 'q1', 
    title: 'How to file an FIR?', 
    category: 'Legal Rights', 
    details: 'I need help understanding the process.', 
    author: 'Ananya', 
    createdAt: new Date().toISOString(), 
    replies: [] 
  },
  { 
    id: 'q2', 
    title: 'Best yoga for stress?', 
    category: 'Mental Health', 
    details: 'Looking for recommendations.', 
    author: 'Kiran', 
    createdAt: new Date().toISOString(), 
    replies: [] 
  }
];

function Forum() {
  // --- State Management ---
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // --- Effects ---
  useEffect(() => {
    // Load questions from LocalStorage on initial render
    const rawData = localStorage.getItem('questions');
    let dataList = [];

    if (rawData) {
      dataList = JSON.parse(rawData);
    } else {
      // If storage is empty, initialize with default data
      dataList = DEFAULT_QUESTIONS;
      localStorage.setItem('questions', JSON.stringify(dataList));
    }

    // Sort by newest first
    const sortedList = dataList.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    setQuestions(sortedList);
  }, []);

  // --- Helper Functions ---
  
  // Generates a CSS class name based on the category (e.g., "Legal Rights" -> "legal-rights")
  const getCategoryClass = (category) => {
    return category ? category.replace(/\s+/g, '-').toLowerCase() : 'general';
  };

  // Formats the date string to a readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // --- Filtering Logic ---
  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Render ---
  return (
    <div className="forum-container">
      
      {/* 1. Header Section */}
      <div className="forum-header">
        <h1 className="forum-title">Community Forum</h1>
        <Link to="/forum/ask" className="ask-btn">
          + Ask a Question
        </Link>
      </div>

      {/* 2. Filter & Search Section */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Legal Rights">Legal Rights</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Career">Career Guidance</option>
            <option value="Safety">Safety</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* 3. Questions List Section */}
      <div className="forum-list">
        {filteredQuestions.length === 0 ? (
          <div className="empty-state">No questions found.</div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="question-row">
              
              <div className="question-content">
                {/* Category Badge */}
                <span className={`category-badge ${getCategoryClass(q.category)}`}>
                  {q.category || 'General'}
                </span>
                
                {/* Question Title */}
                <Link to="#" className="question-title">
                  {q.title}
                </Link>
                
                {/* Metadata (Author & Date) */}
                <span className="question-meta">
                  Posted by <strong>{q.author}</strong> • {formatDate(q.createdAt)}
                </span>
              </div>
              
              {/* Stats & Action Button */}
              <div className="question-stats">
                <span className="reply-count">
                  💬 {q.replies?.length || 0} Replies
                </span>
                <button className="view-btn">View</button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Forum;