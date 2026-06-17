import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import './Blog.css';

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  try {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || d.innerText || '';
  } catch {
    return html.replace(/<[^>]*>/g, '');
  }
}

// ==========================================
// 1. Child Component: BlogCard
// ==========================================
function BlogCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(!!post.likedByMe);
  const [likes, setLikes] = useState(post.likes || 0);
  const [isSaved, setIsSaved] = useState(!!post.savedByMe);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setIsLiked(!!post.likedByMe);
    setLikes(post.likes || 0);
    setIsSaved(!!post.savedByMe);
  }, [post.id, post.likedByMe, post.likes, post.savedByMe]);

  const toggle = () => setExpanded((v) => !v);

  const like = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.toggleBlogLike(post.id);
      setLikes(res.likes);
      setIsLiked(res.likedByMe);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const saveBlog = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const { saved } = await api.toggleSavedBlog(post.id);
      setIsSaved(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const plain = stripHtml(post.content || '');
  const display = expanded ? plain : (plain.length > 180 ? plain.slice(0, 180) + '…' : plain);

  return (
    <div className="blog-card">
      {post.coverImage && (
        <img src={post.coverImage} alt="" className="blog-card-cover" />
      )}
      <div className="blog-card-content">
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
            disabled={busy}
            style={{
              cursor: busy ? 'wait' : 'pointer',
              opacity: 0.9
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
    </div>
  );
}

// ==========================================
// 2. Parent Component: Blog
// ==========================================
const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [rawBlogs, setRawBlogs] = useState(() => {
    try {
      const cached = localStorage.getItem('explore_blogs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [listError, setListError] = useState(null);
  const [listLoading, setListLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('explore_blogs');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let cancelled = false;
    if (rawBlogs.length === 0) {
      setListLoading(true);
    }
    setListError(null);
    api
      .listPublishedBlogs()
      .then((list) => {
        if (!cancelled) {
          const bl = Array.isArray(list) ? list : [];
          setRawBlogs(bl);
          try { localStorage.setItem('explore_blogs', JSON.stringify(bl)); } catch(e){}
        }
      })
      .catch((e) => {
        if (!cancelled) setListError(e.message || 'Could not load posts');
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    'All Categories', 'Technology', 'Health & Wellness',
    'Career & Education', 'Lifestyle', 'Personal Development', 'Community Stories'
  ];

  const sortOptions = [
    'Latest', 'Most Popular', 'Most Recent', 'Alphabetical'
  ];

  const blogs = useMemo(() => {
    let sortedList = [...rawBlogs];
    if (sortBy === 'latest' || sortBy === 'most-recent') {
      sortedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'most-popular') {
      sortedList.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'alphabetical') {
      sortedList.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    if (selectedCategory !== 'all') {
      // Category tags not stored on posts yet; keep full list
    }
    return sortedList;
  }, [rawBlogs, sortBy, selectedCategory]);

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
        {listLoading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading posts…</p>
        ) : listError ? (
          <div className="blog-grid">
            <div className="blog-placeholder">
              <h3>Could not load posts</h3>
              <p>{listError}</p>
              <p style={{ fontSize: '0.9rem' }}>
                Start the API with <code>npm run server</code> from the project root, or run{' '}
                <code>npm run dev</code> for client + server together.
              </p>
            </div>
          </div>
        ) : blogs.length === 0 ? (
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