const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("✅ Loaded JWT_SECRET:", process.env.JWT_SECRET);
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl requests, Postman)
        // or if the origin is in our allowedOrigins list.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow common HTTP methods, including PATCH
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers to be sent by the client
    credentials: true, // This is essential if you're using cookies or session-based authentication
    optionsSuccessStatus: 200 // For older browsers (IE11, various SmartTVs)
};


app.use(cors(corsOptions));
app.use(express.json());


app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.stack);
    res.status(500).send('Something broke!');
});


// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
.then(() => console.log('✅ Connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes); // if using expenses
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Backend is working fine!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
