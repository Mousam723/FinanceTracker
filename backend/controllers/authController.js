// backend/controllers/authController.js
const User = require('../models/User'); // New: Import the Mongoose User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // New: Find user by username using Mongoose
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // New: Create a new user document
        const newUser = new User({ username, password });
        await newUser.save(); // New: Save the user to the database

        // New: The user ID is now accessible as newUser._id
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login User
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // New: Find user by username using Mongoose
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // The password comparison logic remains the same
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // New: Generate JWT token using the MongoDB user ID
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Logged in successfully' });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};