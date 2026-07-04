const express = require('express');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// List all users (for assigning tasks / adding members) - any authenticated user
router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, avatar FROM users ORDER BY name').all();
  res.json(users);
});

// Admin: delete a user
router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// Admin: change a user's role
router.put('/:id/role', requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Role updated' });
});

// Admin dashboard stats
router.get('/stats/overview', requireAdmin, (req, res) => {
  const stats = {
    total_users: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    total_projects: db.prepare('SELECT COUNT(*) as c FROM projects').get().c,
    total_tasks: db.prepare('SELECT COUNT(*) as c FROM tasks').get().c,
    completed_tasks: db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'done'").get().c,
    active_projects: db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'active'").get().c,
  };
  res.json(stats);
});

module.exports = router;
