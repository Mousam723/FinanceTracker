// backend/server.js
console.log('Test log from server.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("✅ Loaded JWT_SECRET:", process.env.JWT_SECRET);
const pool = require('./utils/db');
const express = require('express');
const cors = require('cors');

// --- Import the MySQL pool from the new db.js file ---
 // Adjust path if you put db.js elsewhere

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');


const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // OR if the origin is in our allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// No need for a separate connection test here since db.js does it
// and handles exiting if connection fails.

app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Your API routes
// The middleware and controllers will now import 'pool' from the new db.js
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);


app.get('/', (req, res) => {
    res.send('Backend is working fine!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// We no longer need to export pool here because other modules get it from db.js
// module.exports.pool = pool;