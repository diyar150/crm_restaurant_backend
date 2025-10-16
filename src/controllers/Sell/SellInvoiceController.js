const SellInvoice = require('../../models/Sell/SellInvoice');
const SellItem = require('../../models/Sell/SellItem');
const Customer = require('../../models/Customer/Customer');
const Branch = require('../../models/Branch/Branch');
const Warehouse = require('../../models/Warehouse/Warehouse');
const Employee = require('../../models/User/User');
const Driver = require('../../models/Driver/Driver');
const Currency = require('../../models/Currency/Currency');
const ItemQuantity = require('../../models/Item/ItemQuantity');
const i18n = require('../../config/i18nConfig');

// Helper to get currency by id
function getCurrencyById(id) {
  return new Promise((resolve) => {
    Currency.getById(id, (err, result) => {
      if (err || !result || result.length === 0) return resolve(null);
      resolve(result[0]);
    });
  });
}

// Helper function to validate required fields
const validateRequiredFields = (fields) => {
  const { type, customer_id, branch_id, warehouse_id, employee_id, currency_id } = fields;
  if (!type) return i18n.__('validation.required.type');
  if (type !== 'ڕاستەوخۆ' && !customer_id) return i18n.__('validation.required.customer_id');
  if (!branch_id) return i18n.__('validation.required.branch_id');
  if (!warehouse_id) return i18n.__('validation.required.warehouse_id');
  if (!employee_id) return i18n.__('validation.required.employee_id');
  if (!currency_id) return i18n.__('validation.required.currency_id');
  return null;
};

// Helper to normalize driver_id
function normalizeDriverId(driver_id) {
  return driver_id ? Number(driver_id) : 0;
}
function normalizeAgentId(agent_id) {
  return agent_id ? Number(agent_id) : 0;
}

// Helper to normalize number fields (for null/empty)
function cleanNumber(value) {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '');
    return cleaned === '' ? null : Number(cleaned);
  }
  return Number(value);
}



