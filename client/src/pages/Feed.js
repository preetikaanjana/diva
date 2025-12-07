import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB, friendRequestDB, storyDB } from '../utils/database';
import './Feed.css';

function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const blogs = useMemo(() => {
    const raw = localStorage.getItem('blogs');
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      return [...parsed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  }, []);

  // Get all users except current user
  const allUsers = useMemo(() => {
    if (!user?.id) return [];
    const users = userDB.getAllUsers();
    return users.filter(u => u.id !== user.id);
  }, [user?.id, refreshKey]);

  // Get pending friend requests for current user
  const pendingRequests = useMemo(() => {
    if (!user?.id) return [];
    return friendRequestDB.getPendingRequestsForUser(user.id);
  }, [user?.id, refreshKey]);

  // Get users who sent requests (with user details)
  const requestSenders = useMemo(() => {
    return pendingRequests.map(req => {
      const sender = userDB.getUserById(req.fromUserId);
      return sender ? { ...sender, requestId: req.id } : null;
    }).filter(Boolean);
  }, [pendingRequests]);

  // Get sent requests
  const sentRequests = useMemo(() => {
    if (!user?.id) return [];
    return friendRequestDB.getRequestsSentByUser(user.id);
  }, [user?.id, refreshKey]);

  // Get friends list (accepted requests)
  const friendsList = useMemo(() => {
    if (!user?.id) return [];
    return friendRequestDB.getFriends(user.id);
  }, [user?.id, refreshKey]);

  // Get users with request status (exclude already accepted/friends)
  const usersWithStatus = useMemo(() => {
    if (!user?.id) return [];
    const sentRequestIds = new Set(sentRequests.map(r => r.toUserId));
    const receivedRequestIds = new Set(pendingRequests.map(r => r.fromUserId));
    const friendsSet = new Set(friendsList);
    
    return allUsers
      .filter(u => !friendsSet.has(u.id)) // Exclude already accepted/friends
      .map(u => {
        let status = 'none';
        let requestId = null;
        
        if (sentRequestIds.has(u.id)) {
          status = 'requested';
          const req = sentRequests.find(r => r.toUserId === u.id);
          requestId = req?.id;
        } else if (receivedRequestIds.has(u.id)) {
          status = 'pending';
          const req = pendingRequests.find(r => r.fromUserId === u.id);
          requestId = req?.id;
        }
        
        return { ...u, requestStatus: status, requestId };
      })
      .slice(0, 10); // Limit to 10 suggestions
  }, [allUsers, sentRequests, pendingRequests, friendsList, refreshKey]);

  const handleSendRequest = (toUserId) => {
    if (!user?.id) return;
    const result = friendRequestDB.sendRequest(user.id, toUserId);
    if (result) {
      setRefreshKey(prev => prev + 1);
      alert('Friend request sent!');
    } else {
      alert('Request already sent or failed to send.');
    }
  };

  const handleAcceptRequest = (requestId) => {
    const result = friendRequestDB.acceptRequest(requestId);
    if (result) {
      setRefreshKey(prev => prev + 1);
      alert('Friend request accepted!');
    }
  };

  const handleDeclineRequest = (requestId) => {
    const result = friendRequestDB.declineRequest(requestId);
    if (result) {
      setRefreshKey(prev => prev + 1);
      alert('Friend request declined.');
    }
  };

  // Archive expired stories on mount
  useEffect(() => {
    storyDB.archiveExpiredStories();
    // Check every hour for expired stories
    const interval = setInterval(() => {
      storyDB.archiveExpiredStories();
      setRefreshKey(prev => prev + 1);
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, []);

  // Get current user's stories
  const myStories = useMemo(() => {
    if (!user?.id) return [];
    try {
      const allActiveStories = storyDB.getActiveStories();
      return allActiveStories
        .filter(story => story.userId === user.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch {
      return [];
    }
  }, [user?.id, refreshKey]);

  // Get all active stories from everyone (excluding current user)
  const feedStories = useMemo(() => {
    if (!user?.id) return [];
    try {
      // Get active stories (not expired)
      const allActiveStories = storyDB.getActiveStories();
      
      // Get friends list
      const friends = friendRequestDB.getFriends(user.id);
      // Include only friends' stories (not own)
      const relevantUserIds = friends;
      
      // Filter stories from friends, sort by timestamp (newest first)
      const filtered = allActiveStories
        .filter(story => relevantUserIds.includes(story.userId))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Get user details for each story and group by user
      const storiesByUser = {};
      filtered.forEach(story => {
        const storyUser = userDB.getUserById(story.userId);
        if (storyUser) {
          if (!storiesByUser[story.userId]) {
            storiesByUser[story.userId] = {
              user: storyUser,
              stories: []
            };
          }
          storiesByUser[story.userId].stories.push(story);
        }
      });
      
      // Convert to array format
      return Object.values(storiesByUser).map(userStories => ({
        ...userStories,
        latestStory: userStories.stories[0] // Most recent story
      }));
    } catch {
      return [];
    }
  }, [user?.id, refreshKey]);

  const handleAddStory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          // Create an image element to load the file
          const img = new Image();
          img.onload = () => {
            // Create a canvas to resize the image
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500; // Limit width to 500px
            const scaleSize = MAX_WIDTH / img.width;
            
            // Calculate new dimensions
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            // Draw image on canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Compress to JPEG at 60% quality
            // This converts a 3MB image to ~50KB
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);

            const storyData = {
              id: Date.now().toString(),
              image: compressedDataUrl, // Saving the compressed version
              timestamp: new Date().toISOString(),
              userId: user.id
            };
            
            try {
              storyDB.createStory(storyData);
              setRefreshKey(prev => prev + 1);
              alert('Story uploaded! It will be visible for 24 hours.');
            } catch (error) {
              console.error(error);
              alert('Storage is full! Please clear data or delete old stories.');
            }
          };
          img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  

  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [viewingStories, setViewingStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const handleStoryClick = (storyUserId, stories) => {
    if (storyUserId === user?.id) {
      // Show own stories in viewer
      setViewingStories(myStories);
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
    } else {
      // Show other user's stories in viewer
      setViewingStories(stories || []);
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
    }
  };

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false);
    setViewingStories([]);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < viewingStories.length - 1) {
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

  // Search users by username
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const allUsersList = userDB.getAllUsers();
    return allUsersList
      .filter(u => 
        u.id !== user?.id && 
        (u.username?.toLowerCase().includes(query) || 
         u.fullName?.toLowerCase().includes(query))
      )
      .slice(0, 10);
  }, [searchQuery, user?.id]);

  const handleUsernameClick = (userId) => {
    if (userId === user?.id) {
      navigate('/profile');
    } else {
      navigate(`/user/${userId}`);
    }
  };

  return (
    <div className="feed-layout">
      <div className="feed-main">
        {/* Search Bar */}
        <div style={{ 
          marginBottom: '20px', 
          position: 'relative',
          maxWidth: '600px',
          margin: '0 auto 20px auto'
        }}>
          <input
            type="text"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 0);
            }}
            onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              border: '2px solid #ff80ab',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px'
          }}>🔍</span>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ff80ab',
              borderRadius: '12px',
              marginTop: '8px',
              maxHeight: '400px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100
            }}>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUsernameClick(result.id);
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleUsernameClick(result.id);
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff0f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
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
                    {result.profileImage ? (
                      <img 
                        src={result.profileImage} 
                        alt={result.username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{(result.username || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{result.username || result.fullName || 'User'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{result.fullName || result.bio || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ff80ab',
              borderRadius: '12px',
              marginTop: '8px',
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100
            }}>
              No users found
            </div>
          )}
        </div>

        {/* STORIES SECTION START */}
        <div className="stories-bar">
          {/* 1. Your Story Circle */}
          <div className="story" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Avatar Container: Click handles Add or View Story */}
            <div 
              className="story-avatar" 
              onClick={() => myStories.length > 0 ? handleStoryClick(user.id, myStories) : handleAddStory()}
              style={{ 
                border: myStories.length > 0 ? '2px solid #e91e63' : '2px solid #ddd',
                cursor: 'pointer',
                position: 'relative' 
              }}
            >
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.username}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span>{(user?.username || 'U').charAt(0).toUpperCase()}</span>
              )}

              {/* + Button */}
              {myStories.length === 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: '0px', 
                  right: '0px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#e91e63',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  lineHeight: '18px',
                  border: '2px solid white',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  +
                </div>
              )}
            </div>

            {/* Username: Click redirects to your profile */}
            <div 
              className="story-name" 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/profile');
              }}
              style={{ cursor: 'pointer', marginTop: '5px' }}
            >
              Your Story
            </div>
          </div>

          {/* 2. Other Users' Stories */}
          {feedStories.map((userStories) => (
            <div 
              className="story" 
              key={userStories.user.id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Avatar: CLICK TO VIEW STORY */}
              <div 
                className="story-avatar" 
                onClick={() => handleStoryClick(userStories.user.id, userStories.stories)}
                style={{ border: '2px solid #e91e63', cursor: 'pointer' }}
              >
                {userStories.user.profileImage ? (
                  <img 
                    src={userStories.user.profileImage} 
                    alt={userStories.user.username}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  (userStories.user.username || 'U').charAt(0).toUpperCase()
                )}
              </div>

              {/* Username: CLICK TO GO TO ACCOUNT */}
              <div 
                className="story-name"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/${userStories.user.id}`);
                }}
                style={{ cursor: 'pointer', marginTop: '5px' }}
              >
                {userStories.user.username || userStories.user.fullName || 'User'}
              </div>
            </div>
          ))}

          {feedStories.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666', marginLeft: '20px' }}>
              No stories from your network yet
            </div>
          )}
        </div>
        {/* STORIES SECTION END */}

        <div className="feed-list">
          {blogs.length === 0 ? (
            <div className="empty-feed">No recent posts. Create your first blog!</div>
          ) : (
            blogs.map((post) => (
              <div className="feed-card" key={post.id}>
                <div className="feed-card-header">
                  <div className="avatar">{(post.author || 'U').charAt(0).toUpperCase()}</div>
                  <div className="meta">
                    <div 
                      className="author" 
                      style={{ cursor: 'pointer', fontWeight: '600' }}
                      onClick={() => {
                        const postUser = userDB.getAllUsers().find(u => u.username === post.author || u.id === post.userId);
                        if (postUser) {
                          handleUsernameClick(postUser.id);
                        }
                      }}
                    >
                      {post.author || 'User'}
                    </div>
                    <div className="time">{new Date(post.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <h3 className="feed-title">{post.title}</h3>
                <p className="feed-content">
                  {post.content.length > 200 ? (
                    <>
                      {post.content.slice(0, 200)}… <button className="blog-readmore" onClick={() => navigate(`/blog/${post.id}`)}>Read more</button>
                    </>
                  ) : post.content}
                </p>
                <div className="feed-tags">
                  {post.tags?.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <aside className="feed-right">
        {/* Pending Friend Requests */}
        {requestSenders.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="suggestions-title">Friend Requests</div>
            <div className="suggestions">
              {requestSenders.map((sender) => (
                <div className="suggestion-card" key={sender.id}>
                  <div className="s-avatar">
                    {sender.profileImage ? (
                      <img src={sender.profileImage} alt={sender.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      (sender.username || sender.fullName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="s-body">
                    <div className="s-name">{sender.username || sender.fullName || 'User'}</div>
                    <div className="s-bio">{sender.bio || 'New user'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                    <button 
                      className="follow-btn" 
                      onClick={() => handleAcceptRequest(sender.requestId)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleDeclineRequest(sender.requestId)}
                      style={{ 
                        fontSize: '12px', 
                        padding: '5px 10px', 
                        background: '#ffebee', 
                        color: '#c62828', 
                        border: '1px solid #c62828',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Users Suggestions */}
        {usersWithStatus.length > 0 && (
          <div>
            <div className="suggestions-title">Suggestions for you</div>
            <div className="suggestions">
              {usersWithStatus.map((s) => (
                <div className="suggestion-card" key={s.id}>
                  <div 
                    className="s-avatar" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/user/${s.id}`)}
                  >
                    {s.profileImage ? (
                      <img src={s.profileImage} alt={s.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      (s.username || s.fullName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div 
                    className="s-body"
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => navigate(`/user/${s.id}`)}
                  >
                    <div className="s-name">{s.username || s.fullName || 'User'}</div>
                    <div className="s-bio">{s.bio || 'New user'}</div>
                  </div>
                  {s.requestStatus === 'requested' ? (
                    <button 
                      className="follow-btn" 
                      disabled
                      style={{ background: '#ccc', cursor: 'not-allowed' }}
                    >
                      Requested
                    </button>
                  ) : s.requestStatus === 'pending' ? (
                    <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                      <button 
                        className="follow-btn" 
                        onClick={() => handleAcceptRequest(s.requestId)}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleDeclineRequest(s.requestId)}
                        style={{ 
                          fontSize: '12px', 
                          padding: '5px 10px', 
                          background: '#ffebee', 
                          color: '#c62828', 
                          border: '1px solid #c62828',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="follow-btn" 
                      onClick={() => handleSendRequest(s.id)}
                    >
                      Send Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {usersWithStatus.length === 0 && requestSenders.length === 0 && (
          <div>
            <div className="suggestions-title">Suggestions for you</div>
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No new users to suggest at the moment.
            </div>
          </div>
        )}
      </aside>

      {/* Story Viewer Modal */}
      {showStoryViewer && viewingStories.length > 0 && (
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
                src={viewingStories[currentStoryIndex]?.image} 
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
              {viewingStories.map((_, index) => (
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
}

export default Feed;