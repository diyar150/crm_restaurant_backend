const Table = require('../../models/Tables/Table');
const i18n = require('../../config/i18nConfig');

// Create table
exports.createTable = (req, res) => {
  const { branch_id, table_number, capacity } = req.body;

  // Validate required fields
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!table_number) {
    return res.status(400).json({ error: i18n.__('validation.required.table_number') });
  }
  if (!capacity) {
    return res.status(400).json({ error: i18n.__('validation.required.capacity') });
  }

  const tableData = { branch_id, table_number, capacity };
  Table.create(tableData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_creating_table') });
    }
    res.status(201).json({ message: i18n.__('messages.table_created'), table: { id: result.insertId, ...tableData } });
  });
};

// Get all tables
exports.getAllTables = (req, res) => {
  Table.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_tables') });
    }
    res.status(200).json(result);
  });
};

// Get table by ID
exports.getTableById = (req, res) => {
  const { id } = req.params;
  Table.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_table') });
    }
    if (!result || result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.table_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update table
exports.updateTable = (req, res) => {
  const { id } = req.params;
  const { branch_id, table_number, capacity } = req.body;

  // Validate required fields
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!table_number) {
    return res.status(400).json({ error: i18n.__('validation.required.table_number') });
  }
  if (!capacity) {
    return res.status(400).json({ error: i18n.__('validation.required.capacity') });
  }

  const tableData = { branch_id, table_number, capacity };
  Table.update(id, tableData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_updating_table') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.table_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.table_updated') });
  });
};

// Delete table (soft delete)
exports.deleteTable = (req, res) => {
  const { id } = req.params;
  Table.deleteSoft(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_table') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.table_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.table_deleted') });
  });
};