const express = require('express');
const router = express.Router();
const CustomerCategoryController = require('../../controllers/Customer/CustomerCategoryController');
const authenticate=require('../../middlewares/authMiddleware');

// Create a customer category
router.post('/store', authenticate,CustomerCategoryController.create);

// Get all customer categories
router.get('/index', authenticate,CustomerCategoryController.getAll);

// Get a customer category by ID
router.get('/show/:id', authenticate,CustomerCategoryController.getById);

// Update a customer category
router.put('/update/:id', authenticate,CustomerCategoryController.update);

// Soft delete a customer category
router.delete('/delete/:id', authenticate,CustomerCategoryController.delete);

module.exports = router;