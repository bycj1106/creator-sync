import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../models/db.js';
import { generateToken } from '../middleware/auth.js';
import { normalizeInvitationCode } from './auth-helpers.js';

const router = express.Router();

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  
  if (now - attempts.firstAttempt > LOCKOUT_TIME) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }
  
  if (attempts.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - (now - attempts.firstAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }
  
  loginAttempts.set(ip, { count: attempts.count + 1, firstAttempt: attempts.firstAttempt });
  return { allowed: true };
}

function clearRateLimit(ip) {
  loginAttempts.delete(ip);
}

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const invitationCode = normalizeInvitationCode(req.body.invitationCode);
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (!invitationCode) {
      return res.status(400).json({ error: '请填写邀请码' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: '用户名只能包含字母、数字和下划线' });
    }

    const db = getDb();
    
    const invite = db.prepare('SELECT * FROM invitation_codes WHERE code = ?').get(invitationCode);
    if (!invite) {
      return res.status(400).json({ error: '邀请码无效' });
    }
    if (invite.usedCount >= invite.maxUses) {
      return res.status(400).json({ error: '邀请码已使用完毕' });
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ error: '邀请码已过期' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const updateInvite = db.prepare('UPDATE invitation_codes SET usedCount = usedCount + 1 WHERE id = ?');

    const transaction = db.transaction(() => {
      const result = insertUser.run(username, hashedPassword);
      updateInvite.run(invite.id);
      return result;
    });

    const result = transaction();

    const user = { id: result.lastInsertRowid, username };
    const token = generateToken(user);

    res.json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: `登录尝试次数过多，请 ${rateLimit.remainingTime} 秒后重试` 
      });
    }
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    clearRateLimit(clientIp);
    const token = generateToken(user);
    
    res.json({
      user: { id: user.id, username: user.username },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.post('/admin/generate-invite', async (req, res) => {
  try {
    const { maxUses = 1, expiresInDays = 30 } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: '未授权' });
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: '服务器配置错误' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ error: '无效的令牌' });
    }

    const db = getDb();
    const adminUser = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: '仅管理员可执行此操作' });
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const result = db.prepare(
      'INSERT INTO invitation_codes (code, maxUses, expiresAt) VALUES (?, ?, ?)'
    ).run(code, maxUses, expiresAt.toISOString());

    res.json({ 
      code, 
      maxUses, 
      expiresAt: expiresAt.toISOString(),
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ error: '生成邀请码失败' });
  }
});

export default router;
