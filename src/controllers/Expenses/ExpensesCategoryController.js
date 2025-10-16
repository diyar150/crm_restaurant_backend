const ExpenseCategory = require('../../models/Expenses/ExpensesCategory');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Expense Category
exports.createExpenseCategory = (req, res) => {
  const categoryData = req.body;

  // Validate required fields
  if (!categoryData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.expense_category_name') });
  }

  ExpenseCategory.create(categoryData, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_expense_category') });
    res.status(201).json({ message: i18n.__('messages.expense_category_created'), id: result.insertId });
  });
};

// Get All Expense Categories
exports.getAllExpenseCategories = (req, res) => {
  ExpenseCategory.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense_categories') });
    res.status(200).json(results);
  });
};
// Get Filtered Expense Categories
exports.getFilteredExpenseCategories = (req, res) => {
  const filter = req.query;
  ExpenseCategory.fillteredGetAll(filter, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense_categories') });
    res.status(200).json(results);
  });
};

// Get Expense Category by ID
exports.getExpenseCategoryById = (req, res) => {
  const categoryId = req.params.id;
  ExpenseCategory.getById(categoryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense_category') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_category_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update Expense Category
exports.updateExpenseCategory = (req, res) => {
  const categoryId = req.params.id;
  const categoryData = req.body;

  // Validate required fields
  if (!categoryData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.expense_category_name') });
  }

  ExpenseCategory.update(categoryId, categoryData, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_expense_category') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.expense_category_updated') });
  });
};

// Delete Expense Category
exports.deleteExpenseCategory = (req, res) => {
  const categoryId = req.params.id;
  ExpenseCategory.deleteSoft(categoryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_expense_category') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.expense_category_deleted') });
  });
};
