const Expense = require('../models/Expense');

const addExpense = async (req, res) => {
    const { name, amount, category } = req.body;
    const expense = new Expense({ userId: req.userId, name, amount, category });
    await expense.save();
    res.status(201).json(expense);
};

const getExpenses = async (req, res) => {
    const expenses = await Expense.find({ userId: req.userId });
    res.json(expenses);
};

const getSummary = async (req, res) => {
    const summary = await Expense.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);
    res.json(summary);
};

module.exports = { addExpense, getExpenses, getSummary };
