const db = require('../../config/db');

class Item {


  static create(data, callback) {
    const query = `INSERT INTO item (category_id, name, description, printer_id, is_available, image, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.category_id,
      data.name,
      data.description,
      data.printer_id,
      data.is_available,
      data.image
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT id, category_id, name, description, printer_id, is_available, image, created_at, updated_at, deleted_at FROM item WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static autocompleteSearch(q, limit = 30, callback) {
    const query = `
      SELECT id, name, description
      FROM item
      WHERE deleted_at IS NULL
        AND (name LIKE ? OR description LIKE ?)
      ORDER BY id DESC
      LIMIT ?
    `;
    const like = `%${q}%`;
    db.query(query, [like, like, Number(limit)], callback);
  }

  static getById(id, callback) {
    const query = 'SELECT id, category_id, name, description, printer_id, is_available, image, created_at, updated_at, deleted_at FROM item WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  // get item with sizes
   static getWithSizes(itemId, callback) {
    // First, get the item
    const itemQuery = 'SELECT id, category_id, name, description, printer_id, is_available, image, created_at, updated_at, deleted_at FROM item WHERE id = ? AND deleted_at IS NULL';
    db.query(itemQuery, [itemId], (err, itemResults) => {
      if (err) return callback(err);
      if (!itemResults.length) return callback(null, []);
      const item = {
        id: itemResults[0].id,
        category_id: itemResults[0].category_id,
        name: itemResults[0].name,
        description: itemResults[0].description,
        printer_id: itemResults[0].printer_id,
        is_available: itemResults[0].is_available,
        image: itemResults[0].image,
        created_at: itemResults[0].created_at,
        updated_at: itemResults[0].updated_at,
        deleted_at: itemResults[0].deleted_at,
        sizes: []
      };
      // Now get all sizes (no item_id relation)
      const sizeQuery = 'SELECT id, name, short_symbol, display_order, is_active FROM item_size WHERE deleted_at IS NULL';
      db.query(sizeQuery, (err, sizeResults) => {
        if (err) return callback(err);
        item.sizes = sizeResults.map(row => ({
          id: row.id,
          name: row.name,
          short_symbol: row.short_symbol,
          display_order: row.display_order,
          is_active: row.is_active
        }));
        callback(null, [item]);
      });
    });
  }


  static update(id, data, callback) {
    const query = `UPDATE item SET category_id = ?, name = ?, description = ?, printer_id = ?, is_available = ?, image = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.category_id,
      data.name,
      data.description,
      data.printer_id,
      data.is_available,
      data.image,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

}

module.exports = Item;