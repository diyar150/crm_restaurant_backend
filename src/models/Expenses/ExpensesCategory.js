const db = require('../../config/db');

class ExpenseCategory {
  static create(data, callback) {
    const query = `INSERT INTO expenses_category (name, note) VALUES (?, ?)`;
    const values = [data.name, data.description];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM expenses_category WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static fillteredGetAll(filter, callback) {
    let query = `SELECT * FROM expenses_category WHERE deleted_at IS NULL`;
    const values = [];

    if (filter.name) {
      query += ` AND name LIKE ?`;
      values.push(`%${filter.name}%`);
    }

    db.query(query, values, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM expenses_category WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE expenses_category SET name = ?, note = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE expenses_category SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ExpenseCategory;