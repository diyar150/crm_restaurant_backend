const db = require('../../config/db');

class Appointment {

  static create(data, callback) {
  const query = `INSERT INTO appointments (customer_name,customer_phone,employee_id,user_id, branch_id, name, table_id, appointment_date, start_time, end_time, note, created_at, updated_at)
           VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.customer_name,
      data.customer_phone,
      data.employee_id,
      data.user_id,
      data.branch_id,
      data.name,
      data.table_id,
      data.appointment_date,
      data.start_time,
      data.end_time,
      data.note
    ];
    db.query(query, values, callback);
  }

   static getAll(callback) {
    const query = `
      SELECT 
        a.id, 
        a.customer_name, 
        a.customer_phone, 
        a.employee_id, 
        a.user_id, 
        a.branch_id, 
        a.name, 
        a.table_id, 
        a.appointment_date, 
        a.start_time, 
        a.end_time, 
        a.note, 
        a.created_at, 
        a.updated_at, 
        a.deleted_at,
        t.table_number,
        t.capacity as table_capacity
      FROM appointments a
      LEFT JOIN tables t ON a.table_id = t.id
      WHERE a.deleted_at IS NULL
      ORDER BY a.id DESC
    `;
    db.query(query, callback);
  }

   static getById(id, callback) {
    const query = `
      SELECT 
        a.id, 
        a.customer_name, 
        a.customer_phone, 
        a.employee_id, 
        a.user_id, 
        a.branch_id, 
        a.name, 
        a.table_id, 
        a.appointment_date, 
        a.start_time, 
        a.end_time, 
        a.note, 
        a.created_at, 
        a.updated_at, 
        a.deleted_at,
        t.table_number,
        t.capacity as table_capacity
      FROM appointments a
      LEFT JOIN tables t ON a.table_id = t.id
      WHERE a.id = ? AND a.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

    static getByFilters(filters, callback) {
    let query = `
      SELECT SQL_CALC_FOUND_ROWS 
        a.id, 
        a.customer_name, 
        a.customer_phone, 
        a.employee_id, 
        a.user_id, 
        a.branch_id, 
        a.name, 
        a.table_id, 
        a.appointment_date, 
        a.start_time, 
        a.end_time, 
        a.note, 
        a.created_at, 
        a.updated_at, 
        a.deleted_at,
        t.table_number,
        t.capacity as table_capacity
      FROM appointments a
      LEFT JOIN tables t ON a.table_id = t.id
      WHERE a.deleted_at IS NULL
    `;
    const values = [];

    // If id provided, filter by id only
    if (filters.id) {
      query += ` AND a.id = ?`;
      values.push(filters.id);
    } else {
      // Date range filter
      if (filters.startDate && filters.endDate) {
        query += ` AND a.appointment_date BETWEEN ? AND ?`;
        values.push(filters.startDate, filters.endDate);
      }

      // Branch filter
      if (filters.branch_id) {
        query += ` AND a.branch_id = ?`;
        values.push(filters.branch_id);
      }

      // Employee filter
      if (filters.employee_id) {
        query += ` AND a.employee_id = ?`;
        values.push(filters.employee_id);
      }

      // Table filter
      if (filters.table_id) {
        query += ` AND a.table_id = ?`;
        values.push(filters.table_id);
      }

      // Search filters (OR conditions)
      const orConditions = [];
      const orValues = [];
      if (filters.name) {
        orConditions.push(`a.name LIKE ?`);
        orValues.push(`%${filters.name}%`);
      }
      if (filters.customer_name) {
        orConditions.push(`a.customer_name LIKE ?`);
        orValues.push(`%${filters.customer_name}%`);
      }
      if (filters.customer_phone) {
        orConditions.push(`a.customer_phone LIKE ?`);
        orValues.push(`%${filters.customer_phone}%`);
      }
      if (orConditions.length > 0) {
        query += ` AND (${orConditions.join(' OR ')})`;
        values.push(...orValues);
      }
    }

    // Sorting
    let sortBy = filters.sortBy || 'id';
    let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const allowedSortFields = ['id', 'appointment_date', 'start_time', 'end_time', 'name', 'branch_id', 'employee_id', 'user_id', 'table_id', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) sortBy = 'id';

    // Pagination
    let limit = 10, offset = 0;
    if (filters.pageSize) {
      limit = parseInt(filters.pageSize, 10) || 10;
    }
    if (filters.page) {
      offset = (parseInt(filters.page, 10) - 1) * limit;
    }

    query += ` ORDER BY a.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    db.query(query, values, (err, results) => {
      if (err) return callback(err);
      db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
        if (err2) return callback(err2);
        callback(null, { results, total: totalRows[0].total });
      });
    });
  }

  
  static update(id, data, callback) {
    const query = `UPDATE appointments SET customer_name = ?, customer_phone = ?, employee_id = ?, user_id = ?, branch_id = ?, name = ?, table_id = ?, appointment_date = ?, start_time = ?, end_time = ?, note = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.customer_name,
      data.customer_phone,
      data.employee_id,
      data.user_id,
      data.branch_id,
      data.name,
      data.table_id,
      data.appointment_date,
      data.start_time,
      data.end_time,
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
