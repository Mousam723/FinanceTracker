// models/User.js
const pool = require('../utils/db'); // Assuming 'config/db' now, adjust if you kept 'utils/db'

// This file does NOT need bcrypt, as hashing is done in the controller.
// const bcrypt = require('bcryptjs'); // <--- REMOVE THIS LINE, NOT NEEDED HERE

// The createUsersTable function will now correctly access 'pool'
async function createUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    try {
        await pool.execute(createTableQuery);
        console.log('✅ Users table ensured to exist in MySQL.');
    } catch (error) {
        console.error('❌ Error ensuring users table:', error);
        process.exit(1);
    }
}
createUsersTable(); // Call this when the module loads

/**
 * Finds a user by their username.
 * @param {string} username The username to find.
 * @returns {object | null} The user object (id, username, password) if found, otherwise null.
 */
async function findUserByUsername(username) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );
        return rows[0] || null; // Return the first row or null if not found
    } catch (error) {
        console.error('Error in findUserByUsername:', error);
        throw error; // Re-throw to be caught by the controller's try-catch
    }
}

/**
 * Creates a new user in the database.
 * The password should already be hashed by the controller.
 * @param {string} username The username for the new user.
 * @param {string} hashedPassword The bcrypt hashed password.
 * @returns {object} An object containing insertId on success.
 */
async function createUser(username, hashedPassword) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        // `result` here will contain properties like `insertId`, `affectedRows`
        return { insertId: result.insertId }; // Returns the ID of the newly inserted user
    } catch (error) {
        console.error('Error in createUser:', error);
        throw error; // Re-throw to be caught by the controller's try-catch
    }
}

/**
 * Finds a user by their ID.
 * @param {number} id The user ID to find.
 * @returns {object | null} The user object (id, username) if found, otherwise null.
 */
async function findUserById(id) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, username FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error in findUserById:', error);
        throw error; // Re-throw to be caught by the middleware's try-catch
    }
}

module.exports = {
    findUserByUsername,
    createUser,
    findUserById,
};