const City = require('../../models/City/City');
const i18n = require('../../config/i18nConfig');

// Create city
exports.createCity = (req, res) => {
  const { name, description, state } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.city_name') });
  }

  // Prepare data for saving
  const cityData = { name, description, state };

  City.create(cityData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.city_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_city') });
    }
    res.status(201).json({ message: i18n.__('messages.city_created'), city: { id: result.insertId, ...cityData } });
  });
};

// Get all cities
exports.getAllCities = (req, res) => {
  City.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_cities') });
    }
    res.status(200).json(result);
  });
};

// Get city by ID
exports.getCityById = (req, res) => {
  const { id } = req.params;
  City.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_city') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.city_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update city
exports.updateCity = (req, res) => {
  const { id } = req.params;
  const { name, description, state } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.city_name') });
  }

  const cityData = { name, description, state };
  City.update(id, cityData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.city_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_city') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.city_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.city_updated') });
  });
};

// Delete city
exports.deleteCity = (req, res) => {
  const { id } = req.params;
  City.deleteSoft(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_city') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.city_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.city_deleted') });
  });
};