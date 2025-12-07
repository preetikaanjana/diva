// Database utility for localStorage-based storage
// This simulates a database structure for users, blogs, questions, etc.

// User Management
export const userDB = {
  // Get all users
  getAllUsers: () => {
    try {
      const users = localStorage.getItem('users_db');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  },

  // Get user by ID
  getUserById: (id) => {
    const users = userDB.getAllUsers();
    return users.find(u => u.id === id);
  },

  // Get user by email
  getUserByEmail: (email) => {
    const users = userDB.getAllUsers();
    return users.find(u => u.email === email);
  },

  // Get user by username
  getUserByUsername: (username) => {
    const users = userDB.getAllUsers();
    return users.find(u => u.username === username);
  },

  // Create new user
  createUser: (userData) => {
    const users = userDB.getAllUsers();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users_db', JSON.stringify(users));
    return newUser;
  },

  // Update user
  updateUser: (userId, updates) => {
    const users = userDB.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('users_db', JSON.stringify(users));
    return users[index];
  },

  // Verify password (simple comparison - in production, use bcrypt)
  verifyPassword: (email, password) => {
    const user = userDB.getUserByEmail(email);
    if (!user) return null;
    // In a real app, you'd hash and compare. For now, simple comparison
    return user.password === password ? user : null;
  }
};

// Blog Management
export const blogDB = {
  getAllBlogs: () => {
    try {
      const blogs = localStorage.getItem('blogs_db');
      return blogs ? JSON.parse(blogs) : [];
    } catch {
      return [];
    }
  },

  getBlogsByUserId: (userId) => {
    const blogs = blogDB.getAllBlogs();
    return blogs.filter(b => b.userId === userId);
  },

  createBlog: (blogData) => {
    const blogs = blogDB.getAllBlogs();
    const newBlog = {
      ...blogData,
      id: blogData.id || Date.now().toString(),
      createdAt: blogData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    blogs.push(newBlog);
    localStorage.setItem('blogs_db', JSON.stringify(blogs));
    // Also update the old localStorage for backward compatibility
    const oldBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    oldBlogs.push(newBlog);
    localStorage.setItem('blogs', JSON.stringify(oldBlogs));
    return newBlog;
  },

  updateBlog: (blogId, updates) => {
    const blogs = blogDB.getAllBlogs();
    const index = blogs.findIndex(b => b.id === blogId);
    if (index === -1) return null;
    
    blogs[index] = {
      ...blogs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('blogs_db', JSON.stringify(blogs));
    
    // Also update old localStorage
    const oldBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const oldIndex = oldBlogs.findIndex(b => b.id === blogId);
    if (oldIndex !== -1) {
      oldBlogs[oldIndex] = blogs[index];
      localStorage.setItem('blogs', JSON.stringify(oldBlogs));
    }
    
    return blogs[index];
  },

  deleteBlog: (blogId) => {
    const blogs = blogDB.getAllBlogs();
    const filtered = blogs.filter(b => b.id !== blogId);
    localStorage.setItem('blogs_db', JSON.stringify(filtered));
    
    // Also update old localStorage
    const oldBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const filteredOld = oldBlogs.filter(b => b.id !== blogId);
    localStorage.setItem('blogs', JSON.stringify(filteredOld));
    
    return true;
  }
};

// Question Management
export const questionDB = {
  getAllQuestions: () => {
    try {
      const questions = localStorage.getItem('questions_db');
      return questions ? JSON.parse(questions) : [];
    } catch {
      return [];
    }
  },

  getQuestionsByUserId: (userId) => {
    const questions = questionDB.getAllQuestions();
    return questions.filter(q => q.userId === userId);
  },

  createQuestion: (questionData) => {
    const questions = questionDB.getAllQuestions();
    const newQuestion = {
      ...questionData,
      id: questionData.id || Date.now().toString(),
      createdAt: questionData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    questions.push(newQuestion);
    localStorage.setItem('questions_db', JSON.stringify(questions));
    return newQuestion;
  }
};

// Friend Request Management
export const friendRequestDB = {
  // Get all friend requests
  getAllRequests: () => {
    try {
      const requests = localStorage.getItem('friend_requests_db');
      return requests ? JSON.parse(requests) : [];
    } catch {
      return [];
    }
  },

  // Get pending requests for a user (requests sent TO them)
  getPendingRequestsForUser: (userId) => {
    const requests = friendRequestDB.getAllRequests();
    return requests.filter(req => req.toUserId === userId && req.status === 'pending');
  },

  // Get requests sent by a user
  getRequestsSentByUser: (userId) => {
    const requests = friendRequestDB.getAllRequests();
    return requests.filter(req => req.fromUserId === userId && req.status === 'pending');
  },

  // Check if request already exists
  requestExists: (fromUserId, toUserId) => {
    const requests = friendRequestDB.getAllRequests();
    return requests.some(req => 
      ((req.fromUserId === fromUserId && req.toUserId === toUserId) ||
       (req.fromUserId === toUserId && req.toUserId === fromUserId)) &&
      req.status === 'pending'
    );
  },

  // Send friend request
  sendRequest: (fromUserId, toUserId) => {
    if (fromUserId === toUserId) return null; // Can't send request to self
    if (friendRequestDB.requestExists(fromUserId, toUserId)) return null; // Request already exists

    const requests = friendRequestDB.getAllRequests();
    const newRequest = {
      id: Date.now().toString(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    localStorage.setItem('friend_requests_db', JSON.stringify(requests));
    return newRequest;
  },

  // Accept friend request
  acceptRequest: (requestId) => {
    const requests = friendRequestDB.getAllRequests();
    const index = requests.findIndex(req => req.id === requestId);
    if (index === -1) return null;

    requests[index].status = 'accepted';
    requests[index].acceptedAt = new Date().toISOString();
    localStorage.setItem('friend_requests_db', JSON.stringify(requests));

    // Update user's following/followers count
    const request = requests[index];
    const fromUser = userDB.getUserById(request.fromUserId);
    const toUser = userDB.getUserById(request.toUserId);

    if (fromUser) {
      userDB.updateUser(fromUser.id, {
        following: (fromUser.following || 0) + 1
      });
    }
    if (toUser) {
      userDB.updateUser(toUser.id, {
        followers: (toUser.followers || 0) + 1
      });
    }

    return requests[index];
  },

  // Decline friend request
  declineRequest: (requestId) => {
    const requests = friendRequestDB.getAllRequests();
    const index = requests.findIndex(req => req.id === requestId);
    if (index === -1) return null;

    requests[index].status = 'declined';
    requests[index].declinedAt = new Date().toISOString();
    localStorage.setItem('friend_requests_db', JSON.stringify(requests));
    return requests[index];
  },

  // Cancel friend request (by sender)
  cancelRequest: (requestId) => {
    const requests = friendRequestDB.getAllRequests();
    const filtered = requests.filter(req => req.id !== requestId);
    localStorage.setItem('friend_requests_db', JSON.stringify(filtered));
    return true;
  },

  // Get followers list (users who follow this user)
  getFollowers: (userId) => {
    const requests = friendRequestDB.getAllRequests();
    const acceptedRequests = requests.filter(req => 
      req.status === 'accepted' && req.toUserId === userId
    );
    return acceptedRequests.map(req => req.fromUserId);
  },

  // Get following list (users this user follows)
  getFollowing: (userId) => {
    const requests = friendRequestDB.getAllRequests();
    const acceptedRequests = requests.filter(req => 
      req.status === 'accepted' && req.fromUserId === userId
    );
    return acceptedRequests.map(req => req.toUserId);
  },

  // Get all friends (both followers and following)
  getFriends: (userId) => {
    const followers = friendRequestDB.getFollowers(userId);
    const following = friendRequestDB.getFollowing(userId);
    return [...new Set([...followers, ...following])];
  }
};

// Simple password hashing (for demo - use bcrypt in production)
export const hashPassword = (password) => {
  // Simple hash for demo - in production use bcrypt
  return btoa(password); // Base64 encoding (not secure, just for demo)
};

export const comparePassword = (plainPassword, hashedPassword) => {
  return btoa(plainPassword) === hashedPassword;
};

// Story Management with 24-hour expiration
export const storyDB = {
  getAllStories: () => {
    try {
      const stories = localStorage.getItem('stories_db');
      return stories ? JSON.parse(stories) : [];
    } catch {
      return [];
    }
  },

  getActiveStories: () => {
    const stories = storyDB.getAllStories();
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return stories.filter(story => {
      const storyDate = new Date(story.timestamp);
      const age = now - storyDate;
      return age < twentyFourHours;
    });
  },

  getExpiredStories: () => {
    const stories = storyDB.getAllStories();
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return stories.filter(story => {
      const storyDate = new Date(story.timestamp);
      const age = now - storyDate;
      return age >= twentyFourHours;
    });
  },

  createStory: (storyData) => {
    const stories = storyDB.getAllStories();
    const newStory = {
      ...storyData,
      id: storyData.id || Date.now().toString(),
      timestamp: storyData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    stories.push(newStory);
    localStorage.setItem('stories_db', JSON.stringify(stories));
    
    // Also update old localStorage for backward compatibility
    const oldStories = JSON.parse(localStorage.getItem('stories') || '[]');
    oldStories.push(newStory);
    localStorage.setItem('stories', JSON.stringify(oldStories));
    
    return newStory;
  },

  archiveExpiredStories: () => {
    const expiredStories = storyDB.getExpiredStories();
    if (expiredStories.length === 0) return;
    
    // Get archived stories
    const archived = JSON.parse(localStorage.getItem('archived_stories') || '[]');
    expiredStories.forEach(story => {
      story.archivedAt = new Date().toISOString();
      archived.push(story);
    });
    localStorage.setItem('archived_stories', JSON.stringify(archived));
    
    // Remove expired stories from active stories
    const activeStories = storyDB.getActiveStories();
    localStorage.setItem('stories_db', JSON.stringify(activeStories));
    
    // Also update old localStorage
    localStorage.setItem('stories', JSON.stringify(activeStories));
    
    return expiredStories.length;
  },

  deleteStory: (storyId) => {
    const stories = storyDB.getAllStories();
    const filtered = stories.filter(s => s.id !== storyId);
    localStorage.setItem('stories_db', JSON.stringify(filtered));
    
    // Also update old localStorage
    const oldStories = JSON.parse(localStorage.getItem('stories') || '[]');
    const filteredOld = oldStories.filter(s => s.id !== storyId);
    localStorage.setItem('stories', JSON.stringify(filteredOld));
    
    return true;
  }
};

