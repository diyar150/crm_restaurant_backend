const db = require('../../config/db');

// Model for interacting with the 'Warehouse' table
class CustomerCatergory {

  static create(data, callback) {
    
    const query = `INSERT INTO customer_category (name)
                   VALUES (?)`;
    db.query(query, [
      data.name,
    ], callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM customer_category WHERE deleted_at IS NULL'; // Exclude soft-deleted companies
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM customer_category WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted company
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {

    const query = `UPDATE customer_category SET name = ?
                   WHERE id = ? AND deleted_at IS NULL`; // Ensure the company is not soft-deleted
    db.query(query, [
      data.name,
      id
    ], callback);

  }

  static deleteSoft(id, callback) {
    const query = `UPDATE customer_category SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }
  
}

module.exports = CustomerCatergory;
