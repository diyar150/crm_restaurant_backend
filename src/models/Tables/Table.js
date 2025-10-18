const db = require('../../config/db');


class Table {
  static create(data, callback) {
    const query = `INSERT INTO tables (branch_id, table_number, capacity, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`;
    const values = [data.branch_id, data.table_number, data.capacity];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT id, branch_id, table_number, capacity, state, created_at, updated_at, deleted_at FROM tables WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT id, branch_id, table_number, capacity, state, created_at, updated_at, deleted_at FROM tables WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE tables SET branch_id = ?, table_number = ?, capacity = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.branch_id, data.table_number, data.capacity, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE tables SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Table;