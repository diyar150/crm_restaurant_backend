const express = require('express');
const router = express.Router();
const SalaryController = require('../../controllers/Salary/SalaryController');
const authenticate=require('../../middlewares/authMiddleware');

// Create a Salaru category
router.post('/store', authenticate,SalaryController.createSalary);

// Get all Salary
router.get('/index', authenticate,SalaryController.getAllSalaries);

// Get a Salary
router.get('/show/:id', authenticate,SalaryController.getSalaryById);

// Get Salary by Date Range
router.get('/filter', authenticate, SalaryController.filterSalaries);

// Update a Salary
router.put('/update/:id', authenticate,SalaryController.updateSalary);

// Soft delete a Salary
router.delete('/delete/:id', authenticate,SalaryController.deleteSalary);

module.exports = router;