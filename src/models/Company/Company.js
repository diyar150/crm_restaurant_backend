const db = require('../../config/db'); // MySQL connection

// Model for interacting with the 'companies' table
class Company {
  static create(data, callback) {
    // There are 8 columns, so we need 8 placeholders
    const query = `INSERT INTO company (name, phone_1, phone_2, address, tagline, logo_1, email, note)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.tagline,
      data.logo_1,
      data.email,
      data.note
    ], callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM company WHERE deleted_at IS NULL'; // Exclude soft-deleted companies
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM company WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted company
    db.query(query, [id], callback);
  }
  static getLastInsertId(callback) {
    const query = 'SELECT MAX(id) AS lastId FROM company';
    db.query(query, (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0].lastId);
    });
  }
 
  static getByName(name, callback) {
    const query = 'SELECT * FROM company WHERE name = ? AND deleted_at IS NULL'; // Exclude soft-deleted company
    db.query(query, [name], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE company SET name = ?, phone_1 = ?, phone_2 = ?, address = ?, tagline = ?, logo_1 = ?, email = ?, note = ?
                   WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.tagline,
      data.logo_1,
      data.email,
      data.note,
      id
    ], callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE company SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }
  
}

module.exports = Company;
