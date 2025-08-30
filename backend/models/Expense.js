// backend/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required.'],
        min: [0, 'Amount must be a positive number.']
    },
    category: {
        type: String,
        required: [true, 'Category is required.'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required.'],
        default: Date.now
    },
    user: { // New: This links the expense to a User document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;