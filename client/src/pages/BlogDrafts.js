import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import './Blog.css';
import './BlogDetail.css';

function BlogDrafts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setDrafts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .listDrafts()
      .then((list) => {
        if (!cancelled) setDrafts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setDrafts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="blog-container">
      <div className="blog-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <button
          type="button"
          className="back-btn"
          style={{ marginBottom: 0 }}
          onClick={() => navigate('/blog')}
        >
          ← Back to Explore
        </button>
        <h1 className="blog-drafts-page-title">Saved drafts</h1>
        <p style={{ margin: 0, color: '#666' }}>
          Drafts are only visible to you. Publish from the editor when you are ready.
        </p>
      </div>

      <div className="blog-content">
        {loading ? (
          <p style={{ color: '#666' }}>Loading drafts…</p>
        ) : drafts.length === 0 ? (
          <div className="blog-grid">
            <div className="blog-placeholder">
              <div className="placeholder-icon">📝</div>
              <h3>No drafts yet</h3>
              <p>Save a post as draft from Create to see it here.</p>
              <button
                type="button"
                className="blog-readmore"
                onClick={() => navigate('/blog/create')}
              >
                Create a blog
              </button>
            </div>
          </div>
        ) : (
          <div className="blog-list">
            {drafts.map((post) => {
              const preview = stripHtml(post.content);
              const short =
                preview.length > 160 ? `${preview.slice(0, 160)}…` : preview || '(No content yet)';
              return (
                <div className="blog-card" key={post.id}>
                  <h3>{post.title?.trim() || 'Untitled draft'}</h3>
                  <div className="blog-tags">
                    {post.tags?.map((t) => (
                      <span className="blog-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <p>{short}</p>
                  <div className="blog-actions">
                    <small>
                      Last updated{' '}
                      {new Date(post.updatedAt || post.createdAt).toLocaleString()}
                    </small>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="blog-readmore"
                        onClick={() =>
                          navigate('/blog/create', { state: { blogData: post } })
                        }
                      >
                        Continue editing
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogDrafts;
