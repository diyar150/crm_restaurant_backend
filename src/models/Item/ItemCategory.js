const db = require('../../config/db');

class ItemCategory {
  static create(data, callback) {
    const query = `INSERT INTO item_category (name, description, created_at, updated_at)
                   VALUES (?, ?, NOW(), NOW())`;
    db.query(query, [data.name, data.description || null], callback);
  }

  static getAll(callback) {
    const query = `SELECT id, name, description FROM item_category WHERE deleted_at IS NULL ORDER BY id DESC`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT id, name, description FROM item_category WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_category SET name = ?, description = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [data.name, data.description || null, id], callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_category SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemCategory;