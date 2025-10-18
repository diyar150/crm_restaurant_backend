const db = require('../../config/db');

class Branch {


  static create(data, callback) {
    const query = `INSERT INTO branch (company_id, name, address, latitude, longitude, radius_meters, wallet, city_id, state, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.company_id,
      data.name,
      data.address,
      data.latitude,
      data.longitude,
      data.radius_meters || 0,
      data.wallet || 0,
      data.city_id,
      data.state
    ];
    db.query(query, values, callback);
  }


  static getAll(callback) {
    const query = `
      SELECT 
        branch.*, 
        city.name AS city_name, 
        company.name AS company_name
      FROM branch
      LEFT JOIN city ON branch.city_id = city.id
      LEFT JOIN company ON branch.company_id = company.id
      WHERE branch.deleted_at IS NULL
    `;
    db.query(query, callback);
  }
    

  static getById(id, callback) {
    const query = `
      SELECT 
        branch.*, 
        city.name AS city_name, 
        company.name AS company_name
      FROM branch
      LEFT JOIN city ON branch.city_id = city.id
      LEFT JOIN company ON branch.company_id = company.id
      WHERE branch.id = ? AND branch.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE branch SET company_id = ?, name = ?, address = ?, latitude = ?, longitude = ?, radius_meters = ?, wallet = ?, city_id = ?, state = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.company_id,
      data.name,
      data.address,
      data.latitude,
      data.longitude,
      data.radius_meters || 0,
      data.wallet || 0,
      data.city_id,
      data.state,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE branch SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }


  static increaseWallet(id, amount, callback) {
    const query = `UPDATE branch SET wallet = wallet + ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static decreaseWallet(id, amount, callback) {
    const query = `UPDATE branch SET wallet = wallet - ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static filter(filters, callback) {
    let query = `
      SELECT 
        branch.*, 
        city.name AS city_name, 
        company.name AS company_name
      FROM branch
      LEFT JOIN city ON branch.city_id = city.id
      LEFT JOIN company ON branch.company_id = company.id
      WHERE branch.deleted_at IS NULL
    `;
    const values = [];

    // Apply filters
    if (filters.id) {
      query += ` AND branch.id = ?`;
      values.push(filters.id);
    }
    if (filters.branch_name) {
      query += ` AND branch.name LIKE ?`;
      values.push(`%${filters.branch_name}%`);
    }
    if (filters.city_id) {
      query += ` AND branch.city_id = ?`;
      values.push(filters.city_id);
    }
    if (filters.company_id) {
      query += ` AND branch.company_id = ?`;
      values.push(filters.company_id);
    }

    // Sorting
    const sortBy = filters.sortBy || 'id';
    const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY branch.${sortBy} ${sortOrder}`;

    // Pagination
    if (filters.page && filters.pageSize) {
      const offset = (filters.page - 1) * filters.pageSize;
      query += ` LIMIT ? OFFSET ?`;
      values.push(parseInt(filters.pageSize), parseInt(offset));
    }

    db.query(query, values, (err, results) => {
      if (err) return callback(err);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM branch
        LEFT JOIN city ON branch.city_id = city.id
        LEFT JOIN company ON branch.company_id = company.id
        WHERE branch.deleted_at IS NULL
      `;
      const countValues = [];

      if (filters.id) {
        countQuery += ` AND branch.id = ?`;
        countValues.push(filters.id);
      }
      if (filters.branch_name) {
        countQuery += ` AND branch.name LIKE ?`;
        countValues.push(`%${filters.branch_name}%`);
      }
      if (filters.city_id) {
        countQuery += ` AND branch.city_id = ?`;
        countValues.push(filters.city_id);
      }
      if (filters.company_id) {
        countQuery += ` AND branch.company_id = ?`;
        countValues.push(filters.company_id);
      }

      db.query(countQuery, countValues, (err2, countResult) => {
        if (err2) return callback(err2);
        callback(null, {
          results,
          total: countResult[0].total
        });
      });
    });
  }

  
}

module.exports = Branch;