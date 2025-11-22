const express = require('express');
const router = express.Router();
const ItemCategoryController = require('../../controllers/Item/ItemCategoryController');
const authenticate = require('../../middlewares/authMiddleware');

// List
router.get('/index', authenticate, ItemCategoryController.getAll);

// Show
router.get('/show/:id', authenticate, ItemCategoryController.getById);

// Create
router.post('/store', authenticate, ItemCategoryController.create);

// Update
router.put('/update/:id', authenticate, ItemCategoryController.update);

// Delete (soft)
router.delete('/delete/:id', authenticate, ItemCategoryController.delete);

module.exports = router;