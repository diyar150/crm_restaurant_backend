const ItemSize = require('../../models/Item/ItemSize');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Size
exports.createItemSize = (req, res) => {
  const itemSizeData = req.body;

  // Validate required fields
  if (!itemSizeData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_size_name') });
  }

  ItemSize.create(itemSizeData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_size_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_size') });
    }
    res.status(201).json({ message: i18n.__('messages.item_size_created'), id: result.insertId });
  });
};

// Get All Item Sizes
exports.getAllItemSizes = (req, res) => {
  ItemSize.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_sizes') });
    }
    res.status(200).json(results);
  });
};

// Get Item Size by ID
exports.getItemSizeById = (req, res) => {
  const itemSizeId = req.params.id;
  ItemSize.getById(itemSizeId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_size') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_size_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// GEt item Size by Item ID
exports.getItemSizesByItemId = (req, res) => {
  const itemId = req.params.itemId;
  ItemSize.getSizeByItemId(itemId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_sizes') });
    }
    res.status(200).json(results);
  });
};



// Update Item Size
exports.updateItemSize = (req, res) => {
  const itemSizeId = req.params.id;
  const itemSizeData = req.body;

  // Validate required fields
  if (!itemSizeData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_size_name') });
  }

  ItemSize.update(itemSizeId, itemSizeData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_size_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_size') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_size_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_size_updated') });
  });
};

// Soft Delete Item Size
exports.deleteItemSize = (req, res) => {
  const itemSizeId = req.params.id;
  ItemSize.deleteSoft(itemSizeId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item_size') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_size_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_size_deleted') });
  });
};