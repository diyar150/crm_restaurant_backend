const express = require('express');
const router = express.Router();
const BranchController = require('../../controllers/Branch/BranchController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a branch
router.post('/store', authenticate, BranchController.createBranch);

// Get all branches
router.get('/index', authenticate, BranchController.getAllBranches);

// Get a branch by ID
router.get('/show/:id', authenticate, BranchController.getBranchById);

// Removed obsolete user_id route; user_id is not a valid column in branch

// Filter branches
router.get('/filter', authenticate,BranchController.filterBranches);

// Update a branch
router.put('/update/:id', authenticate, BranchController.updateBranch);

// Soft delete a branch
router.delete('/delete/:id', authenticate, BranchController.deleteBranch);

module.exports = router;