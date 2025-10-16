const db = require('../../config/db');

class SellItem {
  // Create a new sell item
  static create(data, callback) {
    const query = `
      INSERT INTO sell_item (
        invoice_id, item_id, item_unit_id, quantity, base_quantity, unit_price, total_amount, discount_amount, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.invoice_id,
      data.item_id,
      data.item_unit_id,
      data.quantity,
      data.base_quantity,
      data.unit_price,
      data.total_amount,
      data.discount_amount,
    ];
    db.query(query, values, callback);
  }

  // Get a sell item by ID
  static getById(id, callback) {
    const query = `
      SELECT si.*, i.name AS item_name, iu.name AS unit_name
      FROM sell_item si
      LEFT JOIN item i ON si.item_id = i.id
      LEFT JOIN item_unit iu ON si.item_unit_id = iu.id
      WHERE si.id = ? AND si.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  // Get all sell items by invoice ID
  static getAllByInvoiceId(invoice_id, callback) {
    const query = `
      SELECT si.*, i.barcode AS item_barcode, i.name AS item_name, iu.name AS unit_name
      FROM sell_item si
      LEFT JOIN item i ON si.item_id = i.id
      LEFT JOIN item_unit iu ON si.item_unit_id = iu.id
      WHERE si.invoice_id = ? AND si.deleted_at IS NULL
    `;
    db.query(query, [invoice_id], callback);
  }

  // Update a sell item
  static update(id, data, callback) {
    const query = `
      UPDATE sell_item
      SET invoice_id = ?, item_id = ?, item_unit_id = ?, quantity = ?, base_quantity = ?, unit_price = ?, total_amount = ?, discount_amount = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      data.invoice_id,
      data.item_id,
      data.item_unit_id,
      data.quantity,
      data.base_quantity,
      data.unit_price,
      data.total_amount,
      data.discount_amount,
      id,
    ];
    db.query(query, values, callback);
  }

  // Soft delete a sell item
  static deleteSoft(id, callback) {
    const query = `
      UPDATE sell_item
      SET deleted_at = NOW()
      WHERE id = ?
    `;
    db.query(query, [id], callback);
  }
}

module.exports = SellItem;