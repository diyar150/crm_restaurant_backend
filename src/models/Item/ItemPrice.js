const db = require('../../config/db');

class ItemPrice {
  static create(data, callback) {
    const query = `INSERT INTO item_price (item_id, size_id, cost, price, tax_rate, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.item_id, data.size_id, data.cost, data.price, data.tax_rate];
    db.query(query, values, callback);
  }

  static getAll(itemId, callback) {
    let query = 'SELECT id, item_id, size_id, cost, price, tax_rate, created_at, updated_at, deleted_at FROM item_price WHERE deleted_at IS NULL';
    let values = [];
    if (itemId) {
      query += ' AND item_id = ?';
      values.push(itemId);
    }
    db.query(query, values, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT id, item_id, size_id, cost, price, tax_rate, created_at, updated_at, deleted_at FROM item_price WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_price SET item_id = ?, size_id = ?, cost = ?, price = ?, tax_rate = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.item_id, data.size_id, data.cost, data.price, data.tax_rate, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_price SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemPrice;