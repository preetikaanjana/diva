require('dotenv').config({ path: require('path').join(__dirname, '.env') });
// Bypass SSL leaf certificate validation for local proxy/firewall compatibility
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./models/User');
const Blog = require('./models/Blog');
const Question = require('./models/Question');
const FriendRequest = require('./models/FriendRequest');
const Story = require('./models/Story');
const { connectDb } = require('./db');
const nodemailer = require('nodemailer');

// Initialize Nodemailer Transporter using Gmail service
let transporter = null;
if (process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password') {
  // Strip any spaces from the App Password string for safety
  const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, '');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'preetikaanjana@gmail.com',
      pass: cleanPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 8000,
    socketTimeout: 8000,
    greetingTimeout: 8000
  });
}

const sendEmail = async ({ to, subject, text, html }) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER || 'preetikaanjana@gmail.com';

  if (brevoKey) {
    console.log(`[EMAIL] Attempting to send email via Brevo HTTP API to ${to}...`);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Diva Support',
          email: senderEmail
        },
        to: [{ email: to }],
        subject: subject,
        textContent: text,
        htmlContent: html
      })
    });

    const resText = await response.text();
    if (!response.ok) {
      throw new Error(`Brevo HTTP API error: ${response.status} - ${resText}`);
    }
    console.log(`[EMAIL] Sent successfully via Brevo HTTP API to ${to}`);
    try {
      return JSON.parse(resText);
    } catch {
      return { raw: resText };
    }
  } else if (transporter) {
    console.log(`[EMAIL] Attempting to send email via SMTP (Nodemailer) to ${to}...`);
    const info = await transporter.sendMail({
      from: `"Diva Website" <${senderEmail}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`[EMAIL] Sent successfully via SMTP to ${to}`);
    return info;
  } else {
    console.log(`[EMAIL] No email service configured. Simulation code for ${to}: ${text}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email service is not configured. Configure BREVO_API_KEY or EMAIL_PASS/EMAIL_USER.');
    }
  }
};

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 4000;
const DEV_SECRET_FALLBACK = 'diva-local-dev-change-for-production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : DEV_SECRET_FALLBACK);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (isProduction) {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(
      'FATAL: Set JWT_SECRET in production (at least 32 random characters). Example: openssl rand -base64 48'
    );
    process.exit(1);
  }
  if (JWT_SECRET === DEV_SECRET_FALLBACK) {
    console.error('FATAL: Do not use the development JWT_SECRET in production.');
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1);

const clientOrigin = process.env.CLIENT_ORIGIN;
if (isProduction && clientOrigin) {
  app.use(
    cors({
      origin: clientOrigin.replace(/\/$/, ''),
      credentials: true
    })
  );
} else {
  app.use(cors({ origin: true, credentials: true }));
}

app.use(express.json({ limit: '20mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

function publicUser(u, { includePhone = false } = {}) {
  if (!u) return null;
  const raw = typeof u.toObject === 'function' ? u.toObject() : u;
  const { passwordHash, phone, ...rest } = raw;
  const out = { ...rest };
  if (includePhone) out.phone = phone;
  return out;
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function tokenFor(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeChatHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 1000)
    }));
}

