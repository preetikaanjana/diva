import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB, friendRequestDB, storyDB } from '../utils/database';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('grid');
  const [showStoryOptions, setShowStoryOptions] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryMenu, setShowStoryMenu] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // --- NEW: State for the settings dropdown ---
  const [showSettings, setShowSettings] = useState(false); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, login } = useAuth();

  

  // Refresh user data from database
  // Refresh user data from database
  useEffect(() => {
    if (user?.id) {
      const dbUser = userDB.getUserById(user.id);
      if (dbUser) {
        const { password, ...userData } = dbUser;
        
        // Check if data actually changed to avoid infinite loop
        if (JSON.stringify(user) !== JSON.stringify(userData)) {
          if (login) {
            login(userData);
          }
        }
      }
    }
    // eslint-disable-next-line
  }, [user?.id, location.pathname]);

  // Fetch blogs - filter by current user
  const blogs = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('blogs');
      const allBlogs = raw ? JSON.parse(raw) : [];
      // Filter blogs by current user ID
      return allBlogs.filter(blog => blog.userId === user?.id);
    } catch {
      return [];
    }
  }, [user?.id]);

  // Archive expired stories on mount
  useEffect(() => {
    storyDB.archiveExpiredStories();
    // Check every hour for expired stories
    const interval = setInterval(() => {
      storyDB.archiveExpiredStories();
      window.location.reload();
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, []);

  // Fetch user stories - sorted by newest first, show most recent in first circle
  const userStories = React.useMemo(() => {
    if (!user?.id) return [];
    try {
      // Get only active (non-expired) stories
      const allActiveStories = storyDB.getActiveStories();
      const filtered = allActiveStories.filter(story => story.userId === user.id);
      // Sort by timestamp, newest first
      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch {
      return [];
    }
  }, [user?.id, refreshKey]);

  // Get followers list
  const followersList = useMemo(() => {
    if (!user?.id) return [];
    const followerIds = friendRequestDB.getFollowers(user.id);
    return followerIds.map(id => userDB.getUserById(id)).filter(Boolean);
  }, [user?.id]);

  // Get following list
  const followingList = useMemo(() => {
    if (!user?.id) return [];
    const followingIds = friendRequestDB.getFollowing(user.id);
    return followingIds.map(id => userDB.getUserById(id)).filter(Boolean);
  }, [user?.id]);

  // Fetch saved blogs
  const savedBlogs = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('savedBlogs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateBlog = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate('/blog/create');
  };

  const handleProfilePictureClick = (e) => {
    e.stopPropagation();
    if (userStories.length > 0) {
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
    } else {
      // Directly trigger file input for adding story
      handleAddStory();
    }
  };

  const handleAddStory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const storyData = {
            id: Date.now().toString(),
            image: e.target.result,
            timestamp: new Date().toISOString(),
            userId: user.id
          };
          storyDB.createStory(storyData);
          setRefreshKey(prev => prev + 1);
          alert('Story uploaded! It will be visible for 24 hours.');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCloseStoryOptions = () => setShowStoryOptions(false);
  const handleCloseStoryViewer = () => setShowStoryViewer(false);

  const handleNextStory = () => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setShowStoryViewer(false);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleDeleteStory = (storyId = null) => {
    const storyToDelete = storyId || userStories[currentStoryIndex]?.id;
    if (!storyToDelete) return;

    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        storyDB.deleteStory(storyToDelete);
        setShowStoryMenu(false);

        const remainingStories = userStories.filter(s => s.id !== storyToDelete);
        if (remainingStories.length === 0) {
          setShowStoryViewer(false);
        } else if (currentStoryIndex >= remainingStories.length) {
          setCurrentStoryIndex(remainingStories.length - 1);
        }
        // Force re-render to update story list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting story:', error);
        alert('Failed to delete story. Please try again.');
      }
    }
  };

  const handleAddAnotherStory = () => {
    setShowStoryViewer(false);
    setShowStoryOptions(true);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      {/* Profile Header Section */}
      <div className="profile-header">
        <div className="profile-left">
          {/* Profile Picture */}
          <div className="profile-picture">
            <div 
              className={`profile-avatar ${userStories.length > 0 ? 'has-story' : ''}`} 
              onClick={handleProfilePictureClick}
              style={{
                border: userStories.length > 0 ? '3px solid #e91e63' : 'none',
                cursor: 'pointer'
              }}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-image" />
              ) : (
                <span>{user?.username?.charAt(0).toUpperCase() || '👤'}</span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            <div className="profile-top-row">
              <div className="profile-username">{user?.username || 'username'}</div>

              {/* Profile Stats */}
              <div className="profile-stats">
                <span><strong>{blogs.length}</strong> blogs</span>
                <span 
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFollowers(true);
                  }}
                >
                  <strong>{user?.followers || 0}</strong> follower
                </span>
                <span 
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFollowing(true);
                  }}
                >
                  <strong>{user?.following || 0}</strong> following
                </span>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-fullname">{user?.fullName || user?.username || 'Full Name'}</div>
              <div className="profile-bio">{user?.bio || 'Your bio goes here...'}</div>
            </div>
          </div>
        </div>

        {/* --- UPDATED PROFILE ACTIONS SECTION --- */}
        <div className="profile-actions">
          <button 
            className="profile-btn edit-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/profile/edit');
            }}
            style={{ cursor: 'pointer' }}
          >
            Edit profile
          </button>
          <button 
            className="profile-btn archive-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/profile/archive');
            }}
            style={{ cursor: 'pointer' }}
          >
            View archive
          </button>
          
          {/* Settings Button Wrapper with Dropdown */}
          <div className="settings-wrapper" style={{ position: 'relative' }}>
            <button 
              className={`profile-settings ${showSettings ? 'active' : ''}`} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span>⚙️</span>
            </button>

            {/* The Dropdown Menu */}
            {showSettings && (
              <div className="settings-dropdown" style={{ zIndex: 1000 }}>
                <div 
                  className="settings-item" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(false);
                    navigate('/change-password');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span>🔒</span> Change Password
                </div>
                <div 
                  className="settings-item" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(false);
                    navigate('/privacy');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span>🛡️</span> Privacy
                </div>
                <div 
                  className="settings-item" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(false);
                    navigate('/help');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span>❓</span> Help & Support
                </div>
                <div className="settings-divider"></div>
                <div 
                  className="settings-item logout" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(false);
                    handleLogout();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span>🚪</span> Log Out
                </div>
              </div>
            )}
          </div>
        </div>
        {/* --- END UPDATED SECTION --- */}
      </div>

      <div className="create-blog-section">
        <div className="create-blog-card">
          <h2>Ready to Share Your Thoughts?</h2>
          <p>Create a new blog post and share your knowledge with the community</p>
          <button className="create-blog-main-btn" onClick={handleCreateBlog}>
            ✍️ Create New Blog
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>📱 Grid</button>
        <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>💾 Saved</button>
        <button className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => setActiveTab('liked')}>❤️ Liked</button>
      </div>

      <div className="profile-content">
        {activeTab === 'grid' && (
          blogs.length === 0 ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon"></div>
                <p>Your blogs will appear here</p>
                <button className="create-first-blog-btn" onClick={handleCreateBlog}>Create Your First Blog</button>
              </div>
            </div>
          ) : (
            <div className="content-grid">
              {blogs.map((b) => (
                <ProfileBlogCard key={b.id} blog={b} />
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedBlogs.length === 0 ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon">💾</div>
                <p>Saved blogs will appear here</p>
              </div>
            </div>
          ) : (
            <div className="content-grid">
              {savedBlogs.map((blog) => (
                <SavedBlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )
        )}

        {activeTab === 'liked' && (
          <div className="content-grid">
            <div className="content-placeholder">
              <div className="placeholder-icon">❤️</div>
              <p>Liked blogs will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Story Modals (Options & Viewer) */}
      {showStoryOptions && (
        <div className="story-options-modal" onClick={handleCloseStoryOptions}>
          <div className="story-options-content" onClick={(e) => e.stopPropagation()}>
            <div className="story-options-header">
              <h3>Story Options</h3>
              <button className="close-btn" onClick={handleCloseStoryOptions}>×</button>
            </div>
            <div className="story-options-list">
              <button className="story-option" onClick={handleAddStory}>
                <span className="option-icon">📸</span>
                <span>Add Story</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showStoryViewer && userStories.length > 0 && (
        <div className="story-viewer-modal" onClick={handleCloseStoryViewer}>
          <div className="story-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="story-viewer-header">
              <div className="story-user-info">
                <div className="story-user-avatar">
                  {user?.profileImage ? <img src={user.profileImage} alt="Profile" className="story-profile-image" /> : <span>{user?.username?.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="story-user-details">
                  <span className="story-username">{user?.username}</span>
                  <span className="story-time">{new Date(userStories[currentStoryIndex]?.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="story-header-actions">
                <button className="story-menu-btn" onClick={() => setShowStoryMenu(!showStoryMenu)}>⋯</button>
                <button className="close-story-btn" onClick={handleCloseStoryViewer}>×</button>
              </div>
            </div>

            <div className="story-image-container">
              <img src={userStories[currentStoryIndex]?.image} alt="Story" className="story-image" />
              <button className="story-nav-btn story-prev-btn" onClick={handlePrevStory} disabled={currentStoryIndex === 0}>‹</button>
              <button className="story-nav-btn story-next-btn" onClick={handleNextStory}>›</button>
            </div>

            <div className="story-progress">
              {userStories.map((_, index) => (
                <div key={index} className={`story-progress-bar ${index === currentStoryIndex ? 'active' : ''}`} />
              ))}
            </div>

            {showStoryMenu && (
              <div className="story-menu-dropdown">
                <button className="story-menu-option" onClick={handleDeleteStory}><span className="menu-icon">🗑️</span> Delete Story</button>
                {userStories.length > 1 && <button className="story-menu-option" onClick={handleAddAnotherStory}><span className="menu-icon">📸</span> Add Another Story</button>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowers && (
        <div className="story-options-modal" onClick={() => setShowFollowers(false)}>
          <div className="story-options-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '500px', overflowY: 'auto' }}>
            <div className="story-options-header">
              <h3>Followers</h3>
              <button className="close-btn" onClick={() => setShowFollowers(false)}>×</button>
            </div>
            <div className="story-options-list">
              {followersList.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No followers yet</div>
              ) : (
                followersList.map((follower) => (
                  <FollowerItem key={follower.id} follower={follower} currentUser={user} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="story-options-modal" onClick={() => setShowFollowing(false)}>
          <div className="story-options-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '500px', overflowY: 'auto' }}>
            <div className="story-options-header">
              <h3>Following</h3>
              <button className="close-btn" onClick={() => setShowFollowing(false)}>×</button>
            </div>
            <div className="story-options-list">
              {followingList.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Not following anyone yet</div>
              ) : (
                followingList.map((following) => (
                  <FollowingItem key={following.id} following={following} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Follower Item Component with Follow Back option
function FollowerItem({ follower, currentUser }) {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if current user follows this follower back
  const isFollowingBack = React.useMemo(() => {
    if (!currentUser?.id || !follower?.id) return false;
    const followingIds = friendRequestDB.getFollowing(currentUser.id);
    return followingIds.includes(follower.id);
  }, [currentUser?.id, follower?.id, refreshKey]);

  const handleFollowBack = () => {
    if (!currentUser?.id || !follower?.id) return;
    const result = friendRequestDB.sendRequest(currentUser.id, follower.id);
    if (result) {
      // If they already follow us, accept immediately (mutual follow)
      const pendingReq = friendRequestDB.getPendingRequestsForUser(follower.id);
      const req = pendingReq.find(r => r.fromUserId === currentUser.id);
      if (req) {
        friendRequestDB.acceptRequest(req.id);
      }
      setRefreshKey(prev => prev + 1);
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' }}>
      <div 
        style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: '#fff0f6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginRight: '12px',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        onClick={() => navigate(`/user/${follower.id}`)}
      >
        {follower.profileImage ? (
          <img src={follower.profileImage} alt={follower.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{(follower.username || 'U').charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div 
        style={{ flex: 1, cursor: 'pointer' }}
        onClick={() => navigate(`/user/${follower.id}`)}
      >
        <div style={{ fontWeight: '600' }}>{follower.username || follower.fullName || 'User'}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{follower.bio || 'No bio'}</div>
      </div>
      {!isFollowingBack && (
        <button 
          className="follow-btn"
          onClick={handleFollowBack}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Follow Back
        </button>
      )}
      {isFollowingBack && (
        <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: '600' }}>Following</span>
      )}
    </div>
  );
}

// Following Item Component
function FollowingItem({ following }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => navigate(`/user/${following.id}`)}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        backgroundColor: '#fff0f6', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: '12px',
        overflow: 'hidden'
      }}>
        {following.profileImage ? (
          <img src={following.profileImage} alt={following.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{(following.username || 'U').charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600' }}>{following.username || following.fullName || 'User'}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{following.bio || 'No bio'}</div>
      </div>
    </div>
  );
}

export default Profile;

// --- Sub-components ---

function SavedBlogCard({ blog }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cleanContent = blog.content.replace(/<[^>]*>?/gm, '');
  const displayContent = cleanContent.length > 140 ? cleanContent.slice(0, 140) + '…' : cleanContent;

  const removeFromSaved = () => {
    try {
      const raw = localStorage.getItem('savedBlogs');
      const list = raw ? JSON.parse(raw) : [];
      const next = list.filter((b) => b.id !== blog.id);
      localStorage.setItem('savedBlogs', JSON.stringify(next));
      window.location.reload();
    } catch { }
  };

  return (
    <div style={{ background: '#f0f8ff', border: '1px solid #b3d9ff', borderRadius: 12, padding: 12, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button onClick={() => setMenuOpen((v) => !v)} style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>⋯</button>
      {menuOpen && (
        <div style={{ position: 'absolute', right: 8, top: 28, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10 }}>
          <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => navigate(`/blog/${blog.id}`)}>View</div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#e91e63' }} onClick={removeFromSaved}>Remove</div>
        </div>
      )}
      <div style={{ fontWeight: 600, marginBottom: 6, paddingRight: '20px', color: '#333' }}>{blog.title}</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{new Date(blog.createdAt).toLocaleDateString()}</div>
      <div style={{ fontSize: 14, marginBottom: 12, color: '#555', flexGrow: 1 }}>{displayContent}</div>
      <button className="blog-readmore" onClick={() => navigate(`/blog/${blog.id}`)}>Read more</button>
    </div>
  );
}

function ProfileBlogCard({ blog }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cleanContent = blog.content.replace(/<[^>]*>?/gm, '');
  const displayContent = cleanContent.length > 140 ? cleanContent.slice(0, 140) + '…' : cleanContent;

  // --- EDIT FUNCTIONALITY: Navigate to Create Page with Data ---
  const handleEdit = () => {
    navigate('/blog/create', { state: { blogData: blog } });
  };

  const remove = () => {
    if (window.confirm('Are you sure you want to delete this blog? It will be moved to archive.')) {
      try {
        const raw = localStorage.getItem('blogs');
        const list = raw ? JSON.parse(raw) : [];
        const blogToArchive = list.find((b) => b.id === blog.id);
        if (blogToArchive) {
          const archivedRaw = localStorage.getItem('archivedBlogs');
          const archived = archivedRaw ? JSON.parse(archivedRaw) : [];
          blogToArchive.deletedAt = new Date().toISOString();
          archived.push(blogToArchive);
          localStorage.setItem('archivedBlogs', JSON.stringify(archived));

          const next = list.filter((b) => b.id !== blog.id);
          localStorage.setItem('blogs', JSON.stringify(next));
          window.location.reload();
        }
      } catch { }
    }
  };

  return (
    <div style={{ background: '#ffe6f0', border: '1px solid #ffc1dd', borderRadius: 12, padding: 12, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button onClick={() => setMenuOpen((v) => !v)} style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>⋯</button>
      {menuOpen && (
        <div style={{ position: 'absolute', right: 8, top: 28, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10 }}>
          {/* UPDATED EDIT CLICK HANDLER */}
          <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={handleEdit}>Edit</div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#e91e63' }} onClick={remove}>Delete</div>
        </div>
      )}
      <div style={{ fontWeight: 600, marginBottom: 6, paddingRight: '20px', color: '#c2185b' }}>{blog.title}</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{new Date(blog.createdAt).toLocaleDateString()}</div>
      <div style={{ fontSize: 14, marginBottom: 12, color: '#555', flexGrow: 1 }}>{displayContent}</div>
      <button className="blog-readmore" onClick={() => navigate(`/blog/${blog.id}`)}>Read more</button>
    </div>
  );
}