const db = require('../../config/db');

class Appointment {
  static create(data, callback) {
    const query = `INSERT INTO appointments (customer_id, user_id, branch_id, name, description, appointment_date, start_time, end_time, state, note, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.customer_id,
      data.user_id,
      data.branch_id,
      data.name,
      data.description,
      data.appointment_date,
      data.start_time,
      data.end_time,
      data.state,
      data.note
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM appointments WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE appointments SET customer_id = ?, user_id = ?, branch_id = ?, name = ?, description = ?, appointment_date = ?, start_time = ?, end_time = ?, state = ?, note = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.customer_id,
      data.user_id,
      data.branch_id,
      data.name,
      data.description,
      data.appointment_date,
      data.start_time,
      data.end_time,
      data.state,
      data.note,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE appointments SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Appointment;
