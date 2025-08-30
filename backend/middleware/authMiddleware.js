// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // New: Import the Mongoose User model

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // New: Find the user by ID using Mongoose
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password from the returned user object
            req.userId = req.user.id; // Assign the MongoDB ID

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user no longer exists' });
            }
            next();

        } catch (error) {
            console.error('Auth error:', error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Not authorized, token expired' });
            } else if (error.name === 'JsonWebTokenError') {
                res.status(401).json({ message: 'Not authorized, invalid token' });
            } else {
                res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };