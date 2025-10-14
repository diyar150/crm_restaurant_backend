const Customer = require('../../models/Customer/Customer');
const Zone = require('../../models/Zone/Zone');
const City = require('../../models/City/City'); // Assuming you have a City model
const CustomerCategory = require('../../models/Customer/CustomerCategory');
const i18n = require('../../config/i18nConfig');


function toNumberOrZero(val) {
  return val === undefined || val === null || val === '' ? 0 : Number(val);
}


// Create customer
exports.create = (req, res) => {

  const { category_id, name, phone_1, phone_2, address, loan, note } = req.body;
  // Validate input
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }
  if (!category_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_category_id') });
  }

  // Prepare data for saving
  const customerData = { category_id, name, phone_1, phone_2, address, loan, note };
  Customer.create(customerData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage && err.sqlMessage.includes('phone_1')) {
        return res.status(400).json({ error: i18n.__('validation.unique.phone_1') });
      }
      return res.status(500).json({ error: "Error occurred while creating the customer" });
    }
    res.status(201).json({ message: i18n.__('messages.customer_created'), customer: { id: result.insertId, ...customerData } });
  });
};

// Get all customers
exports.getAll = (req, res) => {
  Customer.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customers') });
    res.status(200).json(result);
  });
};

exports.autocompleteSearch = (req, res) => {
  const { q = '', limit = 20 } = req.query;
  if (!q || q.length < 2) return res.json([]); // Require at least 2 chars

  Customer.autocompleteSearch(q, limit, (err, results) => {
    if (err) return res.status(500).json({ error: "Error searching customers" });
    res.json(results);
  });
};

// Get customer by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  Customer.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customer') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json(result[0]);
  });
};

// filter controller

exports.filter = (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'id',
    sortOrder = 'asc',
    search,
    category_id,
    loan_positive,
    loan_negative,
    loan_zero,
  } = req.query;

  const filters = {
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'asc',
    search,
    category_id,
    loan_positive: loan_positive === 'true' || loan_positive === true,
    loan_negative: loan_negative === 'true' || loan_negative === true,
    loan_zero: loan_zero === 'true' || loan_zero === true,
  };

  Customer.filter(filters, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customers') });
    res.status(200).json(results);
  });
};

// Update customer
exports.update = (req, res) => {
  const { id } = req.params;
  const { category_id, name, phone_1, phone_2, address, loan, note } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }
  if (!category_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_category_id') });
  }

  // Prepare data for updating
  const customerData = { category_id, name, phone_1, phone_2, address, loan, note };
  Customer.update(id, customerData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage && err.sqlMessage.includes('phone_1')) {
        return res.status(400).json({ error: i18n.__('validation.unique.phone_1') });
      }
      return res.status(500).json({ error: "Error occurred while updating the customer" });
    }
    res.status(200).json({ message: i18n.__('messages.customer_updated') });
  });
};

// Delete customer
exports.delete = (req, res) => {
  const { id } = req.params;
  Customer.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_customer') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json({ message: i18n.__('messages.customer_deleted') });
  });
};

// Increase loan
exports.increaseLoan = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Customer.increaseLoan(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json({ message: i18n.__('messages.loan_increased') });
  });
};

// Decrease loan
exports.decreaseLoan = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Customer.decreaseLoan(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_loan') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json({ message: i18n.__('messages.loan_decreased') });
  });

};


