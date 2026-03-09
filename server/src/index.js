import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('authenticate', async (token) => {
    try {
      const jwt = await import('jsonwebtoken');
      const { JWT_SECRET } = await import('./middleware/auth.js');
      const decoded = jwt.default.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.join(`user_${decoded.userId}`);
      console.log(`User ${decoded.username} authenticated`);
    } catch {
      console.log('Socket authentication failed');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
