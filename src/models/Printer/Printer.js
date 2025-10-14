const db = require('../../config/db');


class Printer {
  static create(data, callback) {
    const query = `INSERT INTO printer (name, branch_id, state, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.branch_id, data.state];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM printer WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM printer WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE printer SET name = ?, branch_id = ?, state = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.branch_id, data.state, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE printer SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Printer;