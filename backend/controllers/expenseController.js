// backend/controllers/expenseController.js
const Expense = require('../models/Expense'); // New: Import the Mongoose Expense model
const mongoose = require('mongoose');

const addExpense = async (req, res) => {
    const { title, amount, category, date } = req.body;
    const userId = req.userId;
    console.log("Backend (expenseController.js - addExpense): Received date:", date);

    try {
        // New: Create a new expense document using the Mongoose model
        const newExpense = new Expense({
            title,
            amount,
            category,
            date,
            user: userId // Assign the MongoDB user ID
        });
        const expense = await newExpense.save(); // Save the new document
        console.log('Backend: Expense added successfully:', expense);

        res.status(201).json({
            message: 'Expense added successfully',
            expenseId: expense._id,
            userId,
            title,
            amount,
            category,
            date: expense.date // Use the date from the saved document
        });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Server error while adding expense. Please check backend logs for details.' });
    }
};

const deleteExpense = async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.userId;

    try {
        // New: Find and delete the expense document by ID and user ID
        const result = await Expense.deleteOne({
            _id: expenseId,
            user: userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Expense not found or you are not authorized to delete it.' });
        }
        console.log(`Backend: Expense ID ${expenseId} deleted successfully.`);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error while deleting expense. Please check backend logs for details.' });
    }
};

const getExpenses = async (req, res) => {
    const userId = req.userId;

    try {
        // New: Find all expenses for a specific user, sorted by date
        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        console.log('Backend: Expenses fetched successfully:', expenses);
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error while fetching expenses. Please check backend logs for details.' });
    }
};

const updateExpense = async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.userId;
    const { title, amount, category, date } = req.body;

    try {
        // New: Find and update the expense document
        const result = await Expense.findOneAndUpdate(
            { _id: expenseId, user: userId },
            { $set: { title, amount, category, date } },
            { new: true } // Return the updated document
        );

        if (!result) {
            return res.status(404).json({ message: 'Expense not found or you are not authorized to update it.' });
        }
        console.log(`Backend: Expense ID ${expenseId} updated successfully.`);
        res.status(200).json({ message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Server error while updating expense. Please check backend logs for details.' });
    }
};

const getSummary = async (req, res) => {
    const userId = req.userId;

    try {
        // New: Use Mongoose aggregation to group and sum expenses by category
        const summary = await Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } }, // Match expenses for the current user
            { $group: {
                _id: '$category', // Group by category
                total: { $sum: '$amount' } // Sum the amount for each group
            }},
            { $project: {
                _id: 0,
                id: '$_id', // Rename _id to id to match previous MySQL output
                total: 1
            }}
        ]);
        console.log('Backend: Summary fetched successfully:', summary);
        res.json(summary);
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({ message: 'Server error while getting summary. Please check backend logs for details.' });
    }
};

module.exports = { addExpense, deleteExpense, getExpenses, getSummary, updateExpense };