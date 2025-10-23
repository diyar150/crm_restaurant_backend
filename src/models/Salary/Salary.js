const db = require('../../config/db');

class Salary {
     static create(data, callback) {
    const query = `INSERT INTO salary (employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.employee_id,
      data.amount,
      data.salary_period_start,
      data.salary_period_end,
      data.note,
      data.user_id,
      data.branch_id
    ];
    db.query(query, values, callback);
  }

    static getAll(callback) {
      const query = `SELECT id, employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id, created_at, updated_at, deleted_at FROM salary WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
      const query = `SELECT id, employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id, created_at, updated_at, deleted_at FROM salary WHERE id = ? AND deleted_at IS NULL`;
      db.query(query, [id], callback);
  }

static filterByParams(filters, callback) {
  let query = `SELECT SQL_CALC_FOUND_ROWS
    s.id, s.employee_id, s.amount, s.salary_period_start, s.salary_period_end, s.note, s.user_id, s.branch_id, s.created_at, s.updated_at, s.deleted_at,
    b.name AS branch_name, u.name AS employee_name
    FROM salary s
    LEFT JOIN branch b ON s.branch_id = b.id
    LEFT JOIN users u ON s.employee_id = u.id
    WHERE s.deleted_at IS NULL`;
  const values = [];

  // Date range filter (salary_period_start)
  if (filters.startDate && filters.endDate) {
    query += ` AND s.salary_period_start BETWEEN ? AND ?`;
    values.push(filters.startDate, filters.endDate);
  }

  // Employee filter
  if (filters.employee_id) {
    query += ` AND s.employee_id = ?`;
    values.push(filters.employee_id);
  }

  // Branch filter
  if (filters.branch_id) {
    query += ` AND s.branch_id = ?`;
    values.push(filters.branch_id);
  }

  // Sorting
  let sortBy = filters.sortBy || 's.id';
  let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const allowedSortFields = [
    's.id', 's.salary_period_start', 's.amount', 's.employee_id', 's.branch_id'
  ];
  if (!allowedSortFields.includes(sortBy)) sortBy = 's.id';

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


  static update(id, data, callback) {
    const query = `UPDATE salary SET employee_id = ?, amount = ?, salary_period_start = ?, salary_period_end = ?, note = ?, user_id = ?, branch_id = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.employee_id,
      data.amount,
      data.salary_period_start,
      data.salary_period_end,
      data.note,
      data.user_id,
      data.branch_id,

      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE salary SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Salary;