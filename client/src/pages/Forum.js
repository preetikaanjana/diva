import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Forum.css';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/forum/posts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Sort posts by creation date (newest first)
        const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
      } catch (err) {
        setError('Failed to fetch posts. Please try again later.');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="forum-container">Loading posts...</div>;
  }

  if (error) {
    return <div className="forum-container error-message">{error}</div>;
  }

  return (
    <div className="forum-container">
      <h1>Community Forum</h1>
      <p>Connect with over 5,000 women and seek mentorship.</p>

      {/* Create Post button/link */}
      <Link to="/forum/create" className="create-post-button">
        <span className="plus-icon">+</span> Create New Post
      </Link>

      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="post-item">
              <h2>{post.title}</h2>
              {/* Assuming author and createdAt are available from the backend */}
              <p className="post-meta">By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="post-tag">{tag}</span>
                  ))}
                </div>
              )}
              {/* Displaying a short excerpt or the full content, depending on preference */}
              <p>{post.content.substring(0, 150)}...</p> { /* Displaying excerpt */}
              {/* Link to Post Detail page will be added later */}
              <button>Read More</button>
            </div>
          ))
        ) : (
          <p>No posts available yet. Be the first to create one!</p>
        )}
      </div>
    </div>
  );
}

export default Forum; 