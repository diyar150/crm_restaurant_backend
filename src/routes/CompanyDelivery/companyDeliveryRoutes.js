const express = require('express');
const router = express.Router();
const CompanyDeliveryController = require('../../controllers/CompanyDelivery/CompanyDeliveryController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a company delivery
router.post('/store', authenticate, CompanyDeliveryController.createCompanyDelivery);

// Get all company deliveries
router.get('/index', authenticate, CompanyDeliveryController.getAllCompanyDeliveries);

// Get a company delivery by ID
router.get('/show/:id', authenticate, CompanyDeliveryController.getCompanyDeliveryById);

// Update a company delivery
router.put('/update/:id', authenticate, CompanyDeliveryController.updateCompanyDelivery);

// Soft delete a company delivery
router.delete('/delete/:id', authenticate, CompanyDeliveryController.deleteCompanyDelivery);


module.exports = router;