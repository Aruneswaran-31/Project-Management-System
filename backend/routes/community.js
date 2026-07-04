const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Get all posts with comments count
router.get('/posts', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar,
      (SELECT COUNT(*) FROM community_comments WHERE post_id = p.id) as comment_count
    FROM community_posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
  `).all();
  res.json(posts);
});

// Get single post with comments
router.get('/posts/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM community_posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?
  `).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comments = db.prepare(`
    SELECT c.*, u.name as author_name, u.avatar as author_avatar
    FROM community_comments c JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ? ORDER BY c.created_at ASC
  `).all(req.params.id);

  res.json({ ...post, comments });
});

// Create post
router.post('/posts', (req, res) => {
  const { content, image_url } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const result = db.prepare('INSERT INTO community_posts (user_id, content, image_url) VALUES (?, ?, ?)')
    .run(req.user.id, content, image_url || null);

  res.status(201).json({ id: result.lastInsertRowid, content, image_url });
});

// Delete post
router.delete('/posts/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM community_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  db.prepare('DELETE FROM community_posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post deleted' });
});

// Add comment
router.post('/posts/:id/comments', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const result = db.prepare('INSERT INTO community_comments (post_id, user_id, content) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, content);

  res.status(201).json({ id: result.lastInsertRowid, content });
});

module.exports = router;
