import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
const httpServer = createServer(app);

const CORS_ORIGIN = import.meta.env?.CORS_ORIGIN || '*';

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

io.on('connection', (socket) => {
  console.warn('Client connected:', socket.id);

  const authTimeout = setTimeout(() => {
    if (!socket.userId) {
      console.warn('Socket authentication timeout, disconnecting:', socket.id);
      socket.disconnect(true);
    }
  }, 10000);

  socket.on('authenticate', async (token) => {
    clearTimeout(authTimeout);
    try {
      const jwt = await import('jsonwebtoken');
      const { getJWT_SECRET } = await import('./middleware/auth.js');
      const secret = getJWT_SECRET();
      const decoded = jwt.default.verify(token, secret);
      socket.userId = decoded.userId;
      socket.join(`user_${decoded.userId}`);
      console.warn(`User ${decoded.username} authenticated`);
    } catch {
      console.warn('Socket authentication failed, disconnecting:', socket.id);
      socket.disconnect(true);
    }
  });

  socket.on('disconnect', () => {
    clearTimeout(authTimeout);
    console.warn('Client disconnected:', socket.id);
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.warn(`Server running on http://localhost:${PORT}`);
});
