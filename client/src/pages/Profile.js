import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import { useLanguage } from '../context/LanguageContext';
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
  const { user, logout, updateUser } = useAuth();
  const { t } = useLanguage();

  const [blogs, setBlogs] = useState(() => {
    if (!user?.id) return [];
    try {
      const cached = localStorage.getItem(`user_blogs_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [draftCount, setDraftCount] = useState(() => {
    if (!user?.id) return 0;
    try {
      const cached = localStorage.getItem(`user_draft_count_${user.id}`);
      return cached ? parseInt(cached, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [userStories, setUserStories] = useState(() => {
    if (!user?.id) return [];
    try {
      const cached = localStorage.getItem(`user_stories_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [followersList, setFollowersList] = useState(() => {
    if (!user?.id) return [];
    try {
      const cached = localStorage.getItem(`user_followers_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [followingList, setFollowingList] = useState(() => {
    if (!user?.id) return [];
    try {
      const cached = localStorage.getItem(`user_following_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [followingIds, setFollowingIds] = useState(() => {
    if (!user?.id) return new Set();
    try {
      const cached = localStorage.getItem(`user_following_ids_${user.id}`);
      return cached ? new Set(JSON.parse(cached)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [savedBlogs, setSavedBlogs] = useState(() => {
    if (!user?.id) return [];
    try {
      const cached = localStorage.getItem(`user_saved_blogs_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [likedBlogs, setLikedBlogs] = useState(() => {
    if (!user?.id) return [];
    try {
      const cached = localStorage.getItem(`user_liked_blogs_${user.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const loadProfileData = React.useCallback(async () => {
    if (!user?.id) return;
    
    let pub = [], drafts = [], stories = [], fol = [], fing = [], saved = [], liked = [];
    
    await Promise.all([
      api.authMe().then(me => updateUser(me)).catch(e => console.error('authMe:', e)),
      api.getUserBlogs(user.id).then(res => pub = res).catch(e => console.error('user blogs:', e)),
      api.listDrafts().then(res => drafts = res).catch(e => console.error('drafts:', e)),
      api.storiesActive().then(res => stories = res).catch(e => console.error('stories:', e)),
      api.getFollowers(user.id).then(res => fol = res).catch(e => console.error('followers:', e)),
      api.getFollowing(user.id).then(res => fing = res).catch(e => console.error('following:', e)),
      api.getSavedBlogs().then(res => saved = res).catch(e => console.error('saved blogs:', e)),
      api.getLikedBlogs().then(res => liked = res).catch(e => console.error('liked blogs:', e))
    ]);

    setBlogs(Array.isArray(pub) ? pub : []);
    if (Array.isArray(pub)) {
      try { localStorage.setItem(`user_blogs_${user.id}`, JSON.stringify(pub)); } catch(e){}
    }
    const dCount = Array.isArray(drafts) ? drafts.length : 0;
    setDraftCount(dCount);
    try { localStorage.setItem(`user_draft_count_${user.id}`, String(dCount)); } catch(e){}

    const mine = (Array.isArray(stories) ? stories : [])
      .filter((story) => story.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
      );
    setUserStories(mine);
    try { localStorage.setItem(`user_stories_${user.id}`, JSON.stringify(mine)); } catch(e){}

    const followers = Array.isArray(fol) ? fol : [];
    setFollowersList(followers);
    try { localStorage.setItem(`user_followers_${user.id}`, JSON.stringify(followers)); } catch(e){}

    const fl = Array.isArray(fing) ? fing : [];
    setFollowingList(fl);
    try { localStorage.setItem(`user_following_${user.id}`, JSON.stringify(fl)); } catch(e){}

    const fIds = fl.map((u) => u.id);
    setFollowingIds(new Set(fIds));
    try { localStorage.setItem(`user_following_ids_${user.id}`, JSON.stringify(fIds)); } catch(e){}

    const savedList = Array.isArray(saved) ? saved : [];
    setSavedBlogs(savedList);
    try { localStorage.setItem(`user_saved_blogs_${user.id}`, JSON.stringify(savedList)); } catch(e){}

    const likedList = Array.isArray(liked) ? liked : [];
    setLikedBlogs(likedList);
    try { localStorage.setItem(`user_liked_blogs_${user.id}`, JSON.stringify(likedList)); } catch(e){}
  }, [user?.id, updateUser]);

  useEffect(() => {
    if (user?.id) {
      try {
        const cachedBlogs = localStorage.getItem(`user_blogs_${user.id}`);
        if (cachedBlogs) setBlogs(JSON.parse(cachedBlogs));
        
        const cachedDrafts = localStorage.getItem(`user_draft_count_${user.id}`);
        if (cachedDrafts) setDraftCount(parseInt(cachedDrafts, 10) || 0);
        
        const cachedStories = localStorage.getItem(`user_stories_${user.id}`);
        if (cachedStories) setUserStories(JSON.parse(cachedStories));
        
        const cachedFollowers = localStorage.getItem(`user_followers_${user.id}`);
        if (cachedFollowers) setFollowersList(JSON.parse(cachedFollowers));
        
        const cachedFollowing = localStorage.getItem(`user_following_${user.id}`);
        if (cachedFollowing) setFollowingList(JSON.parse(cachedFollowing));
        
        const cachedFollowingIds = localStorage.getItem(`user_following_ids_${user.id}`);
        if (cachedFollowingIds) setFollowingIds(new Set(JSON.parse(cachedFollowingIds)));
        
        const cachedSaved = localStorage.getItem(`user_saved_blogs_${user.id}`);
        if (cachedSaved) setSavedBlogs(JSON.parse(cachedSaved));
        
        const cachedLiked = localStorage.getItem(`user_liked_blogs_${user.id}`);
        if (cachedLiked) setLikedBlogs(JSON.parse(cachedLiked));
      } catch (e) {
        console.error('Error loading cached profile data:', e);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfileData();
  }, [user?.id, refreshKey, location.pathname, loadProfileData]);

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 60 * 60 * 1000);
    return () => clearInterval(interval);
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
    input.onchange = (ev) => {
      const file = ev.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            await api.createStory(e.target.result);
            setRefreshKey((prev) => prev + 1);
            alert('Story uploaded! It will be visible for 24 hours.');
          } catch (err) {
            alert(err.message || 'Failed to upload story');
          }
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
      (async () => {
        try {
          await api.deleteStory(storyToDelete);
          setShowStoryMenu(false);
          const remainingStories = userStories.filter((s) => s.id !== storyToDelete);
          if (remainingStories.length === 0) {
            setShowStoryViewer(false);
          } else if (currentStoryIndex >= remainingStories.length) {
            setCurrentStoryIndex(remainingStories.length - 1);
          }
          setRefreshKey((k) => k + 1);
        } catch (error) {
          console.error('Error deleting story:', error);
          alert('Failed to delete story. Please try again.');
        }
      })();
    }
  };

  const handleAddAnotherStory = () => {
    setShowStoryViewer(false);
    setShowStoryOptions(true);
  };

  if (!user) return null;

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
                <span><strong>{blogs.length}</strong> {t("blogs")}</span>
                <span 
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFollowers(true);
                  }}
                >
                  <strong>{user?.followers || 0}</strong> {t("follower")}
                </span>
                <span 
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFollowing(true);
                  }}
                >
                  <strong>{user?.following || 0}</strong> {t("following")}
                </span>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-fullname">{user?.fullName || user?.username || 'Full name'}</div>
              <div className="profile-handle">@{user?.username || 'username'}</div>
              {user?.city && (
                <div className="profile-meta-line">📍 {user.city}</div>
              )}
              <div className="profile-bio">{user?.bio || t('Add a short bio in Edit profile…')}</div>
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
            {t("Edit Profile")}
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
            {t("View archive")}
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
                  <span>🔒</span> {t("Change Password")}
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
                  <span>🛡️</span> {t("Privacy Policy")}
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
                  <span>❓</span> {t("Help Center")}
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
                  <span>🚪</span> {t("Logout")}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* --- END UPDATED SECTION --- */}
      </div>

      <div className="create-blog-section">
        <div className="create-blog-card">
          <h2>{t("Ready to Share Your Thoughts?")}</h2>
          <p>{t("Create a new blog post and share your knowledge with the community")}</p>
          <button className="create-blog-main-btn" onClick={handleCreateBlog}>
            ✍️ {t("Create")} {t("New Blog")}
          </button>
          {draftCount > 0 && (
            <button
              type="button"
              className="create-blog-main-btn profile-drafts-btn"
              onClick={() => navigate('/blog/drafts')}
            >
              📝 {t("View saved drafts")} ({draftCount})
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>📱 {t("Grid")}</button>
        <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>💾 {t("Saved")}</button>
        <button className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => setActiveTab('liked')}>❤️ {t("Liked")}</button>
      </div>

      <div className="profile-content">
        {activeTab === 'grid' && (
          blogs.length === 0 ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon"></div>
                <p>{t("Your blogs will appear here")}</p>
                <button className="create-first-blog-btn" onClick={handleCreateBlog}>{t("Create Your First Blog")}</button>
              </div>
            </div>
          ) : (
            <div className="content-grid">
              {blogs.map((b) => (
                <ProfileBlogCard key={b.id} blog={b} onChanged={() => setRefreshKey((k) => k + 1)} />
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedBlogs.length === 0 ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon">💾</div>
                <p>{t("Saved blogs will appear here")}</p>
              </div>
            </div>
          ) : (
            <div className="content-grid">
              {savedBlogs.map((blog) => (
                <SavedBlogCard key={blog.id} blog={blog} onChanged={() => setRefreshKey((k) => k + 1)} />
              ))}
            </div>
          )
        )}

        {activeTab === 'liked' && (
          likedBlogs.length === 0 ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon">❤️</div>
                <p>Like posts from Explore to see them here</p>
              </div>
            </div>
          ) : (
            <div className="content-grid">
              {likedBlogs.map((blog) => (
                <LikedBlogCard key={blog.id} blog={blog} onUnlike={() => setRefreshKey((k) => k + 1)} />
              ))}
            </div>
          )
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
              <button type="button" className="story-option" onClick={handleAddStory}>
                <span className="option-icon">📸</span>
                <span>Add story</span>
              </button>
              <p className="story-options-hint">You can add several; each stays visible for 24 hours. Open your story ring to swipe or delete.</p>
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
                  <FollowerItem
                    key={follower.id}
                    follower={follower}
                    currentUser={user}
                    followingIds={followingIds}
                    onRelationshipChanged={() => setRefreshKey((k) => k + 1)}
                    syncProfileUser={updateUser}
                  />
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
                  <FollowingItem
                    key={following.id}
                    following={following}
                    currentUser={user}
                    onRelationshipChanged={() => setRefreshKey((k) => k + 1)}
                    syncProfileUser={updateUser}
                  />
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
function FollowerItem({ follower, currentUser, followingIds, onRelationshipChanged, syncProfileUser }) {
  const navigate = useNavigate();

  const isFollowingBack = !!(follower?.id && followingIds?.has(follower.id));

  const refreshLocal = async () => {
    onRelationshipChanged?.();
    try {
      const fresh = await api.authMe();
      syncProfileUser(fresh);
    } catch {
      /* ignore */
    }
  };

  const handleFollowBack = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id || !follower?.id) return;
    try {
      await api.followSend(follower.id);
      await refreshLocal();
    } catch {
      alert('Could not send follow request.');
    }
  };

  const handleRemoveFollower = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id || !follower?.id) return;
    if (!window.confirm('Remove this follower? They will no longer follow you.')) return;
    try {
      await api.followRemoveFollower(follower.id);
      await refreshLocal();
    } catch {
      alert('Could not remove follower.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', gap: '8px' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#fff0f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '4px',
          cursor: 'pointer',
          overflow: 'hidden',
          flexShrink: 0
        }}
        onClick={() => navigate(`/user/${follower.id}`)}
      >
        {follower.profileImage ? (
          <img src={follower.profileImage} alt={follower.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{(follower.username || 'U').charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => navigate(`/user/${follower.id}`)}>
        <div style={{ fontWeight: '600' }}>{follower.username || follower.fullName || 'User'}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{follower.bio || 'No bio'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {!isFollowingBack && (
          <button
            type="button"
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
        <button
          type="button"
          onClick={handleRemoveFollower}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            background: '#fff',
            color: '#c62828',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// Following Item Component
function FollowingItem({ following, currentUser, onRelationshipChanged, syncProfileUser }) {
  const navigate = useNavigate();

  const handleUnfollow = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id || !following?.id) return;
    if (!window.confirm('Unfollow this user?')) return;
    try {
      await api.followUnfollow(following.id);
      onRelationshipChanged?.();
      const fresh = await api.authMe();
      syncProfileUser(fresh);
    } catch {
      alert('Could not unfollow.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        borderBottom: '1px solid #eee',
        gap: '8px'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#fff0f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '4px',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0
        }}
        onClick={() => navigate(`/user/${following.id}`)}
      >
        {following.profileImage ? (
          <img src={following.profileImage} alt={following.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{(following.username || 'U').charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => navigate(`/user/${following.id}`)}>
        <div style={{ fontWeight: '600' }}>{following.username || following.fullName || 'User'}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{following.bio || 'No bio'}</div>
      </div>
      <button
        type="button"
        onClick={handleUnfollow}
        style={{
          fontSize: '12px',
          padding: '6px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          background: '#fff',
          color: '#c62828',
          cursor: 'pointer',
          fontWeight: 600,
          flexShrink: 0
        }}
      >
        Unfollow
      </button>
    </div>
  );
}

export default Profile;

// --- Sub-components ---

function LikedBlogCard({ blog, onUnlike }) {
  const navigate = useNavigate();
  const cleanContent = (blog.content || '').replace(/<[^>]*>?/gm, '');
  const displayContent = cleanContent.length > 140 ? cleanContent.slice(0, 140) + '…' : cleanContent;

  const removeLike = async () => {
    try {
      await api.toggleBlogLike(blog.id);
      onUnlike?.();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="liked-blog-card">
      {blog.coverImage && (
        <button type="button" className="liked-blog-cover-btn" onClick={() => navigate(`/blog/${blog.id}`)}>
          <img src={blog.coverImage} alt="" className="liked-blog-cover" />
        </button>
      )}
      <div className="liked-blog-body">
        <div className="liked-blog-title">{blog.title}</div>
        <div className="liked-blog-date">{new Date(blog.createdAt).toLocaleDateString()}</div>
        <div className="liked-blog-snippet">{displayContent || 'Open to read'}</div>
        <div className="liked-blog-actions">
          <button type="button" className="blog-readmore" onClick={() => navigate(`/blog/${blog.id}`)}>
            Read more
          </button>
          <button type="button" className="liked-blog-unlike" onClick={removeLike}>
            Unlike
          </button>
        </div>
      </div>
    </div>
  );
}

function SavedBlogCard({ blog, onChanged }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cleanContent = (blog.content || '').replace(/<[^>]*>?/gm, '');
  const displayContent = cleanContent.length > 140 ? cleanContent.slice(0, 140) + '…' : cleanContent;

  const removeFromSaved = async () => {
    try {
      await api.toggleSavedBlog(blog.id);
      onChanged?.();
    } catch {
      /* ignore */
    }
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

function ProfileBlogCard({ blog, onChanged }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cleanContent = (blog.content || '').replace(/<[^>]*>?/gm, '');
  const displayContent = cleanContent.length > 140 ? cleanContent.slice(0, 140) + '…' : cleanContent;

  const handleEdit = () => {
    navigate('/blog/create', { state: { blogData: blog } });
  };

  const remove = async () => {
    if (window.confirm('Are you sure you want to delete this blog? This cannot be undone.')) {
      try {
        await api.deleteBlog(blog.id);
        onChanged?.();
      } catch {
        alert('Could not delete post.');
      }
    }
  };

  const archive = async () => {
    if (window.confirm('Are you sure you want to archive this blog? It will be removed from your profile and feed.')) {
      try {
        const archived = JSON.parse(localStorage.getItem('archivedBlogs') || '[]');
        const archivedBlog = {
          ...blog,
          deletedAt: new Date().toISOString()
        };
        archived.push(archivedBlog);
        localStorage.setItem('archivedBlogs', JSON.stringify(archived));
        
        await api.deleteBlog(blog.id);
        onChanged?.();
        alert('Blog archived successfully!');
      } catch (err) {
        console.error(err);
        alert('Could not archive blog.');
      }
    }
  };

  return (
    <div style={{ background: '#ffe6f0', border: '1px solid #ffc1dd', borderRadius: 12, padding: 0, overflow: 'visible', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button type="button" onClick={() => setMenuOpen((v) => !v)} style={{ position: 'absolute', right: 8, top: 8, zIndex: 2, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '18px', width: 32, height: 32 }}>⋯</button>
      {menuOpen && (
        <div style={{ position: 'absolute', right: 8, top: 40, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10 }}>
          <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={handleEdit}>Edit</div>
          <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={archive}>Archive</div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#e91e63' }} onClick={remove}>Delete</div>
        </div>
      )}
      {blog.coverImage && (
        <img src={blog.coverImage} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', borderTopLeftRadius: '11px', borderTopRightRadius: '11px' }} />
      )}
      <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, paddingRight: '20px', color: '#c2185b' }}>{blog.title}</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{new Date(blog.createdAt).toLocaleDateString()}</div>
      <div style={{ fontSize: 14, marginBottom: 12, color: '#555', flexGrow: 1 }}>{displayContent}</div>
      <button type="button" className="blog-readmore" onClick={() => navigate(`/blog/${blog.id}`)}>Read more</button>
      </div>
    </div>
  );
}