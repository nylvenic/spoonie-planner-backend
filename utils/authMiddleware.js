const jwt = require('jsonwebtoken');

// Middleware to authenticate and verify the JWT
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided or invalid token format.' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token.' });
        }
        req.user = decoded; // Assuming the decoded token includes user information
        next();
    });
};