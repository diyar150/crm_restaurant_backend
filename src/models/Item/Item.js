const db = require('../../config/db');

class Item {

  static create(data, callback) {
    const query = `INSERT INTO item (category_id, name, description, printer_id, is_available, image, branch_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.category_id || 0,
      data.name,
      data.description,
      data.printer_id,
      data.is_available,
      data.image,
      data.branch_id
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `
      SELECT 
        item.*,
        category.name AS category_name,
        branch.name AS branch_name
      FROM item
      LEFT JOIN category ON item.category_id = category.id
      LEFT JOIN branch ON item.branch_id = branch.id
      WHERE item.deleted_at IS NULL
      ORDER BY item.id DESC
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT 
        item.*,
        category.name AS category_name,
        branch.name AS branch_name
      FROM item
      LEFT JOIN category ON item.category_id = category.id
      LEFT JOIN branch ON item.branch_id = branch.id
      WHERE item.id = ? AND item.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  static getByFilters(filters, callback) {
    let query = `
      SELECT SQL_CALC_FOUND_ROWS
        item.*,
        category.name AS category_name,
        branch.name AS branch_name
      FROM item
      LEFT JOIN category ON item.category_id = category.id
      LEFT JOIN branch ON item.branch_id = branch.id
      WHERE item.deleted_at IS NULL
    `;
    const values = [];

    // Apply filters
    if (filters.id) {
      query += ` AND item.id = ?`;
      values.push(filters.id);
    }
    if (filters.name) {
      query += ` AND item.name LIKE ?`;
      values.push(`%${filters.name}%`);
    }
    if (filters.category_id) {
      query += ` AND item.category_id = ?`;
      values.push(filters.category_id);
    }
    if (filters.branch_id) {
      query += ` AND item.branch_id = ?`;
      values.push(filters.branch_id);
    }
    if (filters.is_available !== undefined) {
      query += ` AND item.is_available = ?`;
      values.push(filters.is_available);
    }

    // Sorting
    const sortBy = filters.sortBy || 'id';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const allowedSortFields = ['id', 'name', 'category_id', 'branch_id', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    query += ` ORDER BY item.${safeSortBy} ${sortOrder}`;

    // Pagination
    let limit = 20, offset = 0;
    if (filters.pageSize) {
      limit = parseInt(filters.pageSize, 10) || 20;
    }
    if (filters.page) {
      offset = (parseInt(filters.page, 10) - 1) * limit;
    }
    query += ` LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    db.query(query, values, (err, results) => {
      if (err) return callback(err);
      
      // Get total count
      db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
        if (err2) return callback(err2);
        callback(null, { 
          results, 
          total: totalRows[0].total 
        });
      });
    });
  }

  static autocompleteSearch(q, limit = 30, callback) {
    const query = `
      SELECT 
        item.id, 
        item.name, 
        item.description,
        branch.name AS branch_name
      FROM item
      LEFT JOIN branch ON item.branch_id = branch.id
      WHERE item.deleted_at IS NULL
        AND (item.name LIKE ? OR item.description LIKE ?)
      ORDER BY item.id DESC
      LIMIT ?
    `;
    const like = `%${q}%`;
    db.query(query, [like, like, Number(limit)], callback);
  }

  static getWithSizes(itemId, callback) {
    const itemQuery = `
      SELECT 
        item.*,
        category.name AS category_name,
        branch.name AS branch_name
      FROM item
      LEFT JOIN category ON item.category_id = category.id
      LEFT JOIN branch ON item.branch_id = branch.id
      WHERE item.id = ? AND item.deleted_at IS NULL
    `;
    
    db.query(itemQuery, [itemId], (err, itemResults) => {
      if (err) return callback(err);
      if (!itemResults.length) return callback(null, []);
      
      const item = { ...itemResults[0], sizes: [] };
      
      // Get all sizes
      const sizeQuery = 'SELECT id, name, short_symbol, display_order, is_active FROM item_size WHERE deleted_at IS NULL ORDER BY display_order';
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
    const query = `UPDATE item 
                   SET category_id = ?, name = ?, description = ?, printer_id = ?, is_available = ?, image = ?, branch_id = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.category_id || 0,
      data.name,
      data.description,
      data.printer_id,
      data.is_available,
      data.image,
      data.branch_id,
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