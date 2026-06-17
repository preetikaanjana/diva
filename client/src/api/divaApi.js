/**
 * Production (single server): leave REACT_APP_API_URL unset → requests go to /api on the same origin (HTTPS via host).
 * Local dev: use client/.env.development with REACT_APP_API_URL=http://localhost:4000, or rely on package.json "proxy".
 */
function apiBaseUrl() {
  const raw = process.env.REACT_APP_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return `${String(raw).replace(/\/$/, '')}/api`;
  }
  return '/api';
}

const BASE = apiBaseUrl();

const TOKEN_KEY = 'diva_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, skipAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = skipAuth ? null : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function authRegister(payload) {
  return request('/auth/register', { method: 'POST', body: payload, skipAuth: true });
}

export async function authLogin(identifier, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { identifier, password },
    skipAuth: true
  });
}

export async function authMe() {
  return request('/auth/me');
}

export async function listUsers() {
  return request('/users', { skipAuth: true });
}

export async function getUser(id) {
  return request(`/users/${id}`, { skipAuth: true });
}

export async function getUserBlogs(userId) {
  return request(`/users/${userId}/blogs`);
}

export async function getFollowers(userId) {
  return request(`/users/${userId}/followers`, { skipAuth: true });
}

export async function getFollowing(userId) {
  return request(`/users/${userId}/following`, { skipAuth: true });
}

export async function updateMe(patch) {
  return request('/users/me', { method: 'PATCH', body: patch });
}

export async function changePassword(currentPassword, newPassword) {
  return request('/users/me/password', {
    method: 'POST',
    body: { currentPassword, newPassword }
  });
}

export async function updatePrivacy(isPrivate) {
  return request('/users/me/privacy', { method: 'PATCH', body: { isPrivate } });
}

export async function getSavedBlogs() {
  return request('/users/me/saved-blogs');
}

export async function getLikedBlogs() {
  return request('/users/me/liked-blogs');
}

export async function toggleSavedBlog(blogId) {
  return request(`/users/me/saved-blogs/${blogId}`, { method: 'POST' });
}

export async function listPublishedBlogs() {
  return request('/blogs');
}

export async function listDrafts() {
  return request('/blogs/drafts');
}

export async function getBlog(id) {
  return request(`/blogs/${id}`);
}

export async function createBlog(blog) {
  return request('/blogs', { method: 'POST', body: blog });
}

export async function updateBlog(id, patch) {
  return request(`/blogs/${id}`, { method: 'PATCH', body: patch });
}

export async function deleteBlog(id) {
  return request(`/blogs/${id}`, { method: 'DELETE' });
}

export async function toggleBlogLike(blogId) {
  return request(`/blogs/${blogId}/like`, { method: 'POST' });
}

export async function listQuestions() {
  return request('/questions', { skipAuth: true });
}

export async function getQuestion(id) {
  return request(`/questions/${id}`, { skipAuth: true });
}

export async function createQuestion(payload) {
  return request('/questions', { method: 'POST', body: payload });
}

export async function addReply(questionId, text) {
  return request(`/questions/${questionId}/replies`, { method: 'POST', body: { text } });
}

export async function followsIncoming() {
  return request('/follows/incoming');
}

export async function followsSent() {
  return request('/follows/sent');
}

export async function followsFriends() {
  return request('/follows/friends');
}

export async function followSend(toUserId) {
  return request('/follows', { method: 'POST', body: { toUserId } });
}

export async function followAccept(requestId) {
  return request(`/follows/${requestId}/accept`, { method: 'POST' });
}

export async function followDecline(requestId) {
  return request(`/follows/${requestId}/decline`, { method: 'POST' });
}

export async function followCancel(requestId) {
  return request(`/follows/${requestId}`, { method: 'DELETE' });
}

export async function followUnfollow(targetUserId) {
  return request('/follows/unfollow', { method: 'POST', body: { targetUserId } });
}

export async function followRemoveFollower(followerId) {
  return request('/follows/remove-follower', { method: 'POST', body: { followerId } });
}

export async function storiesActive() {
  return request('/stories/active', { skipAuth: true });
}

export async function createStory(image) {
  return request('/stories', { method: 'POST', body: { image } });
}

export async function deleteStory(storyId) {
  return request(`/stories/${storyId}`, { method: 'DELETE' });
}

export async function healthCheck() {
  return request('/health', { skipAuth: true });
}

export async function authForgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuth: true
  });
}

export async function authVerifyResetCode(email, token) {
  return request('/auth/verify-reset-code', {
    method: 'POST',
    body: { email, token },
    skipAuth: true
  });
}

export async function authResetPassword(email, token, newPassword) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: { email, token, newPassword },
    skipAuth: true
  });
}
