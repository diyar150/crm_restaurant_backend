const express = require('express');
const router = express.Router();
const customerPaymentController = require('../../controllers/Payment/PaymentController');
const authenticate = require('../../middlewares/authMiddleware');

// Create Payment
router.post('/store', authenticate,customerPaymentController.createPayment);

// Get All Payments
router.get('/index', authenticate,customerPaymentController.getAllPayments);

// Get Payment by ID
router.get('/show/:id', authenticate,customerPaymentController.getPaymentById);

// Get Payments by filters
router.get('/filter', authenticate, customerPaymentController.filterPayments);

// Update Payment
router.put('/update/:id', authenticate,customerPaymentController.updatePayment);

// Delete Payment
router.delete('/delete/:id', authenticate,customerPaymentController.deletePayment);

module.exports = router;

module.exports = router;