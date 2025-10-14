const express = require('express');
const router = express.Router();
const ItemController = require('../../controllers/Item/ItemController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item
router.post('/store', authenticate, ItemController.createItem);

// Get all items
router.get('/index', authenticate, ItemController.getAllItems);

// Get an item with sizes
router.get('/with-sizes/:id', authenticate, ItemController.getItemWithSizes);

// Get an item by ID
router.get('/show/:id', authenticate, ItemController.getItemById);
// Filter items
router.get('/filter', authenticate, ItemController.getFilteredItems);
// Search items
router.get('/search', authenticate, ItemController.autocompleteSearch);
// Get full information of an item
router.get('/fullInfo', authenticate, ItemController.getItemFullInfo);

// Update an item
router.put('/update/:id', authenticate, ItemController.updateItem);

// Soft delete an item
router.delete('/delete/:id', authenticate, ItemController.deleteItem);

module.exports = router;