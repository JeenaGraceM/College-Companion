const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT tokens in Authorization header
 * Usage: app.get('/protected', authMiddleware, handler)
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Expecting header format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dummySecret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded; // attach user data to request
    next();
  });
}

module.exports = authMiddleware;
