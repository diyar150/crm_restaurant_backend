const Branch = require('../../models/Branch/Branch');
const Company = require('../../models/Company/Company');
const City = require('../../models/City/City');
const i18n = require('../../config/i18nConfig');

// Create branch
exports.createBranch = (req, res) => {
  const { company_id, name, address, latitude, longitude, radius_meters, wallet, city_id, opening_date, state } = req.body;

  // Validate required fields
  if (!company_id) {
    return res.status(400).json({ error: i18n.__('validation.required.company_id') });
  }
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.name') });
  }

  // Check if company_id is valid
  Company.getById(company_id, (err, companyResult) => {
    if (err || companyResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.company_id') });
    }

    // Create branch record
    const branchData = { company_id, name, address, latitude, longitude, radius_meters, wallet, city_id, opening_date, state };
    Branch.create(branchData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: i18n.__('validation.unique.branch_name') });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: i18n.__('messages.branch_created'), id: result.insertId });
    });
  });
};

exports.getBranchesByUser = (req, res) => {
  // This method is obsolete, as user_id is not a column in the branch model.
  return res.status(400).json({ error: 'user_id is not a valid column for branch.' });
};



// Get All Branches
exports.getAllBranches = (req, res) => {
  Branch.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};
exports.filterBranches = (req, res) => {
  const filters = {
    id: req.query.id,
    branch_name: req.query.branch_name,
    city_id: req.query.city_id,
    company_id: req.query.company_id,
    page: req.query.page,
    pageSize: req.query.pageSize,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  };

  Branch.filter(filters, (err, data) => {
    if (err) {
      console.error('Error filtering branches:', err);
      return res.status(500).json({ error: 'Error filtering branches' });
    }
    // Return results and total count for pagination
    res.status(200).json({
      branches: data.results,
      total: data.total,
    });
  });
};

// Get Branch by ID
exports.getBranchById = (req, res) => {
  const { id } = req.params;
  Branch.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update Branch
exports.updateBranch = (req, res) => {
  const { id } = req.params;
  const { company_id, name, address, latitude, longitude, radius_meters, wallet, city_id, opening_date, state } = req.body;

  // Validate required fields
  if (!company_id) {
    return res.status(400).json({ error: i18n.__('validation.required.company_id') });
  }
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.name') });
  }

  // Check if company_id is valid
  Company.getById(company_id, (err, companyResult) => {
    if (err || companyResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.company_id') });
    }

    // Update branch record
    const branchData = { company_id, name, address, latitude, longitude, radius_meters, wallet, city_id, opening_date, state };
    Branch.update(id, branchData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: i18n.__('validation.unique.branch_name') });
        }
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
      res.status(200).json({ message: i18n.__('messages.branch_updated') });
    });
  });
};

// Delete Branch
exports.deleteBranch = (req, res) => {
  const { id } = req.params;

  // Soft delete the branch
  Branch.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json({ message: i18n.__('messages.branch_deleted') });
  });
};

// Increase wallet
exports.increaseWallet = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Branch.increaseWallet(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json({ message: i18n.__('messages.wallet_increased') });
  });
};

// Decrease wallet
exports.decreaseWallet = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Branch.decreaseWallet(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json({ message: i18n.__('messages.wallet_decreased') });
  });
};