const Salary = require('../../models/Salary/Salary');
const Branch = require('../../models/Branch/Branch');
const Employee = require('../../models/User/User');
const i18n = require('../../config/i18nConfig');
// Salary model does not store currency/exchange_rate; amounts are treated as base currency

// Create Salary
exports.createSalary = (req, res) => {
  const salaryData = req.body;
  salaryData.amount = Number(salaryData.amount);

  // Validate required fields
  if (!salaryData.employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  if (!salaryData.amount || isNaN(salaryData.amount)) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!salaryData.branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }


  Branch.getById(salaryData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Employee.getById(salaryData.employee_id, async (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      // Amount is already in base currency (no currency conversion in model)
      Salary.create(salaryData, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: i18n.__('messages.error_creating_salary') });
        }

        // Decrease branch wallet by the salary amount
        Branch.decreaseWallet(salaryData.branch_id, Number(salaryData.amount), (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
          }
          res.status(201).json({ message: i18n.__('messages.salary_created'), id: result.insertId });
        });
      });
    });
  });
};

// Get All Salaries
exports.getAllSalaries = (req, res) => {
  Salary.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salaries') });
    res.status(200).json(results);
  });
};

// Get Salary by ID
exports.getSalaryById = (req, res) => {
  const salaryId = req.params.id;
  Salary.getById(salaryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });
    res.status(200).json(result[0]);
  });
};

// Filter Salaries
exports.filterSalaries = (req, res) => {
  const { startDate, endDate, employee_id, branch_id, sortBy, sortOrder, page, pageSize } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  const filters = {
    startDate,
    endDate,
    employee_id,
    branch_id,
    sortBy,
    sortOrder,
    page,
    pageSize
  };

  Salary.filterByParams(filters, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salaries') });
    res.status(200).json({
      message: i18n.__('messages.salaries_found', { count: result.results.length }),
      salaries: result.results,
      total: result.total
    });
  });
};

// Update Salary
exports.updateSalary = (req, res) => {
  const { id } = req.params;
  const { employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id } = req.body;

  // Validate required fields
  if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }


  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Employee.getById(employee_id, (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      Salary.getById(id, (err, existingSalary) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
        if (existingSalary.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

        const oldSalary = existingSalary[0];
        const oldBranchId = oldSalary.branch_id;
        const newBranchId = branch_id;

        // No currency conversion; use stored and provided amounts directly
        const oldAmount = parseFloat(oldSalary.amount);
        const newAmount = parseFloat(amount);

        const salaryData = {
          employee_id,
          amount: Number(amount),
          salary_period_start,
          salary_period_end,
          note,
          user_id,
          branch_id
        };

        Salary.update(id, salaryData, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: i18n.__('messages.error_updating_salary') });
          }
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

          if (oldBranchId !== newBranchId) {
            // Increase old branch wallet by oldAmount, decrease new branch wallet by newAmount
            Branch.increaseWallet(oldBranchId, oldAmount, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
              Branch.decreaseWallet(newBranchId, newAmount, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                res.status(200).json({ message: i18n.__('messages.salary_updated') });
              });
            });
          } else {
            // Only adjust the difference
            const amountDifference = newAmount - oldAmount;
            if (amountDifference !== 0) {
              // If difference > 0, decrease wallet; if < 0, increase wallet
              if (amountDifference > 0) {
                Branch.decreaseWallet(newBranchId, amountDifference, (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                  res.status(200).json({ message: i18n.__('messages.salary_updated') });
                });
              } else {
                Branch.increaseWallet(newBranchId, Math.abs(amountDifference), (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                  res.status(200).json({ message: i18n.__('messages.salary_updated') });
                });
              }
            } else {
              res.status(200).json({ message: i18n.__('messages.salary_updated') });
            }
          }
        });
      });
    });
  });
};

// Delete Salary
exports.deleteSalary = (req, res) => {
  const salaryId = req.params.id;
  Salary.getById(salaryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

    const salaryData = result[0];

    // Amount is stored as base currency
    const amountInBase = parseFloat(salaryData.amount);

    Salary.deleteSoft(salaryId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_salary') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

      Branch.increaseWallet(salaryData.branch_id, amountInBase, (err) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
        res.status(200).json({ message: i18n.__('messages.salary_deleted') });
      });
    });
  });
};