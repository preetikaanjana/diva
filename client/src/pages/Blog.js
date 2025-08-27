import React, { useState } from 'react';
import './Blog.css';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const categories = [
    'All Categories',
    'Technology',
    'Health & Wellness',
    'Career & Education',
    'Lifestyle',
    'Personal Development',
    'Community Stories'
  ];

  const sortOptions = [
    'Latest',
    'Most Popular',
    'Most Recent',
    'Alphabetical'
  ];

  return (
    <div className="blog-container">
      {/* Category and Sort Section */}
      <div className="blog-header">
        <div className="category-section">
          <div className="category-dropdown">
            <label htmlFor="category">Category:</label>
            <select 
              id="category" 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category, index) => (
                <option key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sort-section">
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option, index) => (
                <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Blog Content Grid */}
      <div className="blog-content">
        <div className="blog-grid">
          {/* Placeholder for blog posts */}
          <div className="blog-placeholder">
            <div className="placeholder-icon">📝</div>
            <h3>No blogs found</h3>
            <p>Blogs will appear here based on your selected category and sorting preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
