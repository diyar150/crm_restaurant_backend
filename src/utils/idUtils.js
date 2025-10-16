const Customer = require('../models/Customer/Customer');
const Employee = require('../models/User/User');
const Warehouse = require('../models/Warehouse/Warehouse');

const getCustomerById = (customerId, callback) => {
  Customer.getById(customerId, (err, customerResult) => {
    if (err) return callback(err);
    if (customerResult.length === 0) return callback(new Error('Customer not found'));
    callback(null, customerResult[0]);
  });
};

const getEmployeeById = (employeeId, callback) => {
  Employee.getById(employeeId, (err, employeeResult) => {
    if (err) return callback(err);
    if (employeeResult.length === 0) return callback(new Error('Employee not found'));
    callback(null, employeeResult[0]);
  });
};

const getWarehouseById = (warehouseId, callback) => {
  Warehouse.getById(warehouseId, (err, warehouseResult) => {
    if (err) return callback(err);
    if (warehouseResult.length === 0) return callback(new Error('Warehouse not found'));
    callback(null, warehouseResult[0]);
  });
};

module.exports = {
  getCustomerById,
  getEmployeeById,
  getWarehouseById
};