import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import './BlogDetail.css';
import './ForumDetail.css';

function ForumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    return api.getQuestion(id).then(setQuestion).catch(() => setQuestion(null));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh()
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, refresh]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !question) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.addReply(question.id, replyText.trim());
      setQuestion(updated);
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="blog-detail-loading">Loading...</div>;

  if (!question) {
    return (
      <div className="blog-detail-error">
        <h2>Question not found</h2>
        <button type="button" className="back-btn" onClick={() => navigate('/forum')}>
          ← Back to Forum
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail-container forum-detail-page">
      <button type="button" className="back-btn" onClick={() => navigate('/forum')}>
        ← Back to Forum
      </button>

      <div className="blog-detail-card">
        <div className="blog-detail-header">
          <div className="blog-meta">
            <span className="detail-tag forum-category-pill">{question.category || 'General'}</span>
            <span className="detail-date">
              {new Date(question.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <h1 className="detail-title">{question.title}</h1>
          <p className="forum-detail-author">
            Posted by <strong>{question.author}</strong>
          </p>
        </div>

        <div className="detail-divider" />

        <div className="blog-detail-content forum-question-body">
          <p>{question.details}</p>
        </div>
      </div>

      <section className="forum-replies-section">
        <h2 className="forum-replies-heading">
          Replies ({question.replies?.length || 0})
        </h2>

        {(!question.replies || question.replies.length === 0) ? (
          <p className="forum-no-replies">No replies yet. Be the first to respond.</p>
        ) : (
          <ul className="forum-reply-list">
            {question.replies.map((r) => (
              <li key={r.id} className="forum-reply-card">
                <div className="forum-reply-meta">
                  <strong>{r.author}</strong>
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="forum-reply-text">{r.text}</p>
              </li>
            ))}
          </ul>
        )}

        <form className="forum-reply-form" onSubmit={handleSubmitReply}>
          <label htmlFor="forum-reply" className="forum-reply-label">
            Add a reply
          </label>
          <textarea
            id="forum-reply"
            className="forum-reply-input"
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Share your thoughts..."
          />
          <button type="submit" className="forum-reply-submit" disabled={submitting || !replyText.trim()}>
            {submitting ? 'Posting...' : 'Post reply'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ForumDetail;
