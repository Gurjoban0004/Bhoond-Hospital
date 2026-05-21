const jwt = require('jsonwebtoken');

// protects routes that need a logged-in user
// client must send: Authorization: Bearer <token>
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        const err = new Error('Access denied. Please log in.');
        err.status = 401;
        return next(err);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        const err = new Error('Invalid or expired session. Please log in again.');
        err.status = 401;
        next(err);
    }
}

module.exports = { requireAuth };
