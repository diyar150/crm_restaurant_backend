const express = require('express');
const router = express.Router();
const SellItemController = require('../../controllers/Sell/SellItemController');
const authenticate = require('../../middlewares/authMiddleware');

router.post('/store', authenticate, SellItemController.createSellItem);
router.get('/index', authenticate, SellItemController.getByInvoiceId);
router.get('/show/:id', authenticate, SellItemController.getSellItemById);
router.put('/update/:id', authenticate, SellItemController.updateSellItem);
router.delete('/delete/:id', authenticate, SellItemController.deleteSellItem);

module.exports = router;