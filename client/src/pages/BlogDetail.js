import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css'; // We will create this file next

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blog from localStorage
    try {
      const raw = localStorage.getItem('blogs');
      const list = raw ? JSON.parse(raw) : [];
      const found = list.find((b) => String(b.id) === String(id));
      setPost(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="blog-detail-loading">Loading...</div>;

  if (!post) {
    return (
      <div className="blog-detail-error">
        <h2>Blog not found</h2>
        <button className="back-btn" onClick={() => navigate('/blog')}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      <button className="back-btn" onClick={() => navigate('/blog')}>
        ← Back to Explore
      </button>

      <div className="blog-detail-card">
        <div className="blog-detail-header">
          <div className="blog-meta">
            <div className="blog-tags-list">
              {post.tags?.map((t) => (
                <span key={t} className="detail-tag">{t}</span>
              ))}
            </div>
            <span className="detail-date">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <h1 className="detail-title">{post.title}</h1>
        </div>

        <div className="detail-divider"></div>

        <div className="blog-detail-content">
          {/* This preserves your paragraphs */}
          {post.content.split('\n').map((paragraph, idx) => (
             <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;