const express = require('express');
const router = express.Router();
const PrinterController = require('../../controllers/Printer/PrinterController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a printer
router.post('/store', authenticate, PrinterController.createPrinter);

// Get all printers
router.get('/index', authenticate, PrinterController.getAllPrinters);

// Get a printer by ID
router.get('/show/:id', authenticate, PrinterController.getPrinterById);

// Update a printer
router.put('/update/:id', authenticate, PrinterController.updatePrinter);

// Soft delete a printer
router.delete('/delete/:id', authenticate, PrinterController.deletePrinter);

module.exports = router;