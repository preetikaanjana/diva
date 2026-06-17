import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import './Profile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
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

  const [profileUser, setProfileUser] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [sentOutgoing, setSentOutgoing] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setProfileLoading(true);
    (async () => {
      try {
        const u = await api.getUser(userId);
        if (cancelled) return;
        setProfileUser(u);

        let blogs = [], allStories = [], followers = [], following = [];
        
        await Promise.all([
          api.getUserBlogs(userId).then(res => blogs = res).catch(e => console.error('Failed to get user blogs:', e)),
          api.storiesActive().then(res => allStories = res).catch(e => console.error('Failed to get active stories:', e)),
          api.getFollowers(userId).then(res => followers = res).catch(e => console.error('Failed to get followers:', e)),
          api.getFollowing(userId).then(res => following = res).catch(e => console.error('Failed to get following:', e))
        ]);

        if (cancelled) return;
        setUserBlogs(Array.isArray(blogs) ? blogs : []);
        const storiesForUser = (Array.isArray(allStories) ? allStories : [])
          .filter((s) => s.userId === userId)
          .sort(
            (a, b) =>
              new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
          );
        setUserStories(storiesForUser);
        setFollowersList(Array.isArray(followers) ? followers : []);
        setFollowingList(Array.isArray(following) ? following : []);

        if (currentUser?.id && currentUser.id !== userId) {
          let sent = [], inc = [], friends = [];
          
          await Promise.all([
            api.followsSent().then(res => sent = res).catch(e => console.error('Failed to get sent requests:', e)),
            api.followsIncoming().then(res => inc = res).catch(e => console.error('Failed to get incoming requests:', e)),
            api.followsFriends().then(res => friends = res).catch(e => console.error('Failed to get friends:', e))
          ]);

          if (!cancelled) {
            setSentOutgoing(Array.isArray(sent) ? sent : []);
            setPendingIncoming(Array.isArray(inc) ? inc : []);
            setFriendIds(Array.isArray(friends) ? friends : []);
          }
        } else if (!cancelled) {
          setSentOutgoing([]);
          setPendingIncoming([]);
          setFriendIds([]);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setProfileUser(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey, currentUser?.id]);

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

  const isFollowing = useMemo(() => {
    if (!currentUser?.id || !profileUser?.id) return false;
    return friendIds.includes(profileUser.id);
  }, [currentUser?.id, profileUser?.id, friendIds]);

  // Check if profile is private and user can view
  const canViewContent = useMemo(() => {
    if (!profileUser) return false;
    // If account is public, everyone can view
    if (!profileUser.isPrivate) return true;
    // If account is private, only followers can view
    return isFollowing;
  }, [profileUser, isFollowing]);

  const requestStatus = useMemo(() => {
    if (!currentUser?.id || !profileUser?.id || currentUser.id === profileUser.id) return null;
    if (friendIds.includes(profileUser.id)) return { type: 'friends' };
    const sentReq = sentOutgoing.find((r) => r.toUserId === profileUser.id);
    if (sentReq) return { type: 'sent', requestId: sentReq.id };
    const receivedReq = pendingIncoming.find((r) => r.fromUserId === profileUser.id);
    if (receivedReq) return { type: 'received', requestId: receivedReq.id };
    return { type: 'none' };
  }, [currentUser?.id, profileUser?.id, friendIds, sentOutgoing, pendingIncoming]);

  const handleSendRequest = async () => {
    if (!currentUser?.id || !profileUser?.id) return;
    try {
      await api.followSend(profileUser.id);
      setRefreshKey((prev) => prev + 1);
      alert('Friend request sent!');
    } catch {
      alert('Could not send request.');
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestStatus?.requestId) return;
    try {
      await api.followAccept(requestStatus.requestId);
      setRefreshKey((prev) => prev + 1);
      alert('Friend request accepted!');
    } catch {
      alert('Could not accept.');
    }
  };

  const handleDeclineRequest = async () => {
    if (!requestStatus?.requestId) return;
    try {
      await api.followDecline(requestStatus.requestId);
      setRefreshKey((prev) => prev + 1);
    } catch {
      /* ignore */
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser?.id || !profileUser?.id) return;
    if (!window.confirm('Unfollow this user? They will be removed from your following list.')) return;
    try {
      await api.followUnfollow(profileUser.id);
      const fresh = await api.authMe();
      updateUser(fresh);
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Could not unfollow.');
    }
  };

  if (profileLoading) {
    return <div className="blog-detail-loading">Loading profile…</div>;
  }

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
              <div className="profile-fullname">{profileUser?.fullName || profileUser?.username || 'Full name'}</div>
              <div className="profile-handle">@{profileUser?.username || 'username'}</div>
              {profileUser?.city && (
                <div className="profile-meta-line">📍 {profileUser.city}</div>
              )}
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
            <button type="button" className="profile-btn archive-btn" onClick={handleUnfollow}>
              Unfollow
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
  const cleanContent = (blog.content || '').replace(/<[^>]*>?/gm, '');
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