// Create Sell Invoice with currency conversion logic and loan from Customer model
// --- CREATE SELL INVOICE ---
exports.createInvoice = async (req, res) => {
  const {
    type, invoice_number, invoice_date, total_amount,
    customer_id, branch_id, warehouse_id, agent_id, driver_id, employee_id,
    note, currency_id, discount_type, discount_value, discount_result,
    amount_transport, amount_labor, paid_amount, payment_type, payment_status,
    direct_customer_name, direct_customer_phone
  } = req.body;

  const normalizedDriverId = normalizeDriverId(driver_id);
  const normalizedAgentId = normalizeAgentId(agent_id);

  // Validate required fields
  const validationError = validateRequiredFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Validate warehouse, branch, employee
  const validateWarehouseBranchEmployee = async () => {
    const warehouseResult = await new Promise(resolve => Warehouse.getById(warehouse_id, (err, res) => resolve(res)));
    if (!warehouseResult || warehouseResult.length === 0) {
      return i18n.__('validation.invalid.warehouse_id');
    }
    const branchResult = await new Promise(resolve => Branch.getById(branch_id, (err, res) => resolve(res)));
    if (!branchResult || branchResult.length === 0) {
      return i18n.__('validation.invalid.branch_id');
    }
    const employeeResult = await new Promise(resolve => Employee.getById(employee_id, (err, res) => resolve(res)));
    if (!employeeResult || employeeResult.length === 0) {
      return i18n.__('validation.invalid.employee_id');
    }
    return null;
  };

  // --- RASTAWXO TYPE ---
  if (type === 'ڕاستەوخۆ') {
    const validationErr = await validateWarehouseBranchEmployee();
    if (validationErr) return res.status(400).json({ error: validationErr });

    const sellCurrency = await getCurrencyById(currency_id);
    const baseCurrency = await getCurrencyById(process.env.BASE_CURRENCY_ID || 1);

    if (!sellCurrency || !baseCurrency) {
      return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
    }
    if (!sellCurrency.exchange_rate || sellCurrency.exchange_rate <= 0) {
      return res.status(400).json({ error: i18n.__('messages.error_invalid_exchange_rate') });
    }

    let amountInBase = Number(total_amount);
    if (currency_id !== baseCurrency.id) {
      amountInBase = Number(total_amount) * (baseCurrency.exchange_rate / sellCurrency.exchange_rate);
    }

    const invoiceData = {
      type, invoice_number, invoice_date, total_amount,
      customer_id: 0,
      branch_id, warehouse_id, agent_id: normalizedAgentId, driver_id: normalizedDriverId, employee_id, note,
      loan: 0,
      currency_id,
      exchange_rate: sellCurrency.exchange_rate,
      discount_type,
      discount_value: cleanNumber(discount_value),
      discount_result: cleanNumber(discount_result),
      amount_transport: cleanNumber(amount_transport),
      amount_labor: cleanNumber(amount_labor),
      paid_amount: cleanNumber(paid_amount),
      payment_type,
      payment_status,
      direct_customer_name: direct_customer_name || null,
      direct_customer_phone: direct_customer_phone || null
    };

    SellInvoice.create(invoiceData, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_invoice') });
      // Wallet adjustment for direct/cash
      if (type === 'نەقد' || type === 'ڕاستەوخۆ') {
        Branch.increaseWallet(branch_id, amountInBase, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
          res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
        });
      } else {
        res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
      }
    });
    return;
  }

  // --- OTHER TYPES (قەرز/نەقد) ---
  Customer.getById(customer_id, async (err, customerResult) => {
    if (err || customerResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
    }

    const validationErr = await validateWarehouseBranchEmployee();
    if (validationErr) return res.status(400).json({ error: validationErr });

    const customer = customerResult[0];
    const customerCurrencyId = customer.currency_id;

    const sellCurrency = await getCurrencyById(currency_id);
    const customerCurrency = await getCurrencyById(customerCurrencyId);
    const baseCurrency = await getCurrencyById(process.env.BASE_CURRENCY_ID || 1);

    if (!sellCurrency || !customerCurrency || !baseCurrency) {
      return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
    }
    if (
      !sellCurrency.exchange_rate || sellCurrency.exchange_rate <= 0 ||
      !customerCurrency.exchange_rate || customerCurrency.exchange_rate <= 0
    ) {
      return res.status(400).json({ error: i18n.__('messages.error_invalid_exchange_rate') });
    }

    let amountInCustomerCurrency = Number(total_amount);
    if (currency_id !== customerCurrencyId) {
      amountInCustomerCurrency = Number(total_amount) * (customerCurrency.exchange_rate / sellCurrency.exchange_rate);
    }
    let amountInBase = Number(total_amount);
    if (currency_id !== baseCurrency.id) {
      amountInBase = Number(total_amount) * (baseCurrency.exchange_rate / sellCurrency.exchange_rate);
    }

    Customer.getLoan(customer_id, (err, loanResult) => {
      if (err || !loanResult || loanResult.length === 0) {
        return res.status(400).json({ error: i18n.__('messages.error_fetching_customer_loan') });
      }
      const currentLoan = Number(loanResult[0].loan) || 0;

      const invoiceData = {
        type, invoice_number, invoice_date, total_amount,
        customer_id,
        branch_id, warehouse_id, agent_id: normalizedAgentId, driver_id: normalizedDriverId, employee_id, note,
        loan: currentLoan,
        currency_id,
        exchange_rate: sellCurrency.exchange_rate,
        discount_type,
        discount_value: cleanNumber(discount_value),
        discount_result: cleanNumber(discount_result),
        amount_transport: cleanNumber(amount_transport),
        amount_labor: cleanNumber(amount_labor),
        paid_amount: cleanNumber(paid_amount),
        payment_type,
        payment_status,
        direct_customer_name: direct_customer_name || null,
        direct_customer_phone: direct_customer_phone || null
      };

      SellInvoice.create(invoiceData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (type === 'نەقد' || type === 'ڕاستەوخۆ') {
          Branch.increaseWallet(branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
            res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
          });
        } else if (type === 'قەرز') {
          Customer.increaseLoan(customer_id, amountInCustomerCurrency, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_customer_loan') });
            res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
          });
        } else {
          res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
        }
      });
    });
  });
};

// Get All Sell Invoices
exports.getAllInvoices = (req, res) => {
  SellInvoice.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(result);
  });
};

