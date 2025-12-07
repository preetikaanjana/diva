import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Archive.css';

const Archive = () => {
  const navigate = useNavigate();
  const [archivedBlogs, setArchivedBlogs] = useState([]);

  useEffect(() => {
    try {
      const archived = localStorage.getItem('archivedBlogs');
      if (archived) {
        setArchivedBlogs(JSON.parse(archived));
      }
    } catch (error) {
      console.error('Error loading archived blogs:', error);
    }
  }, []);

  const getCleanText = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const restoreBlog = (blogId) => {
    try {
      const archived = JSON.parse(localStorage.getItem('archivedBlogs') || '[]');
      const blogToRestore = archived.find(blog => blog.id === blogId);
      
      if (blogToRestore) {
        const activeBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
        activeBlogs.push(blogToRestore);
        localStorage.setItem('blogs', JSON.stringify(activeBlogs));
        
        const updatedArchived = archived.filter(blog => blog.id !== blogId);
        localStorage.setItem('archivedBlogs', JSON.stringify(updatedArchived));
        setArchivedBlogs(updatedArchived);
      }
    } catch (error) {
      console.error('Error restoring blog:', error);
    }
  };

  const permanentlyDeleteBlog = (blogId) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        const archived = JSON.parse(localStorage.getItem('archivedBlogs') || '[]');
        const updatedArchived = archived.filter(blog => blog.id !== blogId);
        localStorage.setItem('archivedBlogs', JSON.stringify(updatedArchived));
        setArchivedBlogs(updatedArchived);
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  return (
    <div className="archive-wrapper">
      <div className="archive-container">
        <div className="archive-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>
          <h1>Archived Posts</h1>
        </div>

        <div className="archive-content">
          {archivedBlogs.length === 0 ? (
            <div className="empty-archive">
              <div className="empty-icon">📦</div>
              <h2>No Archived Blogs</h2>
              <p>Blogs you delete will show up here.</p>
            </div>
          ) : (
            <div className="archived-list">
              {archivedBlogs.map((blog) => (
                <div key={blog.id} className="archived-row-card">
                  
                  {/* Left Side: Info */}
                  <div className="row-info">
                    <div className="row-header">
                      <h3>{blog.title}</h3>
                      <span className="row-date">
                        Deleted: {new Date(blog.deletedAt || blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="row-preview">
                      {getCleanText(blog.content).slice(0, 80)}...
                    </p>
                  </div>
                  
                  {/* Right Side: Buttons */}
                  <div className="row-actions">
                    <button 
                      className="restore-btn"
                      onClick={() => restoreBlog(blog.id)}
                    >
                      Restore
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => permanentlyDeleteBlog(blog.id)}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;