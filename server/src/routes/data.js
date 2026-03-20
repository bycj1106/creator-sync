import express from 'express';
import { getDb } from '../models/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const parseJSON = (str, defaultValue = null) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

router.use(authenticate);

router.get('/', (req, res) => {
  const db = getDb();
  
  const plans = db.prepare(
    'SELECT * FROM plans WHERE userId = ? ORDER BY createdAt DESC'
  ).all(req.userId);
  
  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC'
  ).all(req.userId);
  
  const inspirations = db.prepare(
    'SELECT * FROM inspirations WHERE userId = ? ORDER BY createdAt DESC'
  ).all(req.userId);

  res.json({
    plans: plans.map(p => ({
      ...p,
      platforms: parseJSON(p.platforms, [])
    })),
    tasks: tasks.map(t => ({
      ...t,
      completed: Boolean(t.completed)
    })),
    inspirations: inspirations.map(i => ({
      ...i,
      pinned: Boolean(i.pinned),
      tags: parseJSON(i.tags, [])
    }))
  });
});

const validatePlanInput = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('标题不能为空');
  }
  if (data.title && data.title.length > 200) {
    errors.push('标题不能超过200字符');
  }
  return errors;
};

const validateTaskInput = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('标题不能为空');
  }
  if (data.title && data.title.length > 200) {
    errors.push('标题不能超过200字符');
  }
  return errors;
};

const validateInspirationInput = (data) => {
  const errors = [];
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    errors.push('内容不能为空');
  }
  if (data.content && data.content.length > 5000) {
    errors.push('内容不能超过5000字符');
  }
  return errors;
};

router.post('/plans', (req, res) => {
  const errors = validatePlanInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const { id, title, startDate, endDate, progress, platforms, status } = req.body;
  
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO plans (id, userId, title, startDate, endDate, progress, platforms, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.userId, title, startDate, endDate, progress || '创意', 
         platforms ? JSON.stringify(platforms) : '[]', status || 'pending', now, now);

  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'plan', 
    action: 'create', 
    data: { 
      ...plan, 
      platforms: parseJSON(plan.platforms, []) 
    },
    userId: req.userId 
  });

  res.json({ ...plan, platforms: parseJSON(plan.platforms, []) });
});

router.put('/plans/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { title, startDate, endDate, progress, platforms, status } = req.body;
  
  const existing = db.prepare('SELECT id FROM plans WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '规划不存在或无权访问' });
  }
  
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE plans SET title = ?, startDate = ?, endDate = ?, progress = ?, 
    platforms = ?, status = ?, updatedAt = ? 
    WHERE id = ? AND userId = ?
  `).run(title, startDate, endDate, progress, platforms ? JSON.stringify(platforms) : '[]',
         status, now, id, req.userId);

  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'plan', 
    action: 'update', 
    data: { 
      ...plan, 
      platforms: parseJSON(plan.platforms, []) 
    },
    userId: req.userId 
  });

  res.json({ ...plan, platforms: parseJSON(plan.platforms, []) });
});

router.delete('/plans/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id FROM plans WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '规划不存在或无权访问' });
  }
  
  db.prepare('DELETE FROM plans WHERE id = ? AND userId = ?').run(id, req.userId);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'plan', 
    action: 'delete', 
    data: { id },
    userId: req.userId 
  });

  res.json({ success: true });
});

router.post('/tasks', (req, res) => {
  const errors = validateTaskInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const { id, title, category } = req.body;
  
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO tasks (id, userId, title, category, completed, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(id, req.userId, title, category || 'core', now, now);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'task', 
    action: 'create', 
    data: { ...task, completed: false },
    userId: req.userId 
  });

  res.json({ ...task, completed: false });
});

router.put('/tasks/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { title, category, completed } = req.body;
  
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '任务不存在或无权访问' });
  }
  
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE tasks SET title = ?, category = ?, completed = ?, updatedAt = ? 
    WHERE id = ? AND userId = ?
  `).run(title, category, completed ? 1 : 0, now, id, req.userId);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'task', 
    action: 'update', 
    data: { ...task, completed: Boolean(task.completed) },
    userId: req.userId 
  });

  res.json({ ...task, completed: Boolean(task.completed) });
});

router.delete('/tasks/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '任务不存在或无权访问' });
  }
  
  db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?').run(id, req.userId);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'task', 
    action: 'delete', 
    data: { id },
    userId: req.userId 
  });

  res.json({ success: true });
});

router.post('/inspirations', (req, res) => {
  const errors = validateInspirationInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const { id, content, tags } = req.body;
  
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO inspirations (id, userId, content, tags, pinned, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(id, req.userId, content, tags ? JSON.stringify(tags) : '[]', now, now);

  const inspiration = db.prepare('SELECT * FROM inspirations WHERE id = ?').get(id);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'inspiration', 
    action: 'create', 
    data: { 
      ...inspiration, 
      pinned: false, 
      tags: parseJSON(inspiration.tags, []) 
    },
    userId: req.userId 
  });

  res.json({ ...inspiration, pinned: false, tags: parseJSON(inspiration.tags, []) });
});

router.put('/inspirations/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { content, tags, pinned } = req.body;
  
  const existing = db.prepare('SELECT id FROM inspirations WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '灵感不存在或无权访问' });
  }
  
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE inspirations SET content = ?, tags = ?, pinned = ?, updatedAt = ? 
    WHERE id = ? AND userId = ?
  `).run(content, tags ? JSON.stringify(tags) : '[]', pinned ? 1 : 0, now, id, req.userId);

  const inspiration = db.prepare('SELECT * FROM inspirations WHERE id = ?').get(id);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'inspiration', 
    action: 'update', 
    data: { 
      ...inspiration, 
      pinned: Boolean(inspiration.pinned), 
      tags: parseJSON(inspiration.tags, []) 
    },
    userId: req.userId 
  });

  res.json({ 
    ...inspiration, 
    pinned: Boolean(inspiration.pinned), 
    tags: parseJSON(inspiration.tags, []) 
  });
});

router.delete('/inspirations/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id FROM inspirations WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '灵感不存在或无权访问' });
  }
  
  db.prepare('DELETE FROM inspirations WHERE id = ? AND userId = ?').run(id, req.userId);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'inspiration', 
    action: 'delete', 
    data: { id },
    userId: req.userId 
  });

  res.json({ success: true });
});

export default router;