// Get Sell Invoice by ID
exports.getInvoiceById = (req, res) => {
  const { id } = req.params;
  SellInvoice.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get Sell Invoices by Filters
exports.getInvoicesByFilters = (req, res) => {
  const filters = req.query;

  // Optional: Only block if no filters at all
  if (
    !filters.id &&
    !filters.startDate &&
    !filters.endDate &&
    !filters.branch_id &&
    !filters.agent_id &&
    !filters.warehouse_id &&
    !filters.customer_id &&
    !filters.type &&
    !filters.currency_id &&
    !filters.invoice_number
  ) {
    return res.status(400).json({ error: i18n.__('validation.required.at_least_one_filter') });
  }

  SellInvoice.filters(filters, (err, data) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_invoices') });
    res.status(200).json({
      invoices: data.data,
      total: data.totalCount,
    });
  });
};

// Update Sell Invoice with currency conversion logic using stored exchange_rate
// --- UPDATE SELL INVOICE ---
exports.updateInvoice = (req, res) => {
  const { id } = req.params;
  const {
    type, invoice_number, invoice_date, total_amount,
    customer_id, branch_id, warehouse_id, agent_id, driver_id, employee_id,
    note, currency_id, discount_type, discount_value, discount_result,
    amount_transport, amount_labor, paid_amount, payment_type, payment_status,
    direct_customer_name, direct_customer_phone
  } = req.body;

  const normalizedDriverId = normalizeDriverId(driver_id);
  const normalizedAgentId = normalizeAgentId(agent_id);

  // Validate required fields
  const validationError = validateRequiredFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // --- RASTAWXO TYPE ---
  if (type === 'ڕاستەوخۆ') {
    (async () => {
      const warehouseResult = await new Promise(resolve => Warehouse.getById(warehouse_id, (err, res) => resolve(res)));
      if (!warehouseResult || warehouseResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.warehouse_id') });
      }
      const branchResult = await new Promise(resolve => Branch.getById(branch_id, (err, res) => resolve(res)));
      if (!branchResult || branchResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
      }
      const employeeResult = await new Promise(resolve => Employee.getById(employee_id, (err, res) => resolve(res)));
      if (!employeeResult || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      // Fetch existing invoice
      SellInvoice.getById(id, async (err, existingInvoice) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingInvoice.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

        const oldInvoice = existingInvoice[0];
        const oldType = oldInvoice.type;
        const oldTotalAmount = Number(oldInvoice.total_amount);
        const oldCurrencyId = oldInvoice.currency_id;
        const oldExchangeRate = Number(oldInvoice.exchange_rate);

        const oldSellCurrency = await getCurrencyById(oldCurrencyId);
        const newSellCurrency = await getCurrencyById(currency_id);
        const baseCurrency = await getCurrencyById(process.env.BASE_CURRENCY_ID || 1);

        if (!oldSellCurrency || !newSellCurrency || !baseCurrency) {
          return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
        }

        let oldAmountInBase = oldTotalAmount;
        if (oldCurrencyId !== baseCurrency.id) {
          oldAmountInBase = oldTotalAmount * (baseCurrency.exchange_rate / oldExchangeRate);
        }
        let newAmountInBase = Number(total_amount);
        if (currency_id !== baseCurrency.id) {
          newAmountInBase = Number(total_amount) * (baseCurrency.exchange_rate / newSellCurrency.exchange_rate);
        }

        const invoiceData = {
          type, invoice_number, invoice_date, total_amount,
          customer_id: 0,
          branch_id, warehouse_id, agent_id: normalizedAgentId, driver_id: normalizedDriverId, employee_id, note,
          loan: 0,
          currency_id,
          exchange_rate: newSellCurrency.exchange_rate,
          discount_type,
          discount_value: cleanNumber(discount_value),
          discount_result: cleanNumber(discount_result),
          amount_transport: cleanNumber(amount_transport),
          amount_labor: cleanNumber(amount_labor),
          paid_amount: cleanNumber(paid_amount),
          payment_type,
          payment_status,
          direct_customer_name: direct_customer_name || null,
          direct_customer_phone: direct_customer_phone || null
        };

        SellInvoice.update(id, invoiceData, async (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

          // Reverse the effect of the old invoice
          if (oldType === 'نەقد' || oldType === 'ڕاستەوخۆ') {
            await new Promise((resolve, reject) =>
              Branch.decreaseWallet(branch_id, oldAmountInBase, err => err ? reject(err) : resolve())
            );
          }

          // Apply the effect of the new invoice
          if (type === 'نەقد' || type === 'ڕاستەوخۆ') {
            await new Promise((resolve, reject) =>
              Branch.increaseWallet(branch_id, newAmountInBase, err => err ? reject(err) : resolve())
            );
          }

          return res.status(200).json({ message: i18n.__('messages.invoice_updated') });
        });
      });
    })();
    return;
  }

  // --- OTHER TYPES (قەرز/نەقد) ---
  Customer.getById(customer_id, (err, customerResult) => {
    if (err || customerResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
    }

    (async () => {
      const warehouseResult = await new Promise(resolve => Warehouse.getById(warehouse_id, (err, res) => resolve(res)));
      if (!warehouseResult || warehouseResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.warehouse_id') });
      }
      const branchResult = await new Promise(resolve => Branch.getById(branch_id, (err, res) => resolve(res)));
      if (!branchResult || branchResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
      }
      const employeeResult = await new Promise(resolve => Employee.getById(employee_id, (err, res) => resolve(res)));
      if (!employeeResult || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      // Fetch existing invoice
      SellInvoice.getById(id, async (err, existingInvoice) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingInvoice.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

        const oldInvoice = existingInvoice[0];
        const oldType = oldInvoice.type;
        const oldTotalAmount = Number(oldInvoice.total_amount);
        const oldCurrencyId = oldInvoice.currency_id;
        const oldExchangeRate = Number(oldInvoice.exchange_rate);

        const customer = customerResult[0];
        const customerCurrencyId = customer.currency_id;
        const oldSellCurrency = await getCurrencyById(oldCurrencyId);
        const newSellCurrency = await getCurrencyById(currency_id);
        const customerCurrency = await getCurrencyById(customerCurrencyId);
        const baseCurrency = await getCurrencyById(process.env.BASE_CURRENCY_ID || 1);

        if (!oldSellCurrency || !newSellCurrency || !customerCurrency || !baseCurrency) {
          return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
        }

        let oldAmountInCustomerCurrency = oldTotalAmount;
        if (oldCurrencyId !== customerCurrencyId) {
          oldAmountInCustomerCurrency = oldTotalAmount * (customerCurrency.exchange_rate / oldExchangeRate);
        }
        let oldAmountInBase = oldTotalAmount;
        if (oldCurrencyId !== baseCurrency.id) {
          oldAmountInBase = oldTotalAmount * (baseCurrency.exchange_rate / oldExchangeRate);
        }

        let newAmountInCustomerCurrency = Number(total_amount);
        if (currency_id !== customerCurrencyId) {
          newAmountInCustomerCurrency = Number(total_amount) * (customerCurrency.exchange_rate / newSellCurrency.exchange_rate);
        }
        let newAmountInBase = Number(total_amount);
        if (currency_id !== baseCurrency.id) {
          newAmountInBase = Number(total_amount) * (baseCurrency.exchange_rate / newSellCurrency.exchange_rate);
        }

        Customer.getLoan(customer_id, (err, loanResult) => {
          if (err || !loanResult || loanResult.length === 0) {
            return res.status(400).json({ error: i18n.__('messages.error_fetching_customer_loan') });
          }
          const currentLoan = Number(loanResult[0].loan) || 0;

          const invoiceData = {
            type, invoice_number, invoice_date, total_amount,
            customer_id,
            branch_id, warehouse_id, agent_id: normalizedAgentId, driver_id: normalizedDriverId, employee_id, note,
            loan: currentLoan,
            currency_id,
            exchange_rate: newSellCurrency.exchange_rate,
            discount_type,
            discount_value: cleanNumber(discount_value),
            discount_result: cleanNumber(discount_result),
            amount_transport: cleanNumber(amount_transport),
            amount_labor: cleanNumber(amount_labor),
            paid_amount: cleanNumber(paid_amount),
            payment_type,
            payment_status,
            direct_customer_name: direct_customer_name || null,
            direct_customer_phone: direct_customer_phone || null
          };

          SellInvoice.update(id, invoiceData, async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

            // --- Reverse the effect of the old invoice ---
            if (oldType === 'نەقد' || oldType === 'ڕاستەوخۆ') {
              await new Promise((resolve, reject) =>
                Branch.decreaseWallet(branch_id, oldAmountInBase, err => err ? reject(err) : resolve())
              );
            } else if (oldType === 'قەرز') {
              await new Promise((resolve, reject) =>
                Customer.decreaseLoan(customer_id, oldAmountInCustomerCurrency, err => err ? reject(err) : resolve())
              );
            }

            // --- Apply the effect of the new invoice ---
            if (type === 'نەقد' || type === 'ڕاستەوخۆ') {
              await new Promise((resolve, reject) =>
                Branch.increaseWallet(branch_id, newAmountInBase, err => err ? reject(err) : resolve())
              );
              return res.status(200).json({ message: i18n.__('messages.invoice_updated') });
            } else if (type === 'قەرز') {
              await new Promise((resolve, reject) =>
                Customer.increaseLoan(customer_id, newAmountInCustomerCurrency, err => err ? reject(err) : resolve())
              );
              return res.status(200).json({ message: i18n.__('messages.invoice_updated') });
            } else {
              return res.status(200).json({ message: i18n.__('messages.invoice_updated') });
            }
          });
        });
      });
    })();
  });
};

