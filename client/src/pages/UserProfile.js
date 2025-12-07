import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB, friendRequestDB, storyDB } from '../utils/database';
import './Profile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('grid');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // --- NEW: CSS Override to hide the pencil pseudo-element ---
  // We add this specific style to override Profile.css only for this page
  const hidePencilStyles = `
    .profile-avatar.view-only::after,
    .profile-avatar.view-only::before {
      display: none !important;
      content: none !important;
      background: none !important;
      border: none !important;
    }
    .profile-avatar.view-only:hover {
      opacity: 1 !important;
    }
  `;

  // Get profile user data
  const profileUser = useMemo(() => {
    if (!userId) return null;
    return userDB.getUserById(userId);
  }, [userId, refreshKey]);

  // Get user's blogs
  const userBlogs = useMemo(() => {
    if (!profileUser?.id) return [];
    try {
      const raw = localStorage.getItem('blogs');
      const allBlogs = raw ? JSON.parse(raw) : [];
      return allBlogs.filter(blog => blog.userId === profileUser.id);
    } catch {
      return [];
    }
  }, [profileUser?.id]);

  // Get user's stories
  const userStories = useMemo(() => {
    if (!profileUser?.id) return [];
    try {
      const allActiveStories = storyDB.getActiveStories();
      return allActiveStories
        .filter(story => story.userId === profileUser.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch {
      return [];
    }
  }, [profileUser?.id]);

  const handleProfilePictureClick = () => {
    if (userStories.length > 0) {
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
    }
  };

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      handleCloseStoryViewer();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Get followers list
  const followersList = useMemo(() => {
    if (!profileUser?.id) return [];
    const followerIds = friendRequestDB.getFollowers(profileUser.id);
    return followerIds.map(id => userDB.getUserById(id)).filter(Boolean);
  }, [profileUser?.id, refreshKey]);

  // Get following list
  const followingList = useMemo(() => {
    if (!profileUser?.id) return [];
    const followingIds = friendRequestDB.getFollowing(profileUser.id);
    return followingIds.map(id => userDB.getUserById(id)).filter(Boolean);
  }, [profileUser?.id, refreshKey]);

  // Check if current user follows profile user
  const isFollowing = useMemo(() => {
    if (!currentUser?.id || !profileUser?.id) return false;
    const following = friendRequestDB.getFollowing(currentUser.id);
    return following.includes(profileUser.id);
  }, [currentUser?.id, profileUser?.id, refreshKey]);

  // Check if profile is private and user can view
  const canViewContent = useMemo(() => {
    if (!profileUser) return false;
    // If account is public, everyone can view
    if (!profileUser.isPrivate) return true;
    // If account is private, only followers can view
    return isFollowing;
  }, [profileUser, isFollowing]);

  // Check request status
  const requestStatus = useMemo(() => {
    if (!currentUser?.id || !profileUser?.id || currentUser.id === profileUser.id) return null;
    
    const sentRequests = friendRequestDB.getRequestsSentByUser(currentUser.id);
    const pendingRequests = friendRequestDB.getPendingRequestsForUser(currentUser.id);
    
    const sentReq = sentRequests.find(r => r.toUserId === profileUser.id);
    if (sentReq) return { type: 'sent', requestId: sentReq.id };
    
    const receivedReq = pendingRequests.find(r => r.fromUserId === profileUser.id);
    if (receivedReq) return { type: 'received', requestId: receivedReq.id };
    
    // Check if already friends (accepted request)
    const allRequests = friendRequestDB.getAllRequests();
    const acceptedReq = allRequests.find(r => 
      ((r.fromUserId === currentUser.id && r.toUserId === profileUser.id) ||
       (r.fromUserId === profileUser.id && r.toUserId === currentUser.id)) &&
      r.status === 'accepted'
    );
    if (acceptedReq) return { type: 'friends' };
    
    return { type: 'none' };
  }, [currentUser?.id, profileUser?.id, refreshKey]);

  const handleSendRequest = () => {
    if (!currentUser?.id || !profileUser?.id) return;
    const result = friendRequestDB.sendRequest(currentUser.id, profileUser.id);
    if (result) {
      setRefreshKey(prev => prev + 1);
      alert('Friend request sent!');
    }
  };

  const handleAcceptRequest = () => {
    if (!requestStatus?.requestId) return;
    const result = friendRequestDB.acceptRequest(requestStatus.requestId);
    if (result) {
      setRefreshKey(prev => prev + 1);
      alert('Friend request accepted!');
    }
  };

  const handleDeclineRequest = () => {
    if (!requestStatus?.requestId) return;
    const result = friendRequestDB.declineRequest(requestStatus.requestId);
    if (result) {
      setRefreshKey(prev => prev + 1);
    }
  };

  if (!profileUser) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>User not found</h2>
        <button onClick={() => navigate('/home')}>Go back to Feed</button>
      </div>
    );
  }

  if (currentUser?.id === profileUser.id) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="profile-container">
      {/* Inject the override styles */}
      <style>{hidePencilStyles}</style>

      {/* Profile Header Section */}
      <div className="profile-header">
        <div className="profile-left">
          {/* Profile Picture */}
          <div className="profile-picture">
            <div 
              // ADDED 'view-only' class here to target it with our custom style
              className={`profile-avatar view-only ${userStories.length > 0 ? 'has-story' : ''}`}
              onClick={handleProfilePictureClick}
              style={{
                border: userStories.length > 0 ? '3px solid #e91e63' : 'none',
                cursor: userStories.length > 0 ? 'pointer' : 'default',
              }}
            >
              {profileUser?.profileImage ? (
                <img src={profileUser.profileImage} alt="Profile" className="profile-image" />
              ) : (
                <span>{profileUser?.username?.charAt(0).toUpperCase() || '👤'}</span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            <div className="profile-top-row">
              <div 
                className="profile-username"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/user/${profileUser.id}`)}
              >
                {profileUser?.username || 'username'}
              </div>

              {/* Profile Stats */}
              <div className="profile-stats">
                <span><strong>{userBlogs.length}</strong> blogs</span>
                <span 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFollowers(true)}
                >
                  <strong>{profileUser?.followers || 0}</strong> follower
                </span>
                <span 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFollowing(true)}
                >
                  <strong>{profileUser?.following || 0}</strong> following
                </span>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-fullname">{profileUser?.fullName || profileUser?.username || 'Full Name'}</div>
              <div className="profile-bio">{profileUser?.bio || 'No bio yet...'}</div>
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="profile-actions">
          {requestStatus?.type === 'sent' && (
            <button className="profile-btn edit-btn" disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>
              Requested
            </button>
          )}
          {requestStatus?.type === 'received' && (
            <>
              <button className="profile-btn edit-btn" onClick={handleAcceptRequest}>
                Accept Request
              </button>
              <button className="profile-btn archive-btn" onClick={handleDeclineRequest}>
                Decline
              </button>
            </>
          )}
          {requestStatus?.type === 'friends' && (
            <button className="profile-btn edit-btn" disabled style={{ background: '#4caf50', color: 'white' }}>
              Following
            </button>
          )}
          {requestStatus?.type === 'none' && (
            <button className="profile-btn edit-btn" onClick={handleSendRequest}>
              Send Request
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>
          📱 Grid
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'grid' && (
          !canViewContent ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon"></div>
                <p>This account is private</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Follow this account to see their posts
                </p>
              </div>
            </div>
          ) : userBlogs.length === 0 ? (
            <div className="content-grid">
              <div className="content-placeholder">
                <div className="placeholder-icon"></div>
                <p>No blogs yet</p>
              </div>
            </div>
          ) : (
            <div className="content-grid">
              {userBlogs.map((b) => (
                <ProfileBlogCard key={b.id} blog={b} />
              ))}
            </div>
          )
        )}
      </div>

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
                  <div 
                    key={follower.id} 
                    style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => {
                      setShowFollowers(false);
                      navigate(`/user/${follower.id}`);
                    }}
                  >
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
                      {follower.profileImage ? (
                        <img src={follower.profileImage} alt={follower.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>{(follower.username || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{follower.username || follower.fullName || 'User'}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{follower.bio || 'No bio'}</div>
                    </div>
                  </div>
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
                  <div 
                    key={following.id} 
                    style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => {
                      setShowFollowing(false);
                      navigate(`/user/${following.id}`);
                    }}
                  >
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {showStoryViewer && userStories.length > 0 && (
        <div className="story-viewer-modal" onClick={handleCloseStoryViewer} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="story-viewer-content" onClick={(e) => e.stopPropagation()} style={{
            position: 'relative',
            width: '90%',
            maxWidth: '400px',
            height: '80vh',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10
            }}>
              <button 
                onClick={handleCloseStoryViewer}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img 
                src={userStories[currentStoryIndex]?.image} 
                alt="Story" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain' 
                }} 
              />
              <button 
                onClick={handlePrevStory} 
                disabled={currentStoryIndex === 0}
                style={{
                  position: 'absolute',
                  left: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: 'white',
                  fontSize: '32px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: currentStoryIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentStoryIndex === 0 ? 0.3 : 1
                }}
              >
                ‹
              </button>
              <button 
                onClick={handleNextStory}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: 'white',
                  fontSize: '32px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                ›
              </button>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              gap: '4px'
            }}>
              {userStories.map((_, index) => (
                <div 
                  key={index}
                  style={{
                    flex: 1,
                    height: '3px',
                    background: index === currentStoryIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Blog Card Component
function ProfileBlogCard({ blog }) {
  const navigate = useNavigate();
  const cleanContent = blog.content.replace(/<[^>]*>?/gm, '');
  const displayContent = cleanContent.length > 140 ? cleanContent.slice(0, 140) + '…' : cleanContent;

  return (
    <div style={{ background: '#ffe6f0', border: '1px solid #ffc1dd', borderRadius: 12, padding: 12, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, paddingRight: '20px', color: '#c2185b' }}>{blog.title}</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{new Date(blog.createdAt).toLocaleDateString()}</div>
      <div style={{ fontSize: 14, marginBottom: 12, color: '#555', flexGrow: 1 }}>{displayContent}</div>
      <button className="blog-readmore" onClick={() => navigate(`/blog/${blog.id}`)}>Read more</button>
    </div>
  );
}

export default UserProfile;