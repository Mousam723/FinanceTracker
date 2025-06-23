const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');

// GET All Expenses
router.get('/', protect, async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
  res.json(expenses);
});

// POST Add Expense
router.post('/', protect, async (req, res) => {
  const { title, amount, category, date } = req.body;
  const newExpense = new Expense({
    user: req.user.id,
    title,
    amount,
    category,
    date,
  });
  const savedExpense = await newExpense.save();
  res.json(savedExpense);
});

// PUT Update Expense
router.put('/:id', protect, async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  if (expense.user.toString() !== req.user.id)
    return res.status(401).json({ message: 'Unauthorized' });

  const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedExpense);
});

// DELETE Expense
router.delete('/:id', protect, async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  if (expense.user.toString() !== req.user.id)
    return res.status(401).json({ message: 'Unauthorized' });

  await expense.deleteOne();
  res.json({ message: 'Expense removed' });
});

module.exports = router;