// Delete Sell Invoice with currency conversion reversal
exports.deleteInvoice = (req, res) => {
  const { id } = req.params;

  SellInvoice.getById(id, async (err, existingInvoice) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existingInvoice || existingInvoice.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });
    }

    const oldInvoice = existingInvoice[0];
    const { type, total_amount, branch_id, warehouse_id, customer_id, currency_id, exchange_rate } = oldInvoice;

    // Get currencies
    const sellCurrency = await getCurrencyById(currency_id);
    const baseCurrency = await getCurrencyById(process.env.BASE_CURRENCY_ID || 1);

    // Get customer (may be null for ڕاستەوخۆ)
    let customer = null;
    let customerCurrency = null;
    let customerCurrencyId = null;
    if (customer_id && customer_id !== 0) {
      customer = await new Promise((resolve) => Customer.getById(customer_id, (err, resu) => resolve(resu && resu[0] ? resu[0] : null)));
      customerCurrencyId = customer ? customer.currency_id : null;
      customerCurrency = customerCurrencyId ? await getCurrencyById(customerCurrencyId) : null;
    }

    // Calculate reversal amounts
    let amountInCustomerCurrency = Number(total_amount);
    if (customerCurrency && currency_id !== customerCurrencyId) {
      amountInCustomerCurrency = Number(total_amount) * (customerCurrency.exchange_rate / exchange_rate);
    }
    let amountInBase = Number(total_amount);
    if (currency_id !== baseCurrency.id) {
      amountInBase = Number(total_amount) * (baseCurrency.exchange_rate / exchange_rate);
    }

    // 1. Fetch all sell items for this invoice
    SellItem.getAllByInvoiceId(id, async (err, items) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_sell_items') });

      // 2. For each item, reverse inventory and soft delete
      const itemOps = items.map(item =>
        new Promise((resolve, reject) => {
          // Reverse inventory
          ItemQuantity.increaseQuantity(warehouse_id, item.item_id, item.base_quantity, err => {
            if (err) return reject(i18n.__('messages.error_updating_inventory'));
            // Soft delete sell item
            SellItem.deleteSoft(item.id, err2 => {
              if (err2) return reject(i18n.__('messages.error_deleting_sell_item'));
              resolve();
            });
          });
        })
      );
      try {
        await Promise.all(itemOps);
      } catch (itemErr) {
        return res.status(500).json({ error: itemErr });
      }

      // 3. Soft delete the sell invoice
      SellInvoice.deleteSoft(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result || result.affectedRows === 0) {
          return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });
        }

        // 4. Reverse wallet or loan adjustment based on type
        if (type === 'نەقد' || type === 'ڕاستەوخۆ') {
          Branch.decreaseWallet(branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
            return res.status(200).json({ message: i18n.__('messages.invoice_deleted') });
          });
        } else if (type === 'قەرز' && customer && customerCurrency) {
          Customer.decreaseLoan(customer_id, amountInCustomerCurrency, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_customer_loan') });
            return res.status(200).json({ message: i18n.__('messages.invoice_deleted') });
          });
        } else {
          return res.status(200).json({ message: i18n.__('messages.invoice_deleted') });
        }
      });
    });
  });
};