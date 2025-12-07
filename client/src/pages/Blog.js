import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';

// ==========================================
// 1. Child Component: BlogCard
// ==========================================
function BlogCard({ post }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // --- LAZY INITIALIZATION (Fixes the refresh issue) ---
  // Checks localStorage immediately before the component paints
  const [isLiked, setIsLiked] = useState(() => {
    try {
      const userLikedPosts = JSON.parse(localStorage.getItem('userLikedPosts') || '[]');
      return userLikedPosts.some(id => String(id) === String(post.id));
    } catch (e) {
      return false;
    }
  });

  // Initialize likes from the post prop
  const [likes, setLikes] = useState(post.likes || 0);
  
  // Check if saved
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const savedBlogs = JSON.parse(localStorage.getItem('savedBlogs') || '[]');
      return savedBlogs.some(blog => String(blog.id) === String(post.id));
    } catch (e) {
      return false;
    }
  });

  const toggle = () => setExpanded((v) => !v);

  const like = () => {
    // Stop if already liked
    if (isLiked) return; 

    const newLikes = likes + 1;
    setLikes(newLikes);
    setIsLiked(true);
    
    try {
      // 1. Update the Main Blog List (so the count persists for everyone)
      const allBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
      const updatedBlogs = allBlogs.map(b => {
        if (String(b.id) === String(post.id)) {
          return { ...b, likes: newLikes };
        }
        return b;
      });
      localStorage.setItem('blogs', JSON.stringify(updatedBlogs));

      // 2. Mark this USER as having liked this post (so they can't like again)
      const userLikedPosts = JSON.parse(localStorage.getItem('userLikedPosts') || '[]');
      
      if (!userLikedPosts.some(id => String(id) === String(post.id))) {
        userLikedPosts.push(post.id);
        localStorage.setItem('userLikedPosts', JSON.stringify(userLikedPosts));
      }

    } catch (error) {
      console.error('Error saving liked blog:', error);
    }
  };

  const saveBlog = () => {
    try {
      const savedBlogs = JSON.parse(localStorage.getItem('savedBlogs') || '[]');
      if (isSaved) {
        // Remove from saved
        const updatedSaved = savedBlogs.filter(blog => String(blog.id) !== String(post.id));
        localStorage.setItem('savedBlogs', JSON.stringify(updatedSaved));
        setIsSaved(false);
      } else {
        // Add to saved
        savedBlogs.push({ ...post, likes }); // Save current state
        localStorage.setItem('savedBlogs', JSON.stringify(savedBlogs));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const display = expanded ? post.content : (post.content.length > 180 ? post.content.slice(0, 180) + '…' : post.content);

  return (
    <div className="blog-card">
      <h3>{post.title}</h3>
      <div className="blog-tags">
        {post.tags?.map((t) => (
          <span className="blog-tag" key={t}>{t}</span>
        ))}
      </div>
      <p>{display}</p>
      <div className="blog-actions">
        <small>{new Date(post.createdAt).toLocaleString()}</small>
        <div style={{ display:'flex', gap:8 }}>
          
          {/* Button disabled if isLiked is true */}
          <button 
            className={`blog-action-btn ${isLiked ? 'liked' : ''}`} 
            onClick={like}
            disabled={isLiked} 
            style={{ 
              cursor: isLiked ? 'not-allowed' : 'pointer', 
              opacity: isLiked ? 1 : 0.8 
            }}
          >
            {isLiked ? '❤️' : '🤍'} {likes}
          </button>

          <button className="blog-action-btn" onClick={saveBlog}>
            {isSaved ? '💾 Saved' : '💾 Save'}
          </button>
          <button className="blog-readmore" onClick={() => navigate(`/blog/${post.id}`)}>Read more</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. Parent Component: Blog
// ==========================================
const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const categories = [
    'All Categories', 'Technology', 'Health & Wellness',
    'Career & Education', 'Lifestyle', 'Personal Development', 'Community Stories'
  ];

  const sortOptions = [
    'Latest', 'Most Popular', 'Most Recent', 'Alphabetical'
  ];

  const blogs = useMemo(() => {
    const raw = localStorage.getItem('blogs');
    let list = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    // Initialize dummy data if empty
    if (list.length === 0) {
      list = [
        { id: 'b1', title: 'Knowing Your Rights', content: 'A quick guide to basic legal rights every woman should know.', tags: ['Legal', 'Awareness'], likes: 5, createdAt: new Date().toISOString() },
        { id: 'b2', title: 'Mental Health Matters', content: 'Tips to maintain mental well-being and seek support.', tags: ['Mental Health'], likes: 12, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ];
      localStorage.setItem('blogs', JSON.stringify(list));
    }
    
    // Sorting Logic
    let sortedList = [...list];
    if (sortBy === 'latest' || sortBy === 'most-recent') {
        sortedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'most-popular') {
        sortedList.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'alphabetical') {
        sortedList.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    // Filtering Logic (Simple implementation)
    if (selectedCategory !== 'all') {
        // You would need to add category logic here if your blog objects have categories
        // For now, this just returns the list as is since dummy data doesn't have categories field
    }

    return sortedList;
  }, [sortBy, selectedCategory]);

  return (
    <div className="blog-container">
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

      <div className="blog-content">
        {blogs.length === 0 ? (
          <div className="blog-grid">
            <div className="blog-placeholder">
              <div className="placeholder-icon"></div>
              <h3>No blogs found</h3>
              <p>Blogs will appear here after you create one.</p>
            </div>
          </div>
        ) : (
          <div className="blog-list">
            {blogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;