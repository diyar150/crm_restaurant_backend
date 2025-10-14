const Appointment = require('../../models/Appointment/Appointment');
const i18n = require('../../config/i18nConfig');

// Create Appointment
exports.createAppointment = (req, res) => {
  const data = req.body;
  // Validate required fields
  if (!data.customer_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_id') });
  }
  if (!data.branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!data.name) {
    return res.status(400).json({ error: i18n.__('validation.required.name') });
  }
  if (!data.appointment_date) {
    return res.status(400).json({ error: i18n.__('validation.required.date') });
  }
  Appointment.create(data, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_creating_appointment') });
    }
    res.status(201).json({ message: i18n.__('messages.appointment_created'), id: result.insertId });
  });
};

// Get All Appointments
exports.getAllAppointments = (req, res) => {
  Appointment.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_appointments') });
    }
    res.status(200).json(results);
  });
};

// Get Appointment by ID
exports.getAppointmentById = (req, res) => {
  const id = req.params.id;
  Appointment.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_appointment') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.appointment_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Appointment
exports.updateAppointment = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  // Validate required fields
  if (!data.customer_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_id') });
  }
  if (!data.user_id) {
    return res.status(400).json({ error: i18n.__('validation.required.user_id') });
  }
  if (!data.branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!data.name) {
    return res.status(400).json({ error: i18n.__('validation.required.name') });
  }
  if (!data.appointment_date) {
    return res.status(400).json({ error: i18n.__('validation.required.date') });
  }
  Appointment.update(id, data, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_updating_appointment') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.appointment_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.appointment_updated') });
  });
};

// Soft Delete Appointment
exports.deleteAppointment = (req, res) => {
  const id = req.params.id;
  Appointment.deleteSoft(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_appointment') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.appointment_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.appointment_deleted') });
  });


};
