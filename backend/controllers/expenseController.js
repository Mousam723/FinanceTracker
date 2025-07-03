// expenseController.js

const Expense = require('../models/Expense'); // Import the new MySQL-based Expense model functions

// ... (your addExpense function - keep it as is) ...
const addExpense = async (req, res) => {
    const { title, amount, category, date } = req.body;
    const userId = req.userId; // Get user ID from authenticated request
    console.log("Backend (expenseController.js - addExpense): Received date:", date);
    if (!userId || !title || !amount || !category || !date) {
        return res.status(400).json({ message: 'All expense fields are required: userId, title, amount, category, date.' });
    }

    try {
        console.log(`Backend: Attempting to add expense for userId: ${userId}`);
        const result = await Expense.addExpense(userId, title, amount, category, date);
        console.log('Backend: Expense added successfully, result:', result);

        res.status(201).json({
            message: 'Expense added successfully',
            id: result.insertId, // MySQL's insertId for the new record
            userId,
            title,
            amount,
            category,
            date
        });
    } catch (error) {
        console.error('*** Full Error Details in addExpense: ***');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.sqlMessage) {
            console.error('MySQL SQL Message:', error.sqlMessage);
            console.error('MySQL Error Code:', error.code);
            console.error('MySQL SQL State:', error.sqlState);
        }
        console.error('*****************************************');
        res.status(500).json({ message: 'Server error while adding expense. Please check backend logs for details.' });
    }
};

const deleteExpense = async (req, res) => {
    const expenseId = req.params.id; // Assuming the ID comes from the URL parameter (e.g., /api/expenses/:id)
    const userId = req.userId; // Get user ID from authenticated request (for authorization)

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }
    if (!expenseId) {
        return res.status(400).json({ message: 'Expense ID is required for deletion.' });
    }

    try {
        console.log(`Backend: Attempting to delete expense ID ${expenseId} for userId ${userId}`);
        const result = await Expense.deleteExpense(expenseId, userId);

        if (result.affectedRows === 0) {
            // This means no rows were deleted. Could be because ID didn't exist or userId didn't match.
            return res.status(404).json({ message: 'Expense not found or you are not authorized to delete it.' });
        }

        console.log(`Backend: Expense ID ${expenseId} deleted successfully.`);
        res.status(200).json({ message: 'Expense deleted successfully' });

    } catch (error) {
        console.error('*** Full Error Details in deleteExpense: ***');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.sqlMessage) {
            console.error('MySQL SQL Message:', error.sqlMessage);
            console.error('MySQL Error Code:', error.code);
            console.error('MySQL SQL State:', error.sqlState);
        }
        console.error('*****************************************');
        res.status(500).json({ message: 'Server error while deleting expense. Please check backend logs for details.' });
    }
};

const getExpenses = async (req, res) => {
    const userId = req.userId; // Get user ID from authenticated request

    if (!userId) {
        // This case should ideally be caught by authMiddleware first, but good to have
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    try {
        console.log(`Backend: Attempting to fetch expenses for userId: ${userId}`); // Add log
        const expenses = await Expense.findExpensesByUserId(userId);
        console.log('Backend: Expenses fetched successfully:', expenses); // Add log for success

        // Ensure we always send an array, even if empty
        if (!Array.isArray(expenses)) {
            console.error('Backend: Expense.findExpensesByUserId did NOT return an array!', expenses);
            return res.status(500).json({ message: 'Unexpected data format from database.' });
        }

        res.json(expenses); // This should be an array
    } catch (error) {
        console.error('*** Full Error Details in getExpenses: ***'); // Detailed error log
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.sqlMessage) { // For MySQL specific errors
            console.error('MySQL SQL Message:', error.sqlMessage);
            console.error('MySQL Error Code:', error.code);
            console.error('MySQL SQL State:', error.sqlState);
        }
        console.error('*****************************************');
        res.status(500).json({ message: 'Server error while fetching expenses. Please check backend logs for details.' });
    }
};

const updateExpense = async (req, res) => {
    const expenseId = req.params.id; // Get expense ID from URL (e.g., /api/expenses/:id)
    const userId = req.userId; // Get user ID from authenticated request
    const { title, amount, category, date } = req.body; // Get updated fields from request body

    if (!userId || !expenseId) {
        return res.status(401).json({ message: 'Unauthorized: User ID or Expense ID not found.' });
    }
    if (!title || !amount || !category || !date) {
        return res.status(400).json({ message: 'All expense fields are required for update.' });
    }

    try {
        console.log(`Backend: Attempting to update expense ID ${expenseId} for userId ${userId}`);
        const result = await Expense.updateExpense(expenseId, userId, title, amount, category, date);

        if (result.affectedRows === 0) {
            // This means no rows were updated. Could be because ID didn't exist or userId didn't match.
            return res.status(404).json({ message: 'Expense not found or you are not authorized to update it.' });
        }

        console.log(`Backend: Expense ID ${expenseId} updated successfully.`);
        res.status(200).json({ message: 'Expense updated successfully' });

    } catch (error) {
        console.error('*** Full Error Details in updateExpense: ***');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.sqlMessage) {
            console.error('MySQL SQL Message:', error.sqlMessage);
            console.error('MySQL Error Code:', error.code);
            console.error('MySQL SQL State:', error.sqlState);
        }
        console.error('*****************************************');
        res.status(500).json({ message: 'Server error while updating expense. Please check backend logs for details.' });
    }
};

const getSummary = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    try {
        console.log(`Backend: Attempting to fetch summary for userId: ${userId}`); // Add log
        const summary = await Expense.getCategorySummaryByUserId(userId);
        console.log('Backend: Summary fetched successfully:', summary); // Add log for success

        // Ensure summary is an array too, if your frontend expects to map it
        if (!Array.isArray(summary)) {
            console.error('Backend: Expense.getCategorySummaryByUserId did NOT return an array!', summary);
            return res.status(500).json({ message: 'Unexpected summary data format from database.' });
        }
        res.json(summary);
    } catch (error) {
        console.error('*** Full Error Details in getSummary: ***'); // Detailed error log
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.sqlMessage) {
            console.error('MySQL SQL Message:', error.sqlMessage);
            console.error('MySQL Error Code:', error.code);
            console.error('MySQL SQL State:', error.sqlState);
        }
        console.error('*****************************************');
        res.status(500).json({ message: 'Server error while getting summary. Please check backend logs for details.' });
    }
};

module.exports = { addExpense, deleteExpense, getExpenses, getSummary,updateExpense };