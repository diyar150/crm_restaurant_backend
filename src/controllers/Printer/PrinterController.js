const Printer = require('../../models/Printer/Printer');
const i18n = require('../../config/i18nConfig');

// Create printer
exports.createPrinter = (req, res) => {
  const { name, branch_id, state } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.printer_name') });
  }

  // Prepare data for saving
  const printerData = { name, branch_id, state };

  Printer.create(printerData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.printer_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_printer') });
    }
    res.status(201).json({ message: i18n.__('messages.printer_created'), printer: { id: result.insertId, ...printerData } });
  });
};

// Get all printers
exports.getAllPrinters = (req, res) => {
  Printer.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_printers') });
    }
    res.status(200).json(result);
  });
};

// Get printer by ID
exports.getPrinterById = (req, res) => {
  const { id } = req.params;
  Printer.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_printer') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.printer_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update printer
exports.updatePrinter = (req, res) => {
  const { id } = req.params;
  const { name, branch_id, state } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.printer_name') });
  }

  const printerData = { name, branch_id, state };
  Printer.update(id, printerData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.printer_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_printer') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.printer_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.printer_updated') });
  });
};

// Delete printer
exports.deletePrinter = (req, res) => {
  const { id } = req.params;
  Printer.deleteSoft(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_printer') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.printer_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.printer_deleted') });
  });
};