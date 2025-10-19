const db = require('../../config/db');


class CompanyDelivery {
  static create(data, callback) {
    const query = `INSERT INTO company_delivery (name, type, amount,note, created_at, updated_at)
                   VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.type, data.amount, data.note];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM company_delivery WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM company_delivery WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE company_delivery SET name = ?, type = ?, amount = ?, note = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.type, data.amount, data.note, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE company_delivery SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }
}

module.exports = CompanyDelivery;