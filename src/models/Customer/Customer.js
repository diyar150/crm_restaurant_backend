const db = require('../../config/db');

// Model for interacting with the 'Customer' table
class Customer {

  static create(data, callback) {
    const query = `INSERT INTO customer (category_id, name, phone_1, phone_2, address, loan, note, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.category_id,
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.loan || 0,
      data.note || ''
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT id, category_id, name, phone_1, phone_2, address, loan, note, created_at, updated_at, deleted_at FROM customer WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static autocompleteSearch(q, limit = 30, callback) {
    const query = `
      SELECT id, name, phone_1, phone_2
      FROM customer
      WHERE deleted_at IS NULL
        AND (name LIKE ? OR phone_1 LIKE ? OR phone_2 LIKE ?)
      ORDER BY id DESC
      LIMIT ?
    `;
    const like = `%${q}%`;
    db.query(query, [like, like, like, Number(limit)], callback);
  }

  static getById(id, callback) {
    const query = 'SELECT id, category_id, name, phone_1, phone_2, address, loan, note, created_at, updated_at, deleted_at FROM customer WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }
 
  static filter({
    page = 1,
    pageSize = 10,
    sortBy = 'id',
    sortOrder = 'asc',
    search,
    category_id,
    loan_positive = false,
    loan_negative = false,
    loan_zero = false
  }, callback) {
    let query = `SELECT id, category_id, name, phone_1, phone_2, address, loan, note, created_at, updated_at, deleted_at FROM customer WHERE deleted_at IS NULL`;
    const params = [];
    if (category_id) { query += ` AND category_id = ?`; params.push(Number(category_id)); }
    if (loan_positive) query += ` AND loan > 0`;
    if (loan_negative) query += ` AND loan < 0`;
    if (loan_zero) query += ` AND loan = 0`;
    if (search) {
      query += ` AND (name LIKE ? OR phone_1 LIKE ? OR phone_2 LIKE ?)`;
      for (let i = 0; i < 3; i++) params.push(`%${search}%`);
    }
    query += ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), Number(offset));
    db.query(query, params, callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE customer SET category_id = ?, name = ?, phone_1 = ?, phone_2 = ?, address = ?, loan = ?, note = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.category_id,
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.loan || 0,
      data.note || '',
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE customer SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static increaseLoan(id, amount, callback) {
    const query = `UPDATE customer SET loan = loan + ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static decreaseLoan(id, amount, callback) {
    const query = `UPDATE customer SET loan = loan - ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static getLoan(id, callback) {
    const query = 'SELECT loan FROM customer WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }
  
}

module.exports = Customer;