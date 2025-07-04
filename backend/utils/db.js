// backend/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config(); // Ensure dotenv is loaded here too, or rely on server.js loading it first

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {                        // Add SSL configuration, as SkySQL enables SSL/TLS
    rejectUnauthorized: true  // Set to true for production, false for testing if issues arise
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection when this module is loaded
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL pool connected successfully!');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL pool connection error:', err.message);
    console.error('Please check your MySQL server and .env credentials.');
    process.exit(1); // Exit if critical DB connection fails
  }
}

testDbConnection(); // Run the connection test

module.exports = pool; // Export the pool directly