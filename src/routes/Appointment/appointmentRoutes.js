const express = require('express');
const router = express.Router();
const AppointmentController = require('../../controllers/Appointment/AppointmentController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an appointment
router.post('/store', authenticate, AppointmentController.createAppointment);

// Get all appointments
router.get('/index', authenticate, AppointmentController.getAllAppointments);

// Get an appointment by ID
router.get('/show/:id', authenticate, AppointmentController.getAppointmentById);

// Update an appointment
router.put('/update/:id', authenticate, AppointmentController.updateAppointment);

// Soft delete an appointment
router.delete('/delete/:id', authenticate, AppointmentController.deleteAppointment);

module.exports = router;