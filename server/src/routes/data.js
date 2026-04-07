import express from 'express';
import { getDb } from '../models/db.js';
import { authenticate } from '../middleware/auth.js';
import {
  toInspirationRecord,
  toInspirationResponse,
  toPlanRecord,
  toPlanResponse,
  toTaskRecord,
  toTaskResponse,
  validateInspirationInput,
  validatePlanInput,
  validateTaskInput,
} from './data-helpers.js';

const router = express.Router();

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
    plans: plans.map(toPlanResponse),
    tasks: tasks.map(toTaskResponse),
    inspirations: inspirations.map(toInspirationResponse),
  });
});

router.post('/plans', (req, res) => {
  const errors = validatePlanInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const planRecord = toPlanRecord(req.body, now);
  
  db.prepare(`
    INSERT INTO plans (id, userId, title, startDate, endDate, progress, platforms, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    planRecord.id,
    req.userId,
    planRecord.title,
    planRecord.startDate,
    planRecord.endDate,
    planRecord.progress,
    planRecord.platforms,
    planRecord.status,
    planRecord.createdAt,
    planRecord.updatedAt
  );

  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planRecord.id);
  const response = toPlanResponse(plan);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'plan', 
    action: 'create', 
    data: response,
    userId: req.userId 
  });

  res.json(response);
});

router.put('/plans/:id', (req, res) => {
  const errors = validatePlanInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id, createdAt FROM plans WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '规划不存在或无权访问' });
  }
  
  const now = new Date().toISOString();
  const planRecord = toPlanRecord({ ...req.body, id, createdAt: existing.createdAt }, now);
  
  db.prepare(`
    UPDATE plans SET title = ?, startDate = ?, endDate = ?, progress = ?, 
    platforms = ?, status = ?, updatedAt = ? 
    WHERE id = ? AND userId = ?
  `).run(
    planRecord.title,
    planRecord.startDate,
    planRecord.endDate,
    planRecord.progress,
    planRecord.platforms,
    planRecord.status,
    planRecord.updatedAt,
    id,
    req.userId
  );

  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  const response = toPlanResponse(plan);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'plan', 
    action: 'update', 
    data: response,
    userId: req.userId 
  });

  res.json(response);
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
  const now = new Date().toISOString();
  const taskRecord = toTaskRecord(req.body, now);
  
  db.prepare(`
    INSERT INTO tasks (id, userId, title, category, completed, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    taskRecord.id,
    req.userId,
    taskRecord.title,
    taskRecord.category,
    taskRecord.completed,
    taskRecord.createdAt,
    taskRecord.updatedAt
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskRecord.id);
  const response = toTaskResponse(task);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'task', 
    action: 'create', 
    data: response,
    userId: req.userId 
  });

  res.json(response);
});

router.put('/tasks/:id', (req, res) => {
  const errors = validateTaskInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id, createdAt FROM tasks WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '任务不存在或无权访问' });
  }
  
  const now = new Date().toISOString();
  const taskRecord = toTaskRecord({ ...req.body, id, createdAt: existing.createdAt }, now);
  
  db.prepare(`
    UPDATE tasks SET title = ?, category = ?, completed = ?, updatedAt = ? 
    WHERE id = ? AND userId = ?
  `).run(taskRecord.title, taskRecord.category, taskRecord.completed, taskRecord.updatedAt, id, req.userId);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  const response = toTaskResponse(task);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'task', 
    action: 'update', 
    data: response,
    userId: req.userId 
  });

  res.json(response);
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
  const now = new Date().toISOString();
  const inspirationRecord = toInspirationRecord(req.body, now);
  
  db.prepare(`
    INSERT INTO inspirations (id, userId, content, tags, pinned, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    inspirationRecord.id,
    req.userId,
    inspirationRecord.content,
    inspirationRecord.tags,
    inspirationRecord.pinned,
    inspirationRecord.createdAt,
    inspirationRecord.updatedAt
  );

  const inspiration = db.prepare('SELECT * FROM inspirations WHERE id = ?').get(inspirationRecord.id);
  const response = toInspirationResponse(inspiration);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'inspiration', 
    action: 'create', 
    data: response,
    userId: req.userId 
  });

  res.json(response);
});

router.put('/inspirations/:id', (req, res) => {
  const errors = validateInspirationInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const db = getDb();
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id, createdAt FROM inspirations WHERE id = ? AND userId = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: '灵感不存在或无权访问' });
  }
  
  const now = new Date().toISOString();
  const inspirationRecord = toInspirationRecord({ ...req.body, id, createdAt: existing.createdAt }, now);
  
  db.prepare(`
    UPDATE inspirations SET content = ?, tags = ?, pinned = ?, updatedAt = ? 
    WHERE id = ? AND userId = ?
  `).run(
    inspirationRecord.content,
    inspirationRecord.tags,
    inspirationRecord.pinned,
    inspirationRecord.updatedAt,
    id,
    req.userId
  );

  const inspiration = db.prepare('SELECT * FROM inspirations WHERE id = ?').get(id);
  const response = toInspirationResponse(inspiration);
  
  req.io.to(`user_${req.userId}`).emit('dataChange', { 
    type: 'inspiration', 
    action: 'update', 
    data: response,
    userId: req.userId 
  });

  res.json(response);
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
