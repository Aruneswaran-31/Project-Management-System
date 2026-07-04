const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Get tasks (optionally filtered by project or assigned user)
router.get('/', (req, res) => {
  const { project_id, assigned_to } = req.query;
  let query = `
    SELECT t.*, u.name as assignee_name, p.name as project_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE 1=1
  `;
  const params = [];

  if (project_id) {
    query += ' AND t.project_id = ?';
    params.push(project_id);
  }
  if (assigned_to) {
    query += ' AND t.assigned_to = ?';
    params.push(assigned_to);
  }
  if (req.user.role !== 'admin' && !project_id && !assigned_to) {
    query += ' AND t.assigned_to = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY t.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// Create task
router.post('/', (req, res) => {
  const { project_id, title, description, status, priority, assigned_to, due_date } = req.body;
  if (!project_id || !title) {
    return res.status(400).json({ error: 'project_id and title are required' });
  }

  const result = db.prepare(`
    INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(project_id, title, description || '', status || 'todo', priority || 'medium', assigned_to || null, due_date || null);

  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

// Update task
router.put('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority, assigned_to, due_date } = req.body;
  db.prepare(`
    UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?
    WHERE id = ?
  `).run(
    title ?? task.title,
    description ?? task.description,
    status ?? task.status,
    priority ?? task.priority,
    assigned_to ?? task.assigned_to,
    due_date ?? task.due_date,
    req.params.id
  );

  res.json({ message: 'Task updated' });
});

// Delete task
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