async function generateAiChatReply(message, history = []) {
  if (!OPENAI_API_KEY) {
    return { ok: false, error: 'AI provider key not configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.5,
        messages: [
          {
            role: 'system',
            content:
              'You are Sakhi, a supportive assistant for women safety, legal awareness, mental wellbeing, and career growth. Be practical, concise, and empathetic. Do not provide dangerous or illegal advice.'
          },
          ...sanitizeChatHistory(history),
          { role: 'user', content: String(message || '') }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const reason = data?.error?.message || `Provider error ${response.status}`;
      return { ok: false, error: reason };
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return { ok: false, error: 'Empty response from provider' };
    }
    return { ok: true, reply: content.trim() };
  } catch (error) {
    return { ok: false, error: error.name === 'AbortError' ? 'AI request timed out' : 'AI request failed' };
  } finally {
    clearTimeout(timeout);
  }
}

async function recalcFollowCountsForUsers(...ids) {
  const set = [...new Set(ids.filter(Boolean))];
  for (const id of set) {
    const followers = await FriendRequest.countDocuments({ toUserId: id, status: 'accepted' });
    const following = await FriendRequest.countDocuments({ fromUserId: id, status: 'accepted' });
    await User.updateOne({ id }, { $set: { followers, following } });
  }
}

async function recalcPosts(userId) {
  const posts = await Blog.countDocuments({ userId, isDraft: false });
  await User.updateOne({ id: userId }, { $set: { posts } });
}

function normalizeBlog(b, currentUserId) {
  if (!b) return null;
  const raw = typeof b.toObject === 'function' ? b.toObject() : b;
  const likedUserIds = raw.likedUserIds || [];
  const likes = likedUserIds.length;
  const out = { ...raw, likes };
  delete out.likedUserIds;
  if (currentUserId) {
    out.likedByMe = likedUserIds.includes(currentUserId);
  }
  return out;
}

function decorateBlog(b, currentUserId, savedBlogIds = []) {
  const n = normalizeBlog(b, currentUserId);
  if (currentUserId) {
    n.savedByMe = savedBlogIds.includes(b.id);
  }
  return n;
}

async function optionalUserIdFromAuth(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    return payload.userId;
  } catch {
    return null;
  }
}

// --- Auth ---
function isPasswordStrong(pw) {
  if (pw.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(pw);
  const hasLowerCase = /[a-z]/.test(pw);
  const hasNumbers = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecial;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone, city, bio } = req.body;

    if (!username?.trim() || !email?.trim() || !password || !fullName?.trim()) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }
    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    const emailNorm = email.trim().toLowerCase();
    const userNorm = username.trim();

    const dupEmail = await User.findOne({ email: emailNorm }).lean();
    if (dupEmail) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    const dupUser = await User.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(userNorm)}$`, 'i') }
    }).lean();
    if (dupUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const id = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const newUser = {
      id,
      username: userNorm,
      email: emailNorm,
      passwordHash,
      fullName: fullName.trim(),
      phone: (phone || '').trim(),
      city: (city || '').trim(),
      bio: (bio || '').trim() || 'New to Diva — nice to meet you!',
      followers: 0,
      following: 0,
      posts: 0,
      profileImage: null,
      isPrivate: false,
      savedBlogIds: [],
      createdAt: now,
      updatedAt: now
    };
    await User.create(newUser);
    res.json({ user: publicUser(newUser, { includePhone: true }), token: tokenFor(id) });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const raw = (identifier || '').trim();
    if (!raw || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const lower = raw.toLowerCase();
    let user = await User.findOne({ email: lower }).lean();
    if (!user) {
      user = await User.findOne({
        username: { $regex: new RegExp(`^${escapeRegex(raw)}$`, 'i') }
      }).lean();
    }

    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    res.json({ user: publicUser(user, { includePhone: true }), token: tokenFor(user.id) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const u = await User.findOne({ id: req.userId }).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(publicUser(u, { includePhone: true }));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailNorm = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // Generate a 6-digit verification code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    console.log(`[PASSWORD RESET] Verification code for ${emailNorm}: ${token}`);

    // Send the verification code to the user's email via Nodemailer/Brevo if configured
    try {
      await sendEmail({
        to: emailNorm,
        subject: 'Diva Support - Password Reset Code',
        text: `Your Diva account password reset verification code is: ${token}. Please enter this code on the reset page.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff5f8; border-radius: 12px; border: 1px solid #ff69b4; max-width: 500px;">
            <h2 style="color: #e91e63; text-align: center;">Diva Security</h2>
            <p>You requested a password reset for your Diva account. Please use the following 6-digit verification code to complete the process:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #c2185b; background-color: #fff; padding: 12px 24px; border-radius: 8px; border: 1px solid #f48fb1; display: inline-block;">${token}</span>
            </div>
            <p style="color: #666; font-size: 13px;">This code is valid for 1 hour. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('Failed to send email:', mailError);
      // Roll back the token on error
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ error: `Email delivery failed: ${mailError.message || mailError}` });
    }

    res.json({
      message: 'A password reset verification code has been generated and sent to your email.'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Forgot password request failed' });
  }
});

