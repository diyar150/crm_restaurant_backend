const express = require('express');
const router = express.Router();


// Route usage
router.use('/company', require('./Company/companyRoutes'));
router.use('/branch', require('./Branch/branchRoutes'));
router.use('/user', require('./User/userRoutes'));
router.use('/city', require('./City/cityRoutes'));
router.use('/table', require('./Table/tableRoutes'));
router.use('/printer', require('./Printer/printerRoutes'));
router.use('/company-delivery', require('./CompanyDelivery/companyDeliveryRoutes'));





// Appointment
// const appointmentRoutes = require('./Appointment/appointmentRoutes');

// // Customer
// const customerRoutes = require('./Customer/customerRoutes');
// const customerCategoryRoutes = require('./Customer/customerCategoryRoutes');
// const paymentRoutes=require('./Payment/paymentRoutes');
// // User & Salary
// const userRoutes = require('./User/userRoutes');

// // Expenses
// const expensesCategoryRoutes = require('./Expenses/expensesCategoryRoutes');
// const expensesRoutes = require('./Expenses/expensesRoutes');

// // Item
// const itemRoutes = require('./Item/itemRoutes');
// const itemCategoryRoutes = require('./Item/itemCategoryRoutes');
// const itemSizeRoutes = require('./Item/itemSizeRoutes');
// const itemPriceRoutes = require('./Item/itemPriceRoutes');


// // Sell 

// const sellInvoiceRoutes = require('./Sell/sellInvoiceRoutes');
// const sellItemRoutes = require('./Sell/sellItemRoutes');


// router.use('/customer', customerRoutes);
// router.use('/customer-category', customerCategoryRoutes);
// router.use('/payments', paymentRoutes);



// router.use('/expenses-category', expensesCategoryRoutes);
// router.use('/expenses', expensesRoutes);

// router.use('/item', itemRoutes);
// router.use('/item-category', itemCategoryRoutes);
// router.use('/item-size', itemSizeRoutes);
// router.use('/item-price', itemPriceRoutes);


// // Sell
// router.use('/sell-invoice', sellInvoiceRoutes);
// router.use('/sell-item', sellItemRoutes);

module.exports = router;