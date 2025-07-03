// backend/routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import your authentication middleware
const expenseController = require('../controllers/expenseController'); // Import your expense controller

// Route to add an expense (assuming POST /api/expenses)
router.post('/', protect, expenseController.addExpense);

// Route to get all expenses for the authenticated user (GET /api/expenses)
// THIS IS LIKELY THE LINE CAUSING THE ERROR IF IT WASN'T UPDATED
router.get('/', protect, expenseController.getExpenses); // This line maps the route to the controller function

// Route to get expense summary by category (GET /api/expenses/summary)
router.get('/summary', protect, expenseController.getSummary);

router.delete('/:id', protect, expenseController.deleteExpense); // New route

router.put('/:id', protect, expenseController.updateExpense);

module.exports = router;