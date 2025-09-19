const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'dummySecret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token is not valid' });
        }   
        req.user = decoded;
        next();
    });

}

module.exports = authMiddleware;