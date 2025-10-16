const CustomerCategory = require('../../models/Customer/CustomerCategory');
const i18n = require('../../config/i18nConfig');

// Create customer category
exports.create = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_category_name') });
  }

  // Prepare data for saving
  const customerCategoryData = { name };

  CustomerCategory.create(customerCategoryData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.customer_category_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_customer_category') });
    }
    res.status(201).json({ message: i18n.__('messages.customer_category_created'), customerCategory: { id: result.insertId, ...customerCategoryData } });
  });
};

// Get all customer categories
exports.getAll = (req, res) => {
  CustomerCategory.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customer_categories') });
    res.status(200).json(result);
  });
};

// Get customer category by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  CustomerCategory.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customer_category') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_category_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update customer category
exports.update = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_category_name') });
  }

  const customerCategoryData = { name };
  CustomerCategory.update(id, customerCategoryData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.customer_category_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_customer_category') });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.customer_category_updated') });
  });
};

// Delete customer category
exports.delete = (req, res) => {
  const { id } = req.params;
  CustomerCategory.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_customer_category') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.customer_category_deleted') });
  });
};