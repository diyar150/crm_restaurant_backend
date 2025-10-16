const db = require('../../config/db');

class User {
 static create(data, callback) {
    const query = `INSERT INTO users (name, username, phone, image, branch_id, is_system_user, is_agent, password, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.name,
      data.username,
      data.phone,
      data.image,
      data.branch_id,
      data.is_system_user,
      data.is_agent || 0,
      data.password || null,
      data.salary || 0
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM users WHERE deleted_at IS NULL'; // Exclude soft-deleted users
    db.query(query, callback);
  }

   static filter = (search, callback) => {
    const query = `
      SELECT users.*, branch.name AS branch_name
      FROM users
      LEFT JOIN branch ON users.branch_id = branch.id
      WHERE users.deleted_at IS NULL AND (
         users.name LIKE ? 
      OR users.username LIKE ? 
      OR users.phone LIKE ? 
      OR branch.name LIKE ?
    )`;
    const like = `%${search}%`;
    db.query(query, [like, like, like, like], callback);
  };




  static getById(id, callback) {
    const query = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted users
    db.query(query, [id], callback);
  }
   static getAllAgents(callback) {
    const query = 'SELECT * FROM users WHERE is_agent = 1 AND deleted_at IS NULL';
    db.query(query, callback);
  }

  static getByUsername(username, callback) {
    const query = 'SELECT * FROM users WHERE username = ? AND deleted_at IS NULL'; // Exclude soft-deleted users
    db.query(query, [username], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE users SET name = ?, username = ?, phone = ?, image = ?, branch_id = ?, password = ?, is_system_user = ?, is_agent = ?, salary = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [
      data.name,
      data.username,
      data.phone,
      data.image,
      data.branch_id,
      data.password,
      data.is_system_user,
      data.is_agent || 0,
      data.salary !== undefined ? data.salary : 0,
      id
    ], callback);
  }

  static delete(id, callback) {
    const query = `UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }
}

module.exports = User;