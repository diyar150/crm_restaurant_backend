const Expense = require('../../models/Expenses/Expenses');
const Branch = require('../../models/Branch/Branch');
const i18n = require('../../config/i18nConfig');

// Create Expense
exports.createExpense = async (req, res) => {
  const { category_id, name, amount, note, branch_id, user_id, expense_date,employee_id } = req.body;

  // Validate required fields
  if (!category_id) return res.status(400).json({ error: i18n.__('validation.required.expense_category_id') });
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.expense_name') });
  if (!amount) return res.status(400).json({ error: i18n.__('validation.required.amount') });
  if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  if (!expense_date) return res.status(400).json({ error: i18n.__('validation.required.expense_date') });

  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    const expenseData = {
      category_id,
      name,
      amount: parseFloat(amount),
      note,
      branch_id,
      user_id: user_id || null,
      employee_id: employee_id || null,
      expense_date
    };

    Expense.create(expenseData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: i18n.__('messages.error_creating_expense') });
      }
      // Use numeric amount when adjusting branch wallet
      const numericAmount = parseFloat(amount) || 0;
      Branch.decreaseWallet(branch_id, numericAmount, (err) => {
        if (err) {
          return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
        }
        res.status(201).json({ message: i18n.__('messages.expense_created'), id: result.insertId });
      });
    });
  });
};

// Get All Expenses
exports.getAllExpenses = (req, res) => {
  Expense.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_expenses') });
    }
    res.status(200).json(results);
  });
};

// Get Expense by ID
exports.getExpenseById = (req, res) => {
  const { id } = req.params;
  Expense.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Get Expenses by Filters
exports.getExpensesByFilters = (req, res) => {
  const filters = req.query;

  // Optional: Only block if no filters at all
  if (
    !filters.id &&
    !filters.startDate &&
    !filters.endDate &&
    !filters.category_id &&
    !filters.name &&
    !filters.note &&
    !filters.branch_id &&
    !filters.user_id &&
    !filters.employee_id
  ) {
    return res.status(400).json({ error: i18n.__('validation.required.at_least_one_filter') });
  }

  Expense.getByFilters(filters, (err, data) => {
    if (err) return res.status(500).json({ error: req.__('messages.error_fetching_expenses') });
    res.status(200).json({
      expenses: data.results,
      total: data.total,
    });
  });
};

// Update Expense
exports.updateExpense = (req, res) => {
  const { id } = req.params;
  const { category_id, name, amount, note, branch_id, user_id, expense_date, employee_id } = req.body;

  // Validate required fields
  if (!category_id) return res.status(400).json({ error: i18n.__('validation.required.expense_category_id') });
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.expense_name') });
  if (!amount) return res.status(400).json({ error: i18n.__('validation.required.amount') });
  if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  if (!expense_date) return res.status(400).json({ error: i18n.__('validation.required.expense_date') });

  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Expense.getById(id, (err, existingExpense) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
      if (existingExpense.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

      const oldExpense = existingExpense[0];
      const oldAmount = parseFloat(oldExpense.amount);
      const newAmount = parseFloat(amount);
      const amountDifference = newAmount - oldAmount;

      const expenseData = {
        category_id,
        name,
        amount: newAmount,
        note,
        branch_id,
        user_id: user_id || null,
        employee_id: employee_id || null,
        expense_date
      };

      Expense.update(id, expenseData, (err, result) => {
        if (err) {
          return res.status(500).json({ error: i18n.__('messages.error_updating_expense') });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });
        }
        // Adjust the wallet amount in the branch:
        // if newAmount > oldAmount => decrease wallet by difference
        // if newAmount < oldAmount => increase wallet by abs(difference)
        if (amountDifference > 0) {
          Branch.decreaseWallet(branch_id, amountDifference, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
            res.status(200).json({ message: i18n.__('messages.expense_updated') });
          });
        } else if (amountDifference < 0) {
          Branch.increaseWallet(branch_id, Math.abs(amountDifference), (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
            res.status(200).json({ message: i18n.__('messages.expense_updated') });
          });
        } else {
          res.status(200).json({ message: i18n.__('messages.expense_updated') });
        }
      });
    });
  });
};

// Delete Expense
exports.deleteExpense = (req, res) => {
  const expenseId = req.params.id;
  Expense.getById(expenseId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

    const expenseData = result[0];
    const amount = parseFloat(expenseData.amount);

    Expense.deleteSoft(expenseId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_expense') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

      Branch.increaseWallet(expenseData.branch_id, amount, (err) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
        res.status(200).json({ message: i18n.__('messages.expense_deleted') });
      });
    });
  });
};