app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: token.trim(),
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Code verification failed' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// --- AI Chat ---
app.post('/api/chat/message', async (req, res) => {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = req.body?.history;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = await generateAiChatReply(message, history);
    if (!ai.ok) {
      return res.status(503).json({ error: ai.error || 'AI service unavailable' });
    }
    return res.json({ reply: ai.reply });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// --- Users ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const list = users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      profileImage: u.profileImage,
      bio: u.bio,
      city: u.city,
      followers: u.followers,
      following: u.following,
      posts: u.posts,
      isPrivate: !!u.isPrivate
    }));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list users' });
  }
});

app.get('/api/users/:id/blogs', async (req, res) => {
  try {
    const currentUserId = await optionalUserIdFromAuth(req);
    let savedBlogIds = [];
    if (currentUserId) {
      const me = await User.findOne({ id: currentUserId }).lean();
      savedBlogIds = me?.savedBlogIds || [];
    }
    const u = await User.findOne({ id: req.params.id }).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    const blogs = await Blog.find({ userId: req.params.id, isDraft: false })
      .sort({ createdAt: -1 })
      .lean();
    const list = blogs.map((b) => decorateBlog(b, currentUserId, savedBlogIds));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load blogs' });
  }
});

app.get('/api/users/:id/followers', async (req, res) => {
  try {
    const reqs = await FriendRequest.find({
      status: 'accepted',
      toUserId: req.params.id
    }).lean();
    const ids = reqs.map((r) => r.fromUserId);
    const users = await User.find({ id: { $in: ids } }).lean();
    const byId = new Map(users.map((x) => [x.id, x]));
    const out = ids.map((uid) => publicUser(byId.get(uid), { includePhone: false })).filter(Boolean);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load followers' });
  }
});

app.get('/api/users/:id/following', async (req, res) => {
  try {
    const reqs = await FriendRequest.find({
      status: 'accepted',
      fromUserId: req.params.id
    }).lean();
    const ids = reqs.map((r) => r.toUserId);
    const users = await User.find({ id: { $in: ids } }).lean();
    const byId = new Map(users.map((x) => [x.id, x]));
    const out = ids.map((uid) => publicUser(byId.get(uid), { includePhone: false })).filter(Boolean);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load following' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const u = await User.findOne({ id: req.params.id }).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(publicUser(u, { includePhone: false }));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load user' });
  }
});

