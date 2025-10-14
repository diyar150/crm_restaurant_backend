const db = require('../../config/db');

const CustomerPayment = {
  
  create: (data, callback) => {
    const query = `INSERT INTO payment (
      customer_id, type, loan, amount, discount_type, discount_value, discount_result, result,
      employee_id, payment_method, reference_number, user_id, branch_id, note, payment_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.customer_id, data.type, data.loan, data.amount, data.discount_type, data.discount_value, data.discount_result, data.result,
      data.employee_id, data.payment_method, data.reference_number, data.user_id, data.branch_id, data.note, data.payment_date
    ];
    db.query(query, values, callback);
  },
  getById: (id, callback) => {
    const query = `SELECT id, customer_id, type, loan, amount, discount_type, discount_value, discount_result, result, employee_id, payment_method, reference_number, user_id, branch_id, note, payment_date, created_at, updated_at, deleted_at FROM payment WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  },
  filter: (filters, callback) => {
    let query = `SELECT id, customer_id, type, loan, amount, discount_type, discount_value, discount_result, result, employee_id, payment_method, reference_number, user_id, branch_id, note, payment_date, created_at, updated_at, deleted_at FROM payment WHERE deleted_at IS NULL AND payment_date BETWEEN ? AND ?`;
    const params = [filters.startDate, filters.endDate];

    if (filters.customer_id) {
      query += ` AND customer_id = ?`;
      params.push(filters.customer_id);
    }
    if (filters.employee_id) {
      query += ` AND employee_id = ?`;
      params.push(filters.employee_id);
    }
    if (filters.branch_id) {
      query += ` AND branch_id = ?`;
      params.push(filters.branch_id);
    }
    if (filters.payment_method) {
      query += ` AND payment_method = ?`;
      params.push(filters.payment_method);
    }
    if (filters.type) {
      query += ` AND type = ?`;
      params.push(filters.type);
    }
    if (filters.reference_number) {
      query += ` AND reference_number = ?`;
      params.push(filters.reference_number);
    }
    if (filters.user_id) {
      query += ` AND user_id = ?`;
      params.push(filters.user_id);
    }

    // Add sorting if needed
    if (filters.sortBy) {
      query += ` ORDER BY ${filters.sortBy} ${filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    }

    // Add pagination if needed
    if (filters.page && filters.pageSize) {
      const offset = (filters.page - 1) * filters.pageSize;
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(filters.pageSize), Number(offset));
    }

    db.query(query, params, callback);
  },
  update: (id, data, callback) => {
    const query = `UPDATE payment SET
      customer_id = ?, type = ?, loan = ?, amount = ?, discount_type = ?, discount_value = ?, discount_result = ?, result = ?,
      employee_id = ?, payment_method = ?, reference_number = ?, user_id = ?, branch_id = ?, note = ?, payment_date = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.customer_id, data.type, data.loan, data.amount, data.discount_type, data.discount_value, data.discount_result, data.result,
      data.employee_id, data.payment_method, data.reference_number, data.user_id, data.branch_id, data.note, data.payment_date,
      id
    ];
    db.query(query, values, callback);
  },
  deleteSoft: (id, callback) => {
    const query = `UPDATE payment SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  },
  getAll: (callback) => {
    const query = `SELECT id, customer_id, type, loan, amount, discount_type, discount_value, discount_result, result, employee_id, payment_method, reference_number, user_id, branch_id, note, payment_date, created_at, updated_at, deleted_at FROM payment WHERE deleted_at IS NULL`;
    db.query(query, callback);
  },
};

module.exports = CustomerPayment;