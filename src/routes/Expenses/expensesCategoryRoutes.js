const express = require('express');
const router = express.Router();
const ExpensesCategoryController = require('../../controllers/Expenses/ExpensesCategoryController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an expense category
router.post('/store', authenticate, ExpensesCategoryController.createExpenseCategory);

// Get all expense categories
router.get('/index', authenticate, ExpensesCategoryController.getAllExpenseCategories);

// Get an expense category by ID
router.get('/show/:id', authenticate, ExpensesCategoryController.getExpenseCategoryById);

// Get Filtered Expense Categories
router.get('/filter', authenticate, ExpensesCategoryController.getFilteredExpenseCategories);

// Update an expense category
router.put('/update/:id', authenticate, ExpensesCategoryController.updateExpenseCategory);

// Soft delete an expense category
router.delete('/delete/:id', authenticate, ExpensesCategoryController.deleteExpenseCategory);

module.exports = router;