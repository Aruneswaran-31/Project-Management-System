const express = require('express');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Get all projects (admin sees all, user sees owned + member-of)
router.get('/', (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = db.prepare(`
      SELECT p.*, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      ORDER BY p.created_at DESC
    `).all();
  } else {
    projects = db.prepare(`
      SELECT DISTINCT p.*, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.id, req.user.id);
  }
  res.json(projects);
});

// Get single project with members
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar FROM project_members pm
    JOIN users u ON u.id = pm.user_id WHERE pm.project_id = ?
  `).all(req.params.id);

  res.json({ ...project, members });
});

// Create project
router.post('/', (req, res) => {
  const { name, description, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  const result = db.prepare(
    'INSERT INTO projects (name, description, status, owner_id) VALUES (?, ?, ?, ?)'
  ).run(name, description || '', status || 'active', req.user.id);

  res.status(201).json({ id: result.lastInsertRowid, name, description, status, owner_id: req.user.id });
});

// Update project
router.put('/:id', (req, res) => {
  const { name, description, status } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to edit this project' });
  }

  db.prepare('UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ?')
    .run(name || project.name, description ?? project.description, status || project.status, req.params.id);

  res.json({ message: 'Project updated' });
});

// Delete project
router.delete('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this project' });
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project deleted' });
});

// Add member to project
router.post('/:id/members', (req, res) => {
  const { user_id } = req.body;
  try {
    db.prepare('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)')
      .run(req.params.id, user_id);
    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    res.status(400).json({ error: 'User already a member or invalid data' });
  }
});

// Remove member
router.delete('/:id/members/:userId', (req, res) => {
  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?')
    .run(req.params.id, req.params.userId);
  res.json({ message: 'Member removed' });
});

module.exports = router;
