const express = require('express');
const router = express.Router();
const TableController = require('../../controllers/Table/TableController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a table
router.post('/store', authenticate, TableController.createTable);

// Get all tables
router.get('/index', authenticate, TableController.getAllTables);

// Get a table by ID
router.get('/show/:id', authenticate, TableController.getTableById);

// Update a table
router.put('/update/:id', authenticate, TableController.updateTable);

// Soft delete a table
router.delete('/delete/:id', authenticate, TableController.deleteTable);

module.exports = router;