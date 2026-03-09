import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env?.JWT_SECRET || 'creator-sync-secret-key-2024';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch {
    return res.status(401).json({ error: '无效的令牌' });
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export { JWT_SECRET };
