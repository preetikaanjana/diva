const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET all posts
router.get('/posts', async (req, res) => {
  try {
    // TODO: Implement fetching posts (maybe with sorting and pagination)
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new post
router.post('/posts', async (req, res) => {
  const { title, content, author, tags } = req.body;

  const post = new Post({
    title,
    content,
    author,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Assuming comma-separated tags
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET a single post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    // TODO: Implement fetching a single post and potentially populate comments
    const post = await Post.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a comment on a post
router.post('/posts/:postId/comments', async (req, res) => {
  const { content, author } = req.body;
  const postId = req.params.postId;

  const comment = new Comment({
    content,
    author,
    post: postId,
  });

  try {
    // TODO: Implement saving the comment and potentially updating the post to include the comment reference
    const newComment = await comment.save();
    // Optionally, find the post and push the comment ID to its comments array
    // const post = await Post.findById(postId);
    // post.comments.push(newComment._id);
    // await post.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// TODO: Add routes for updating and deleting posts/comments

module.exports = router; 