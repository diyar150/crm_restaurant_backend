const express = require('express');
const router = express.Router();

// Company & Capital
const companyRoutes = require('./Company/companyRoutes');

// Branch, Warehouse, City, Zone, Region ,Driver
const branchRoutes = require('./Branch/branchRoutes');
const cityRoutes = require('./City/cityRoutes');

// Appointment
const appointmentRoutes = require('./Appointment/appointmentRoutes');

// Customer
const customerRoutes = require('./Customer/customerRoutes');
const customerCategoryRoutes = require('./Customer/customerCategoryRoutes');
const paymentRoutes=require('./Payment/paymentRoutes');
// User & Salary
const userRoutes = require('./User/userRoutes');

// Expenses
const expensesCategoryRoutes = require('./Expenses/expensesCategoryRoutes');
const expensesRoutes = require('./Expenses/expensesRoutes');

// Item
const itemRoutes = require('./Item/itemRoutes');
const itemCategoryRoutes = require('./Item/itemCategoryRoutes');
const itemSizeRoutes = require('./Item/itemSizeRoutes');
const itemPriceRoutes = require('./Item/itemPriceRoutes');


// Sell 

const sellInvoiceRoutes = require('./Sell/sellInvoiceRoutes');
const sellItemRoutes = require('./Sell/sellItemRoutes');


// Route usage
router.use('/company', companyRoutes);

router.use('/branch', branchRoutes);
router.use('/city', cityRoutes);
router.use('/driver', driverRoutes);
router.use('/appointment', appointmentRoutes);

router.use('/customer', customerRoutes);
router.use('/customer-category', customerCategoryRoutes);
router.use('/payments', paymentRoutes);

router.use('/user', userRoutes);

router.use('/expenses-category', expensesCategoryRoutes);
router.use('/expenses', expensesRoutes);

router.use('/item', itemRoutes);
router.use('/item-category', itemCategoryRoutes);
router.use('/item-size', itemSizeRoutes);
router.use('/item-price', itemPriceRoutes);


// Sell
router.use('/sell-invoice', sellInvoiceRoutes);
router.use('/sell-item', sellItemRoutes);

module.exports = router;