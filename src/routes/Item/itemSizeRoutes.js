const express = require('express');
const router = express.Router();
const ItemSizeController = require('../../controllers/Item/ItemSizeController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item size
router.post('/store', authenticate, ItemSizeController.createItemSize);

// Get all item sizes
router.get('/index', authenticate, ItemSizeController.getAllItemSizes);

// Get an item size by ID
router.get('/show/:id', authenticate, ItemSizeController.getItemSizeById);

// Get item sizes by item ID
router.get('/get/:item_id', authenticate, ItemSizeController.getSizesByItemId);

// Update an item size
router.put('/update/:id', authenticate, ItemSizeController.updateItemSize);

// Soft delete an item size
router.delete('/delete/:id', authenticate, ItemSizeController.deleteItemSize);

module.exports = router;