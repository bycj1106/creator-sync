import jwt from 'jsonwebtoken';

const getJWT_SECRET = () => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return JWT_SECRET;
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, getJWT_SECRET());
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
    getJWT_SECRET(),
    { expiresIn: '7d' }
  );
};
