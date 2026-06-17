import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import './BlogDetail.css'; // We will create this file next

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getBlog(id)
      .then((b) => {
        if (!cancelled) setPost(b);
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="blog-detail-loading">Loading...</div>;

  const isForeignDraft =
    post?.isDraft &&
    !(user?.id && post.userId != null && String(post.userId) === String(user.id));

  if (!post || isForeignDraft) {
    return (
      <div className="blog-detail-error">
        <h2>Blog not found</h2>
        <button className="back-btn" onClick={() => navigate('/blog')}>
          ← Go Back
        </button>
      </div>
    );
  }

  const htmlContent = typeof post.content === 'string' && post.content.includes('<');

  return (
    <div className="blog-detail-container">
      <button type="button" className="back-btn" onClick={() => navigate('/blog')}>
        ← Back to Explore
      </button>

      {post.isDraft && (
        <p className="blog-draft-banner">
          Draft — only you can see this.{' '}
          <button
            type="button"
            className="blog-draft-edit-btn"
            onClick={() => navigate('/blog/create', { state: { blogData: post } })}
          >
            Continue editing
          </button>
        </p>
      )}

      <div className="blog-detail-card">
        {post.coverImage && (
          <div className="blog-detail-cover-wrap">
            <img src={post.coverImage} alt="" className="blog-detail-cover" />
          </div>
        )}
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
          {htmlContent ? (
            <div
              className="blog-detail-html"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            (post.content || '').split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;