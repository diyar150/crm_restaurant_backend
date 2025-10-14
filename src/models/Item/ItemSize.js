const db = require('../../config/db');

class ItemSize {
  static create(data, callback) {
    const query = `INSERT INTO item_size (name, short_symbol, display_order, is_active, created_at, updated_at)
                   VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.name,
      data.short_symbol,
      data.display_order,
      data.is_active
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT id, name, short_symbol, display_order, is_active, created_at, updated_at, deleted_at FROM item_size WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT id, name, short_symbol, display_order, is_active, created_at, updated_at, deleted_at FROM item_size WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static getSizeByItemId(itemId, callback) {
    const query = `SELECT id, name, short_symbol, display_order, is_active, created_at, updated_at, deleted_at FROM item_size WHERE item_id = ? AND deleted_at IS NULL`;
    db.query(query, [itemId], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_size SET name = ?, short_symbol = ?, display_order = ?, is_active = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.name,
      data.short_symbol,
      data.display_order,
      data.is_active,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_size SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemSize;