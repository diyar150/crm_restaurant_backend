const db = require('../../config/db');

class Expense {
  static create(data, callback) {
    const query = `INSERT INTO expenses (category_id, name, amount, note, branch_id, user_id, expense_date, employee_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.category_id,
      data.name,
      data.amount,
      data.note,
      data.branch_id,
      data.user_id,
      data.expense_date,
      data.employee_id
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT id, category_id, name, amount, note, branch_id, user_id, expense_date, employee_id, created_at, updated_at, deleted_at FROM expenses WHERE deleted_at IS NULL ORDER BY id DESC`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT id, category_id, name, amount, note, branch_id, user_id, expense_date, employee_id, created_at, updated_at, deleted_at FROM expenses WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE expenses SET category_id = ?, name = ?, amount = ?, note = ?, branch_id = ?, user_id = ?, expense_date = ?, employee_id = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.category_id,
      data.name,
      data.amount,
      data.note,
      data.branch_id,
      data.user_id,
      data.expense_date,
      data.employee_id,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE expenses SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

  static getByFilters(filters, callback) {
    let query = `SELECT SQL_CALC_FOUND_ROWS id, category_id, name, amount, note, branch_id, user_id, expense_date, employee_id, created_at, updated_at, deleted_at FROM expenses WHERE deleted_at IS NULL`;
    const values = [];

    // Filter by id (if present, ignore other filters)
    if (filters.id) {
      query += ` AND id = ?`;
      values.push(filters.id);
    } else {
      // Date range filter
      if (filters.startDate && filters.endDate) {
        query += ` AND expense_date BETWEEN ? AND ?`;
        values.push(filters.startDate, filters.endDate);
      }
      // Category filter
      if (filters.category_id) {
        query += ` AND category_id = ?`;
        values.push(filters.category_id);
      }
      // Branch filter
      if (filters.branch_id) {
        query += ` AND branch_id = ?`;
        values.push(filters.branch_id);
      }
      // User filter
      if (filters.user_id) {
        query += ` AND user_id = ?`;
        values.push(filters.user_id);
      }
      // Employee filter
      if (filters.employee_id) {
        query += ` AND employee_id = ?`;
        values.push(filters.employee_id);
      }
      // Name or note search (OR logic)
      const orConditions = [];
      const orValues = [];
      if (filters.name) {
        orConditions.push(`name LIKE ?`);
        orValues.push(`%${filters.name}%`);
      }
      if (filters.note) {
        orConditions.push(`note LIKE ?`);
        orValues.push(`%${filters.note}%`);
      }
      if (orConditions.length > 0) {
        query += ` AND (${orConditions.join(' OR ')})`;
        values.push(...orValues);
      }
    }

    // Sorting
    let sortBy = filters.sortBy || 'id';
    let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Whitelist allowed columns to prevent SQL injection
    const allowedSortFields = [
      'id', 'expense_date', 'amount', 'name', 'category_id', 'branch_id', 'user_id', 'employee_id', 'created_at', 'updated_at'
    ];
    if (!allowedSortFields.includes(sortBy)) sortBy = 'id';

    // Pagination
    let limit = 10, offset = 0;
    if (filters.pageSize) {
      limit = parseInt(filters.pageSize, 10);
    }
    if (filters.page) {
      offset = (parseInt(filters.page, 10) - 1) * limit;
    }

    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    db.query(query, values, (err, results) => {
      if (err) return callback(err);
      db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
        if (err2) return callback(err2);
        callback(null, { results, total: totalRows[0].total });
      });
    });
  }

}

module.exports = Expense;