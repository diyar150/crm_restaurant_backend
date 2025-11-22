const ItemCategory = require('../../models/Item/ItemCategory');
const i18n = require('../../config/i18nConfig');

// Create item category
exports.create = (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_category_name') });
  }

  ItemCategory.create({ name, description }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage?.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_category_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_category') });
    }
    res.status(201).json({ message: i18n.__('messages.item_category_created'), itemCategory: { id: result.insertId, name, description } });
  });
};

// Get all item categories
exports.getAll = (req, res) => {
  ItemCategory.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_categories') });
    res.status(200).json(result);
  });
};

// Get item category by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  ItemCategory.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_category') });
    if (!result || result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_category_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update item category
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_category_name') });
  }

  ItemCategory.update(id, { name, description }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage?.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_category_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_category') });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.item_category_updated') });
  });
};

// Delete item category (soft)
exports.delete = (req, res) => {
  const { id } = req.params;
  ItemCategory.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_item_category') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.item_category_deleted') });
  });
};