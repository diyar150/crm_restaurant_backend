const express = require('express');
const router = express.Router();
const SellInvoiceController = require('../../controllers/Sell/SellInvoiceController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a sell invoice
router.post('/store', authenticate, SellInvoiceController.createInvoice);

router.get('/index', authenticate, SellInvoiceController.getAllInvoices);
// Get a sell invoice by ID
router.get('/show/:id', authenticate, SellInvoiceController.getInvoiceById);

// Get sell invoices by filters
router.get('/filter', authenticate, SellInvoiceController.getInvoicesByFilters);

// Update a sell invoice
router.put('/update/:id', authenticate, SellInvoiceController.updateInvoice);

// Soft delete a sell invoice
router.delete('/delete/:id', authenticate, SellInvoiceController.deleteInvoice);

module.exports = router;