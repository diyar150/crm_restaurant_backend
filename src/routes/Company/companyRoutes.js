const express = require('express');
const router = express.Router();
const CompanyController = require('../../controllers/Company/CompanyController');
const authenticate=require('../../middlewares/authMiddleware');
// Create a company
router.post('/store',authenticate ,CompanyController.create);            

// Get all companies
router.get('/index',authenticate, CompanyController.getAll);             

// Get a company by ID
router.get('/show/:id', authenticate,CompanyController.getById);         

// Get last inserted company ID
router.get('/last-insert-id', authenticate, CompanyController.getLastInsertedId);
// Update a company
router.put('/update/:id',authenticate, CompanyController.update);        

// Soft delete a company
router.delete('/delete/:id',authenticate, CompanyController.delete);    

module.exports = router;
 