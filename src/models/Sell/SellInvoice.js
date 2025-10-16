const db = require('../../config/db');

class SellInvoice {
  static create(data, callback) {
  const query = `
    INSERT INTO sell_invoice (
      invoice_number, invoice_date, customer_id, branch_id, warehouse_id, agent_id, driver_id, employee_id,
      currency_id, exchange_rate, discount_type, discount_value, discount_result, amount_transport, amount_labor,
      total_amount, paid_amount, loan, payment_type, payment_status, type, note, direct_customer_name, direct_customer_phone, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const values = [
    data.invoice_number,
    data.invoice_date,
    data.customer_id,
    data.branch_id,
    data.warehouse_id,
    data.agent_id || 0,
    data.driver_id || 0,
    data.employee_id,
    data.currency_id,
    data.exchange_rate,
    data.discount_type,
    data.discount_value,
    data.discount_result,
    data.amount_transport,
    data.amount_labor,
    data.total_amount,
    data.paid_amount,
    data.loan,
    data.payment_type,
    data.payment_status || null, // <-- add this
    data.type,
    data.note,
    data.direct_customer_name || null,
    data.direct_customer_phone || null
  ];
  db.query(query, values, callback);
}

  static getAll(callback) {
    const query = `
      SELECT SQL_CALC_FOUND_ROWS si.*, 
        c.name AS customer_name, 
        w.name AS warehouse_name, 
        b.name AS branch_name,
        m.name AS agent_name,
        d.name AS driver_name,
        e.name AS employee_name,
        cu.name AS currency_name
      FROM sell_invoice si
      LEFT JOIN customer c ON si.customer_id = c.id
      LEFT JOIN warehouse w ON si.warehouse_id = w.id
      LEFT JOIN branch b ON si.branch_id = b.id
      LEFT JOIN users m ON si.agent_id = m.id
      LEFT JOIN driver d ON si.driver_id = d.id
      LEFT JOIN users e ON si.employee_id = e.id
      LEFT JOIN currency cu ON si.currency_id = cu.id
      WHERE si.deleted_at IS NULL
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT si.*, 
        c.name AS customer_name, 
        w.name AS warehouse_name, 
        b.name AS branch_name,
        m.name AS agent_name,
        d.name AS driver_name,
        e.name AS employee_name,
        cu.name AS currency_name
      FROM sell_invoice si
      LEFT JOIN customer c ON si.customer_id = c.id
      LEFT JOIN warehouse w ON si.warehouse_id = w.id
      LEFT JOIN branch b ON si.branch_id = b.id
      LEFT JOIN users m ON si.agent_id = m.id
      LEFT JOIN driver d ON si.driver_id = d.id
      LEFT JOIN users e ON si.employee_id = e.id
      LEFT JOIN currency cu ON si.currency_id = cu.id
      WHERE si.id = ? AND si.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

static update(id, data, callback) {
  const query = `
    UPDATE sell_invoice SET
      invoice_number = ?, invoice_date = ?, customer_id = ?, branch_id = ?, warehouse_id = ?, agent_id = ?, driver_id = ?, employee_id = ?,
      currency_id = ?, exchange_rate = ?, discount_type = ?, discount_value = ?, discount_result = ?, amount_transport = ?, amount_labor = ?,
      total_amount = ?, paid_amount = ?, loan = ?, payment_type = ?, payment_status = ?, type = ?, note = ?, direct_customer_name = ?, direct_customer_phone = ?, updated_at = NOW()
    WHERE id = ? AND deleted_at IS NULL
  `;
  const values = [
    data.invoice_number,
    data.invoice_date,
    data.customer_id,
    data.branch_id,
    data.warehouse_id,
    data.agent_id || 0,
    data.driver_id || 0,
    data.employee_id,
    data.currency_id,
    data.exchange_rate,
    data.discount_type,
    data.discount_value,
    data.discount_result,
    data.amount_transport,
    data.amount_labor,
    data.total_amount,
    data.paid_amount,
    data.loan,
    data.payment_type,
    data.payment_status || null, // <-- add this
    data.type,
    data.note,
    data.direct_customer_name || null,
    data.direct_customer_phone || null,
    id
  ];
  db.query(query, values, callback);
}

  static deleteSoft(id, callback) {
    const query = `UPDATE sell_invoice SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

  static filters(filters, callback) {
    let query = `
      SELECT SQL_CALC_FOUND_ROWS si.*, 
        c.name AS customer_name, 
        w.name AS warehouse_name, 
        b.name AS branch_name,
        m.name AS agent_name,
        d.name AS driver_name,
        e.name AS employee_name,
        cu.name AS currency_name
      FROM sell_invoice si
      LEFT JOIN customer c ON si.customer_id = c.id
      LEFT JOIN warehouse w ON si.warehouse_id = w.id
      LEFT JOIN branch b ON si.branch_id = b.id
      LEFT JOIN users m ON si.agent_id = m.id
      LEFT JOIN driver d ON si.driver_id = d.id
      LEFT JOIN users e ON si.employee_id = e.id
      LEFT JOIN currency cu ON si.currency_id = cu.id
      WHERE si.deleted_at IS NULL
    `;
    const values = [];

    if (filters.startDate && filters.endDate) {
      query += ` AND si.invoice_date BETWEEN ? AND ?`;
      values.push(filters.startDate, filters.endDate);
    }
    if (filters.warehouse_id && String(filters.warehouse_id).trim() !== '') {
      query += ` AND si.warehouse_id = ?`;
      values.push(filters.warehouse_id);
    }
    if (filters.currency_id && String(filters.currency_id).trim() !== '') {
      query += ` AND si.currency_id = ?`;
      values.push(filters.currency_id);
    }
    if (filters.branch_id && String(filters.branch_id).trim() !== '') {
      query += ` AND si.branch_id = ?`;
      values.push(filters.branch_id);
    }
    if (filters.customer_id && String(filters.customer_id).trim() !== '') {
      query += ` AND si.customer_id = ?`;
      values.push(filters.customer_id);
    }
    if (filters.agent_id && String(filters.agent_id).trim() !== '') {
      query += ` AND si.agent_id = ?`;
      values.push(filters.agent_id);
    }
    if (filters.driver_id && String(filters.driver_id).trim() !== '') {
      query += ` AND si.driver_id = ?`;
      values.push(filters.driver_id);
    }
    if (filters.employee_id && String(filters.employee_id).trim() !== '') {
      query += ` AND si.employee_id = ?`;
      values.push(filters.employee_id);
    }
    if (filters.search && String(filters.search).trim() !== '') {
      query += ` AND (si.invoice_number LIKE ? OR si.note LIKE ? OR si.id = ? OR si.direct_customer_name LIKE ? OR si.direct_customer_phone LIKE ?)`;
      values.push(`%${filters.search}%`, `%${filters.search}%`, filters.search, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.type && String(filters.type).trim() !== '') {
      query += ` AND si.type LIKE ?`;
      values.push(`%${filters.type}%`);
    }
    if (filters.payment_type && String(filters.payment_type).trim() !== '') {
      query += ` AND si.payment_type LIKE ?`;
      values.push(`%${filters.payment_type}%`);
    }
    if (filters.payment_status && String(filters.payment_status).trim() !== '') {
      query += ` AND si.payment_status LIKE ?`;
      values.push(`%${filters.payment_status}%`);
    }
    if (filters.invoice_date && String(filters.invoice_date).trim() !== '') {
      query += ` AND si.invoice_date = ?`;
      values.push(filters.invoice_date);
    }

    // Sorting
    const allowedSortFields = [
      'id', 'invoice_number', 'invoice_date', 'total_amount', 'customer_id', 'branch_id', 'warehouse_id', 'employee_id', 'currency_id', 'type', 'created_at'
    ];
    let sortBy = 'id';
    let sortOrder = 'DESC';

    if (filters.sortBy && allowedSortFields.includes(filters.sortBy)) {
      sortBy = filters.sortBy;
    }
    if (filters.sortOrder && ['ASC', 'DESC'].includes(filters.sortOrder.toUpperCase())) {
      sortOrder = filters.sortOrder.toUpperCase();
    }
    query += ` ORDER BY si.${sortBy} ${sortOrder}`;

    // Pagination
    let page = Number(filters.page) || 1;
    let limit = Number(filters.limit) || 20;
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    db.query(query, values, (err, data) => {
      if (err) return callback(err);

      db.query('SELECT FOUND_ROWS() as totalCount', (err2, countResult) => {
        if (err2) return callback(err2);
        const totalCount = countResult && countResult[0] ? countResult[0].totalCount : 0;
        callback(null, { data, totalCount });
      });
    });
  }
}

  module.exports = SellInvoice;