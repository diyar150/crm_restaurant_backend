const db = require('../../config/db');


class City {
  static create(data, callback) {
    const query = `INSERT INTO city (name, description, state, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.description, data.state];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM city WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM city WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE city SET name = ?, description = ?, state = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, data.state, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE city SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = City;