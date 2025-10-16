const express = require('express');
const router = express.Router();
const CityController = require('../../controllers/City/CityController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a city
router.post('/store', authenticate, CityController.createCity);

// Get all cities
router.get('/index', authenticate, CityController.getAllCities);

// Get a city by ID
router.get('/show/:id', authenticate, CityController.getCityById);

// Update a city
router.put('/update/:id', authenticate, CityController.updateCity);

// Soft delete a city
router.delete('/delete/:id', authenticate, CityController.deleteCity);

module.exports = router;