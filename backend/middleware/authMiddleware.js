const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import your new MySQL-based User model functions

const protect = async (req, res, next) => { // Made async because we might fetch user from DB
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("JWT_SECRET from .env:", process.env.JWT_SECRET); // Good for debugging env var loading

      // Verify the token
      // The `decoded` object will contain the payload you put into the token
      // When you create the token (e.g., in authController.js login), ensure you use `user.id` (MySQL's INT ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- Important Change for MySQL ---
      // Instead of directly using decoded.id as req.user or req.userId,
      // it's good practice to fetch the user from the database
      // to ensure the user still exists and is active.
      // Assuming your User model has a findUserById function
      req.user = await User.findUserById(decoded.id); // decoded.id should be the MySQL user's integer ID

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }

      // Assign the user's ID to req.userId (common practice for controllers)
      req.userId = req.user.id;

      next(); // Proceed to the next middleware/route handler

    } catch (error) {
      console.error('Auth error:', error);
      // Specific error messages for common JWT issues
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