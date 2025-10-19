const CompanyDelivery = require('../../models/CompanyDelivery/CompanyDelivery');
const i18n = require('../../config/i18nConfig');

// Create company delivery
exports.createCompanyDelivery = (req, res) => {
  const { name, type, amount, note } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.company_delivery_name') });
  }
  if (!type) {
    return res.status(400).json({ error: i18n.__('validation.required.company_delivery_type') });
  }

  const deliveryData = { name, type, amount, note };

  CompanyDelivery.create(deliveryData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.company_delivery_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_company_delivery') });
    }
    res.status(201).json({ message: i18n.__('messages.company_delivery_created'), company_delivery: { id: result.insertId, ...deliveryData } });
  });
};

// Get all company deliveries
exports.getAllCompanyDeliveries = (req, res) => {
  CompanyDelivery.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_company_deliveries') });
    }
    res.status(200).json(result);
  });
};

// Get company delivery by ID
exports.getCompanyDeliveryById = (req, res) => {
  const { id } = req.params;
  CompanyDelivery.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_company_delivery') });
    }
    if (!result || result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.company_delivery_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update company delivery
exports.updateCompanyDelivery = (req, res) => {
  const { id } = req.params;
  const { name, type, amount, note } = req.body;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.company_delivery_name') });
  }
  if (!type) {
    return res.status(400).json({ error: i18n.__('validation.required.company_delivery_type') });
  }

  const deliveryData = { name, type, amount, note };
  CompanyDelivery.update(id, deliveryData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.company_delivery_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_company_delivery') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.company_delivery_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.company_delivery_updated') });
  });
};

// Delete company delivery (soft delete)
exports.deleteCompanyDelivery = (req, res) => {
  const { id } = req.params;
  CompanyDelivery.deleteSoft(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_company_delivery') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.company_delivery_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.company_delivery_deleted') });
  });
};