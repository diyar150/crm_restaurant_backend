const express = require('express');
const router = express.Router();
const ExpensesController = require('../../controllers/Expenses/ExpensesController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a expense
router.post('/store', authenticate,ExpensesController.createExpense);

// Get all expense
router.get('/index', authenticate,ExpensesController.getAllExpenses);

// Get a expense by ID
router.get('/show/:id', authenticate,ExpensesController.getExpenseById);

// Get expenses by filters
router.get('/filter', authenticate, ExpensesController.getExpensesByFilters);

// Update a expense
router.put('/update/:id', authenticate,ExpensesController.updateExpense);

// Soft delete a expense
router.delete('/delete/:id', authenticate,ExpensesController.deleteExpense);


module.exports = router;