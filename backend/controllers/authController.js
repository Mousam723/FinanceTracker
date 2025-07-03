const User = require('../models/User'); // Import the new User model functions
const bcrypt = require('bcryptjs'); // Needed for password hashing and comparison
const jwt = require('jsonwebtoken'); // Assuming you use JWT for auth

// Register User
exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if user already exists
        const existingUser = await User.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash the password BEFORE saving to MySQL
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create the user using the model function
        const newUserResult = await User.createUser(username, hashedPassword);
        // You might want to get the actual user ID from newUserResult.insertId
        const newUserId = newUserResult.insertId;

        res.status(201).json({ message: 'User registered successfully', userId: newUserId });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login User
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find user by username
        const user = await User.findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Logged in successfully' });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};