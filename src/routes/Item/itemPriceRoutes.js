const express = require('express');
const router = express.Router();
const ItemPriceController = require('../../controllers/Item/ItemPriceController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item price
router.post('/store', authenticate, ItemPriceController.createItemPrice);

// Get all item prices
router.get('/index', authenticate, ItemPriceController.getAllItemPrices);

// Get an item price by ID
router.get('/show/:id', authenticate, ItemPriceController.getItemPriceById);


// Update an item price
router.put('/update/:id', authenticate, ItemPriceController.updateItemPrice);

// Soft delete an item price
router.delete('/delete/:id', authenticate, ItemPriceController.deleteItemPrice);

module.exports = router;