app.patch('/api/users/me', requireAuth, async (req, res) => {
  try {
    const { username, fullName, email, bio, phone, city, profileImage } = req.body;
    const u = await User.findOne({ id: req.userId });
    if (!u) return res.status(404).json({ error: 'User not found' });

    if (email !== undefined) {
      const emailNorm = String(email).trim().toLowerCase();
      const taken = await User.findOne({ email: emailNorm, id: { $ne: u.id } }).lean();
      if (taken) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      u.email = emailNorm;
    }
    if (username !== undefined) {
      const un = String(username).trim();
      const taken = await User.findOne({
        id: { $ne: u.id },
        username: { $regex: new RegExp(`^${escapeRegex(un)}$`, 'i') }
      }).lean();
      if (taken) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      u.username = un;
    }
    if (fullName !== undefined) u.fullName = String(fullName).trim();
    if (bio !== undefined) u.bio = String(bio).trim();
    if (phone !== undefined) u.phone = String(phone).trim();
    if (city !== undefined) u.city = String(city).trim();
    if (profileImage !== undefined) u.profileImage = profileImage;
    u.updatedAt = new Date().toISOString();
    await u.save();
    res.json(publicUser(u.toObject(), { includePhone: true }));
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/users/me', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const u = await User.findOne({ id: req.userId });
    if (!u) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(password, u.passwordHash)) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const userId = u.id;

    // Cascade delete user data
    await Blog.deleteMany({ userId });
    await Story.deleteMany({ userId });
    await Question.deleteMany({ userId });
    await Question.updateMany({}, { $pull: { replies: { userId } } });
    await FriendRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    });
    await User.deleteOne({ id: userId });

    res.json({ ok: true, message: 'Account deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

app.post('/api/users/me/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const u = await User.findOne({ id: req.userId });
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (!bcrypt.compareSync(currentPassword, u.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    u.passwordHash = bcrypt.hashSync(newPassword, 10);
    u.updatedAt = new Date().toISOString();
    await u.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Password update failed' });
  }
});

app.patch('/api/users/me/privacy', requireAuth, async (req, res) => {
  try {
    const { isPrivate } = req.body;
    const u = await User.findOne({ id: req.userId });
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.isPrivate = !!isPrivate;
    u.updatedAt = new Date().toISOString();
    await u.save();
    res.json(publicUser(u.toObject(), { includePhone: true }));
  } catch (e) {
    res.status(500).json({ error: 'Failed to update privacy' });
  }
});

app.get('/api/users/me/saved-blogs', requireAuth, async (req, res) => {
  try {
    const u = await User.findOne({ id: req.userId }).lean();
    if (!u) return res.json([]);
    const ids = u.savedBlogIds || [];
    if (ids.length === 0) return res.json([]);
    const blogs = await Blog.find({ id: { $in: ids }, isDraft: false }).lean();
    const byId = new Map(blogs.map((b) => [b.id, b]));
    const ordered = ids.map((bid) => byId.get(bid)).filter(Boolean);
    const list = ordered.map((b) => decorateBlog(b, req.userId, ids));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load saved blogs' });
  }
});

app.get('/api/users/me/liked-blogs', requireAuth, async (req, res) => {
  try {
    const u = await User.findOne({ id: req.userId }).lean();
    const savedBlogIds = u?.savedBlogIds || [];
    const blogs = await Blog.find({
      isDraft: false,
      likedUserIds: req.userId
    })
      .sort({ createdAt: -1 })
      .lean();
    const list = blogs.map((b) => decorateBlog(b, req.userId, savedBlogIds));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load liked blogs' });
  }
});

app.post('/api/users/me/saved-blogs/:blogId', requireAuth, async (req, res) => {
  try {
    const { blogId } = req.params;
    const u = await User.findOne({ id: req.userId });
    const b = await Blog.findOne({ id: String(blogId) }).lean();
    if (!u || !b || b.isDraft) {
      return res.status(404).json({ error: 'Not found' });
    }
    u.savedBlogIds = u.savedBlogIds || [];
    const i = u.savedBlogIds.indexOf(b.id);
    if (i >= 0) {
      u.savedBlogIds.splice(i, 1);
      await u.save();
      return res.json({ saved: false });
    }
    u.savedBlogIds.push(b.id);
    await u.save();
    res.json({ saved: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

// --- Blogs ---
app.get('/api/blogs', async (req, res) => {
  try {
    const currentUserId = await optionalUserIdFromAuth(req);
    let savedBlogIds = [];
    if (currentUserId) {
      const u = await User.findOne({ id: currentUserId }).lean();
      savedBlogIds = u?.savedBlogIds || [];
    }
    const blogs = await Blog.find({ isDraft: false }).sort({ createdAt: -1 }).lean();
    const list = blogs.map((b) => decorateBlog(b, currentUserId, savedBlogIds));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load blogs' });
  }
});

app.get('/api/blogs/drafts', requireAuth, async (req, res) => {
  try {
    const u = await User.findOne({ id: req.userId }).lean();
    const savedBlogIds = u?.savedBlogIds || [];
    const blogs = await Blog.find({ userId: req.userId, isDraft: true })
      .sort({ updatedAt: -1 })
      .lean();
    const list = blogs.map((b) => decorateBlog(b, req.userId, savedBlogIds));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load drafts' });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const currentUserId = await optionalUserIdFromAuth(req);
    let savedBlogIds = [];
    if (currentUserId) {
      const u = await User.findOne({ id: currentUserId }).lean();
      savedBlogIds = u?.savedBlogIds || [];
    }
    const b = await Blog.findOne({ id: String(req.params.id) }).lean();
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.isDraft && b.userId !== currentUserId) {
      return res.status(404).json({ error: 'Not found' });
    }
    const blog = decorateBlog(b, currentUserId, savedBlogIds);
    res.json(blog);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load blog' });
  }
});

app.post('/api/blogs', requireAuth, async (req, res) => {
  try {
    const u = await User.findOne({ id: req.userId }).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });

    const {
      id: clientId,
      title,
      content,
      tags,
      coverImage,
      isDraft,
      createdAt: clientCreated
    } = req.body;

    const now = new Date().toISOString();
    const newBlog = {
      id: clientId || crypto.randomUUID(),
      userId: req.userId,
      author: u.username,
      title: title || '',
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      coverImage: coverImage || null,
      isDraft: !!isDraft,
      createdAt: clientCreated || now,
      updatedAt: now,
      likedUserIds: []
    };
    await Blog.create(newBlog);
    await recalcPosts(req.userId);
    const decorated = decorateBlog(newBlog, req.userId, u.savedBlogIds || []);
    res.status(201).json(decorated);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Blog id already exists' });
    }
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

app.patch('/api/blogs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const b = await Blog.findOne({ id: String(id) });
    if (!b || b.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, content, tags, coverImage, isDraft } = req.body;
    if (title !== undefined) b.title = title;
    if (content !== undefined) b.content = content;
    if (tags !== undefined) b.tags = Array.isArray(tags) ? tags : b.tags;
    if (coverImage !== undefined) b.coverImage = coverImage;
    if (typeof isDraft === 'boolean') b.isDraft = isDraft;
    b.likedUserIds = b.likedUserIds || [];
    b.updatedAt = new Date().toISOString();
    await b.save();
    await recalcPosts(req.userId);
    const u = await User.findOne({ id: req.userId }).lean();
    const decorated = decorateBlog(b.toObject(), req.userId, u?.savedBlogIds || []);
    res.json(decorated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

app.delete('/api/blogs/:id', requireAuth, async (req, res) => {
  try {
    const b = await Blog.findOne({ id: String(req.params.id) });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    await Blog.deleteOne({ id: b.id });
    await User.updateMany({ savedBlogIds: b.id }, { $pull: { savedBlogIds: b.id } });
    await recalcPosts(req.userId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.post('/api/blogs/:id/like', requireAuth, async (req, res) => {
  try {
    const b = await Blog.findOne({ id: String(req.params.id) });
    if (!b || b.isDraft) return res.status(404).json({ error: 'Not found' });
    b.likedUserIds = b.likedUserIds || [];
    const idx = b.likedUserIds.indexOf(req.userId);
    if (idx >= 0) {
      b.likedUserIds.splice(idx, 1);
    } else {
      b.likedUserIds.push(req.userId);
    }
    await b.save();
    res.json({
      likes: b.likedUserIds.length,
      likedByMe: idx < 0
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to like' });
  }
});

// --- Questions ---
app.get('/api/questions', async (req, res) => {
  try {
    const list = await Question.find({}).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const q = await Question.findOne({ id: String(req.params.id) }).lean();
    if (!q) return res.status(404).json({ error: 'Not found' });
    res.json(q);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load question' });
  }
});

app.post('/api/questions', requireAuth, async (req, res) => {
  try {
    const { title, category, details } = req.body;
    if (!title?.trim() || !details?.trim()) {
      return res.status(400).json({ error: 'Title and details required' });
    }
    const u = await User.findOne({ id: req.userId }).lean();
    const now = new Date().toISOString();
    const newQ = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category: category || 'General',
      details: details.trim(),
      author: u?.username || 'User',
      userId: req.userId,
      createdAt: now,
      updatedAt: now,
      replies: [],
      likes: 0
    };
    await Question.create(newQ);
    res.status(201).json(newQ);
  } catch (e) {
    res.status(500).json({ error: 'Failed to post question' });
  }
});

app.post('/api/questions/:id/replies', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Reply text required' });
    }
    const q = await Question.findOne({ id: String(req.params.id) });
    if (!q) return res.status(404).json({ error: 'Not found' });
    const u = await User.findOne({ id: req.userId }).lean();
    const reply = {
      id: crypto.randomUUID(),
      text: text.trim(),
      author: u?.username || 'User',
      userId: req.userId,
      createdAt: new Date().toISOString()
    };
    q.replies = q.replies || [];
    q.replies.push(reply);
    q.updatedAt = new Date().toISOString();
    await q.save();
    res.json(q.toObject());
  } catch (e) {
    res.status(500).json({ error: 'Failed to reply' });
  }
});

// --- Follows (friend requests) ---
app.get('/api/follows/incoming', requireAuth, async (req, res) => {
  try {
    const list = await FriendRequest.find({
      toUserId: req.userId,
      status: 'pending'
    }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/follows/sent', requireAuth, async (req, res) => {
  try {
    const list = await FriendRequest.find({
      fromUserId: req.userId,
      status: 'pending'
    }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/follows/friends', requireAuth, async (req, res) => {
  try {
    const accepted = await FriendRequest.find({ status: 'accepted' }).lean();
    const set = new Set();
    accepted.forEach((r) => {
      if (r.fromUserId === req.userId) set.add(r.toUserId);
      if (r.toUserId === req.userId) set.add(r.fromUserId);
    });
    res.json([...set]);
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/follows', requireAuth, async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId || toUserId === req.userId) {
      return res.status(400).json({ error: 'Invalid target' });
    }
    const target = await User.findOne({ id: toUserId }).lean();
    if (!target) return res.status(404).json({ error: 'User not found' });

    const exists = await FriendRequest.findOne({
      status: 'pending',
      $or: [
        { fromUserId: req.userId, toUserId },
        { fromUserId: toUserId, toUserId: req.userId }
      ]
    }).lean();
    if (exists) {
      return res.status(400).json({ error: 'Request already exists or connected' });
    }
    const accepted = await FriendRequest.findOne({
      status: 'accepted',
      $or: [
        { fromUserId: req.userId, toUserId },
        { fromUserId: toUserId, toUserId: req.userId }
      ]
    }).lean();
    if (accepted) {
      return res.status(400).json({ error: 'Request already exists or connected' });
    }

    const fr = {
      id: crypto.randomUUID(),
      fromUserId: req.userId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await FriendRequest.create(fr);
    res.status(201).json(fr);
  } catch (e) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

app.post('/api/follows/:id/accept', requireAuth, async (req, res) => {
  try {
    const r = await FriendRequest.findOne({ id: req.params.id });
    if (!r || r.toUserId !== req.userId || r.status !== 'pending') {
      return res.status(404).json({ error: 'Not found' });
    }
    r.status = 'accepted';
    r.acceptedAt = new Date().toISOString();
    await r.save();
    await recalcFollowCountsForUsers(r.fromUserId, r.toUserId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/follows/:id/decline', requireAuth, async (req, res) => {
  try {
    const r = await FriendRequest.findOne({ id: req.params.id });
    if (!r || r.toUserId !== req.userId || r.status !== 'pending') {
      return res.status(404).json({ error: 'Not found' });
    }
    r.status = 'declined';
    r.declinedAt = new Date().toISOString();
    await r.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/api/follows/:id', requireAuth, async (req, res) => {
  try {
    const r = await FriendRequest.findOne({ id: req.params.id });
    if (!r || r.fromUserId !== req.userId || r.status !== 'pending') {
      return res.status(404).json({ error: 'Not found' });
    }
    await FriendRequest.deleteOne({ id: r.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/follows/unfollow', requireAuth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const del = await FriendRequest.findOneAndDelete({
      status: 'accepted',
      fromUserId: req.userId,
      toUserId: targetUserId
    });
    if (!del) return res.status(404).json({ error: 'Not connected' });
    await recalcFollowCountsForUsers(del.fromUserId, del.toUserId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/follows/remove-follower', requireAuth, async (req, res) => {
  try {
    const { followerId } = req.body;
    const del = await FriendRequest.findOneAndDelete({
      status: 'accepted',
      fromUserId: followerId,
      toUserId: req.userId
    });
    if (!del) return res.status(404).json({ error: 'Not found' });
    await recalcFollowCountsForUsers(del.fromUserId, del.toUserId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

// --- Stories (24h window) ---
const DAY_MS = 24 * 60 * 60 * 1000;

function activeStoriesList(stories) {
  const now = Date.now();
  return stories.filter((s) => {
    const t = new Date(s.timestamp || s.createdAt).getTime();
    return now - t < DAY_MS;
  });
}

app.get('/api/stories/active', async (req, res) => {
  try {
    const all = await Story.find({}).lean();
    const active = activeStoriesList(all).sort(
      (a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
    );
    res.json(active);
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/stories', requireAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });
    const now = new Date().toISOString();
    const s = {
      id: crypto.randomUUID(),
      userId: req.userId,
      image,
      timestamp: now,
      createdAt: now
    };
    await Story.create(s);
    res.status(201).json(s);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create story' });
  }
});

app.delete('/api/stories/:id', requireAuth, async (req, res) => {
  try {
    const s = await Story.findOne({ id: req.params.id });
    if (!s) return res.status(404).json({ error: 'Not found' });
    if (s.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    await Story.deleteOne({ id: s.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'diva-api', db: 'mongodb' });
});

app.get('/api/health/email', async (req, res) => {
  try {
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey) {
      console.log('[DIAGNOSTICS] Testing Brevo HTTP API connection...');
      const response = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(400).json({
          ok: false,
          service: 'brevo',
          error: `Brevo API returned status ${response.status}`,
          details: data
        });
      }
      return res.json({
        ok: true,
        service: 'brevo',
        message: 'Brevo API connection verified successfully.',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });
    }

    if (!transporter) {
      return res.status(400).json({
        ok: false,
        error: 'Neither BREVO_API_KEY nor Nodemailer SMTP transporter is initialized. Check environment variables.'
      });
    }
    // Verify connection configuration
    await transporter.verify();
    res.json({
      ok: true,
      service: 'smtp',
      message: 'Nodemailer connection is verified successfully.',
      configuredUser: process.env.EMAIL_USER || 'preetikaanjana@gmail.com'
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || 'Verification failed',
      code: err.code,
      command: err.command,
      response: err.response
    });
  }
});

const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
const hasClientBuild = fs.existsSync(path.join(clientBuildPath, 'index.html'));

if (isProduction && hasClientBuild) {
  app.use(express.static(clientBuildPath, { index: false }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else if (isProduction && !hasClientBuild) {
  console.warn(
    'Warning: NODE_ENV=production but client/build not found. Run `npm run build` in client/ (or use root `npm run build:app`).'
  );
}

connectDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      const mode = isProduction ? 'production' : 'development';
      console.log(`Diva server (${mode}) listening on port ${PORT}`);
      if (isProduction && hasClientBuild) {
        console.log('Serving React app from client/build');
      }
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
