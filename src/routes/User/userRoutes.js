const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/User/UserController');
const authenticate=require('../../middlewares/authMiddleware');

// Create a user
router.post('/store', authenticate, UserController.create);

// Get all users
router.get('/index', authenticate, UserController.getAll);

// Get a user by ID
router.get('/show/:id', authenticate, UserController.getById);

// Get all agents
router.get('/agent', authenticate, UserController.getAllAgents);
// get filtered users
router.get('/filter', authenticate,UserController.filter);

// Update a user
router.put('/update/:id', authenticate, UserController.update);

// Soft delete a user
router.delete('/delete/:id', authenticate, UserController.delete);

// Login a user
router.post('/login', UserController.login);

// Logout a user
router.post('/logout', UserController.logout);

module.exports = router;