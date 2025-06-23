const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("✅ Loaded JWT_SECRET:", process.env.JWT_SECRET);
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);



const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
dotenv.config();

const corsOptions = {
    origin: 'http://localhost:3000', // Only allow frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());


app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.stack);
    res.status(500).send('Something broke!');
});


// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/expense_tracker')
.then(() => console.log('✅ Connected to Local MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes); // if using expenses
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('Backend is working fine!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
