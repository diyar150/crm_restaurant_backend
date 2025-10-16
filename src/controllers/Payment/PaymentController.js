const Payment = require('../../models/Payment/Payment');
const Customer = require('../../models/Customer/Customer'); // Ensure this is correctly imported
const Branch = require('../../models/Branch/Branch'); // Ensure this is correctly imported
const i18n = require('../../config/i18nConfig');


// Create Payment
exports.createPayment = (req, res) => {
  const paymentData = req.body;

  // Validate required fields
  if (!paymentData.customer_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_id') });
  }
  if (!paymentData.type) {
    return res.status(400).json({ error: i18n.__('validation.required.type') });
  }
  if (!paymentData.amount) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!paymentData.branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!paymentData.currency_id) {
    return res.status(400).json({ error: i18n.__('validation.required.currency_id') });
  }

  Branch.getById(paymentData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Customer.getById(paymentData.customer_id, async (err, customerResult) => {
      if (err || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }

      const customer = customerResult[0];
      const currentLoan = Number(customer.loan) || 0;
      const customerCurrencyId = customer.currency_id;

      

      // Fetch all currencies
      const paymentCurrency = await getCurrencyById(paymentData.currency_id);
      const customerCurrency = await getCurrencyById(customerCurrencyId);
      const baseCurrency = await getBaseCurrency();

      if (!paymentCurrency || !customerCurrency || !baseCurrency) {
        return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
      }

      // --- 1. Convert amount/discount for customer loan (customer currency) ---
      let amountInCustomerCurrency = Number(paymentData.amount);
      let discountInCustomerCurrency = Number(paymentData.discount_result || 0);

      // Defensive check
        if (
          !paymentCurrency.exchange_rate || paymentCurrency.exchange_rate <= 0 ||
          !customerCurrency.exchange_rate || customerCurrency.exchange_rate <= 0
        ) {
          return res.status(400).json({ error: "Invalid exchange rate for currency conversion." });
        }


    if (paymentData.currency_id !== customerCurrencyId) {
      // Convert payment amount and discount to customer currency
      amountInCustomerCurrency = Number(paymentData.amount) * (customerCurrency.exchange_rate / paymentCurrency.exchange_rate);
      discountInCustomerCurrency = Number(paymentData.discount_result || 0) * (paymentCurrency.exchange_rate / customerCurrency.exchange_rate);
    }

      // --- 2. Calculate result in customer currency ---
      const result = currentLoan - amountInCustomerCurrency - discountInCustomerCurrency;
      paymentData.result = result;
     
      // --- Set loan for the payment record (required for DB, cannot be null) ---
      paymentData.loan = result; // or use currentLoan if you want the loan before payment


      // --- 3. Calculate amountInBase for branch wallet (base currency) ---
      let amountInBase = Number(paymentData.amount);
      if (paymentData.currency_id !== baseCurrency.id) {
        amountInBase = Number(paymentData.amount) * (baseCurrency.exchange_rate / paymentCurrency.exchange_rate);
      }

      // --- 4. Set exchange_rate for record keeping ---
      paymentData.exchange_rate = paymentCurrency.exchange_rate;
      paymentData.payment_date = paymentData.payment_date || new Date().toISOString().slice(0, 10);
      paymentData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // --- 5. Validations ---
      if (paymentData.discount_result && Number(paymentData.discount_result) < 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.discount_result') });
      }
      if (
        paymentData.discount_type === 'پارە' &&
        Math.abs(Number(paymentData.discount_result)) > Math.abs(Number(currentLoan))
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_more_than_loan') });
      }
      if (
        paymentData.discount_type === 'ڕێژە' &&
        Number(paymentData.discount_value) > 100
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_percent_too_high') });
      }

      // --- 6. Create Payment and update loan/wallet ---
      Payment.create(paymentData, (err, result) => {

        if (err) {
          console.error('Payment.create error:', err, paymentData);
          return res.status(500).json({ error: i18n.__('messages.error_creating_payment'), details: err.message || err });
        }

        const totalForLoan = amountInCustomerCurrency + discountInCustomerCurrency;
        if (!isFinite(totalForLoan)) {
          console.error('Currency conversion error:', {
            amountInCustomerCurrency,
            discountInCustomerCurrency,
            totalForLoan,
            paymentCurrency,
            customerCurrency,
            paymentData
          });
          return res.status(400).json({ error: "Currency conversion error: invalid value for loan update" });
        }
    

        if (paymentData.type === i18n.__('payment_type.payment')) {
          // Decrease wallet (base currency), increase customer loan (customer currency)
          Branch.decreaseWallet(paymentData.branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });

             if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
            Customer.increaseLoan(paymentData.customer_id, totalForLoan, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
              res.status(201).json({ message: i18n.__('messages.payment_created') });
            });
          });
        } else if (paymentData.type === i18n.__('payment_type.receipt')) {
          // Increase wallet (base currency), decrease customer loan (customer currency)
          Branch.increaseWallet(paymentData.branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
            Customer.decreaseLoan(paymentData.customer_id, totalForLoan, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
              res.status(201).json({ message: i18n.__('messages.payment_created') });
            });
          });
          } else {
          res.status(201).json({ message: i18n.__('messages.payment_created') });
        }
      });
    });
  });
};


// Get All Payments
exports.getAllPayments = (req, res) => {
  CustomerPayment.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payments') });
    res.status(200).json(results);
  });
};

// Filter Payments (with date range required)
exports.filterPayments = (req, res) => {
  const {
    startDate,
    endDate,
    customer_id,
    employee_id,
    branch_id,
    currency_id,
    payment_method,
    type,
    reference_number,
    user_id,
    sortBy,
    sortOrder,
    page,
    pageSize
  } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  const filters = {
    startDate,
    endDate,
    customer_id,
    employee_id,
    branch_id,
    currency_id,
    payment_method,
    type,
    reference_number,
    user_id,
    sortBy,
    sortOrder,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  };

  Payment.filter(filters, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payments') });
    res.status(200).json(results);
  });
};

// Get Payment by ID
exports.getPaymentById = (req, res) => {
  const paymentId = req.params.id;
  Payment.getById(paymentId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payment') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });
    res.status(200).json(result[0]);
  });
};


// Update Payment
exports.updatePayment = (req, res) => {
  const paymentId = req.params.id;
  const paymentData = req.body;

  Branch.getById(paymentData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Customer.getById(paymentData.customer_id, async (err, customerResult) => {
      if (err || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }

      const customer = customerResult[0];
      const customerCurrencyId = customer.currency_id;

      // Defensive check for discount
      if (paymentData.discount_result && Number(paymentData.discount_result) < 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.discount_result') });
      }
      if (
        paymentData.discount_type === 'پارە' &&
        Math.abs(Number(paymentData.discount_result)) > Math.abs(Number(customer.loan))
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_more_than_loan') });
      }
      if (
        paymentData.discount_type === 'ڕێژە' &&
        Number(paymentData.discount_value) > 100
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_percent_too_high') });
      }

      Payment.getById(paymentId, async (err, existingPayment) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingPayment.length === 0) return res.status(404).json({ error: 'هیچ زانیارییەک نەدۆزرایەوە' });

        const oldPayment = existingPayment[0];
        const oldResult = Number(oldPayment.result);
        const oldType = oldPayment.type;
        const oldExchangeRate = Number(oldPayment.exchange_rate);

        // Get old payment currency and base currency
        const oldPaymentCurrency = await getCurrencyById(oldPayment.currency_id);
        const oldCustomerCurrency = await getCurrencyById(customerCurrencyId);
        const baseCurrency = await getBaseCurrency();

        if (!oldPaymentCurrency || !oldCustomerCurrency || !baseCurrency) {
          return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
        }

        // Calculate old amount in base currency (for wallet reversal)
        let oldAmountInBase = Number(oldPayment.amount);
        if (oldPayment.currency_id !== baseCurrency.id) {
          oldAmountInBase = Number(oldPayment.amount) * (baseCurrency.exchange_rate / oldExchangeRate);
        }

        // Calculate old amount in customer currency (for loan reversal)
        let oldAmountInCustomerCurrency = Number(oldPayment.amount);
        let oldDiscountInCustomerCurrency = Number(oldPayment.discount_result || 0);
        if (oldPayment.currency_id !== oldCustomerCurrency.id) {
          oldAmountInCustomerCurrency = Number(oldPayment.amount) * (oldCustomerCurrency.exchange_rate / oldExchangeRate);
          oldDiscountInCustomerCurrency = Number(oldPayment.discount_result || 0) * (oldCustomerCurrency.exchange_rate / oldExchangeRate);
        }
        const oldTotalForLoan = oldAmountInCustomerCurrency + oldDiscountInCustomerCurrency;

        // --- Prepare new payment values ---
        const paymentCurrency = await getCurrencyById(paymentData.currency_id);
        const customerCurrency = await getCurrencyById(customerCurrencyId);

        if (
          !paymentCurrency || !customerCurrency ||
          !paymentCurrency.exchange_rate || paymentCurrency.exchange_rate <= 0 ||
          !customerCurrency.exchange_rate || customerCurrency.exchange_rate <= 0
        ) {
          return res.status(400).json({ error: "Invalid exchange rate for currency conversion." });
        }

        // Convert amount/discount to customer currency if needed
        let amountInCustomerCurrency = Number(paymentData.amount);
        let discountInCustomerCurrency = Number(paymentData.discount_result || 0);
        if (paymentData.currency_id !== customerCurrencyId) {
          amountInCustomerCurrency = Number(paymentData.amount) * (customerCurrency.exchange_rate / paymentCurrency.exchange_rate);
          discountInCustomerCurrency = Number(paymentData.discount_result || 0) * (customerCurrency.exchange_rate / paymentCurrency.exchange_rate);
        }

        // Calculate new result in customer currency
        const result = Number(customer.loan) - amountInCustomerCurrency - discountInCustomerCurrency;
        paymentData.result = result;
        paymentData.loan = result;

        // Calculate new amountInBase for wallet
        let newAmountInBase = Number(paymentData.amount);
        if (paymentData.currency_id !== baseCurrency.id) {
          newAmountInBase = Number(paymentData.amount) * (baseCurrency.exchange_rate / paymentCurrency.exchange_rate);
        }

        // Set exchange_rate for record keeping
        paymentData.exchange_rate = paymentCurrency.exchange_rate;
        paymentData.payment_date = paymentData.payment_date || paymentData.created_at || new Date().toISOString().slice(0, 10);

        // Update the payment details
        Payment.update(paymentId, paymentData, (err, resultUpdate) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_payment') });
          if (resultUpdate.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });

          // Reverse old effect using oldAmountInBase, then apply new effect using newAmountInBase
          const processUpdate = async () => {
            // Reverse old
            if (oldType === i18n.__('payment_type.payment')) {
              await new Promise((resolve, reject) => Customer.decreaseLoan(oldPayment.customer_id, oldTotalForLoan, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.increaseWallet(oldPayment.branch_id, oldAmountInBase, err => err ? reject(err) : resolve()));
            } else if (oldType === i18n.__('payment_type.receipt')) {
              await new Promise((resolve, reject) => Customer.increaseLoan(oldPayment.customer_id, oldTotalForLoan, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.decreaseWallet(oldPayment.branch_id, oldAmountInBase, err => err ? reject(err) : resolve()));
            }
            // Apply new
            if (paymentData.type === i18n.__('payment_type.payment')) {
              await new Promise((resolve, reject) => Customer.increaseLoan(paymentData.customer_id, amountInCustomerCurrency + discountInCustomerCurrency, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.decreaseWallet(paymentData.branch_id, newAmountInBase, err => err ? reject(err) : resolve()));
            } else if (paymentData.type === i18n.__('payment_type.receipt')) {
              await new Promise((resolve, reject) => Customer.decreaseLoan(paymentData.customer_id, amountInCustomerCurrency + discountInCustomerCurrency, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.increaseWallet(paymentData.branch_id, newAmountInBase, err => err ? reject(err) : resolve()));
            }
          };

          processUpdate()
            .then(() => res.status(200).json({ message: i18n.__('messages.payment_updated') }))
            .catch(err => res.status(500).json({ error: err.message }));
        });
      });
    });
  });
};

// Delete Payment (fixed)
exports.deletePayment = (req, res) => {
  const paymentId = req.params.id;

  Payment.getById(paymentId, async (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payment') });
    if (!result || result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });
    }

    const paymentData = result[0];
    const amount = Number(paymentData.amount) || 0;
    const discount = Number(paymentData.discount_result || 0);
    const exchangeRate = Number(paymentData.exchange_rate);

    // Get customer to fetch their currency
    Customer.getById(paymentData.customer_id, async (err, customerResult) => {
      if (err || !customerResult || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }
      const customer = customerResult[0];
      const customerCurrencyId = customer.currency_id;

      // Get currencies for correct reverse conversion
      const paymentCurrency = await getCurrencyById(paymentData.currency_id);
      const customerCurrency = await getCurrencyById(customerCurrencyId);
      const baseCurrency = await getBaseCurrency();

      if (!paymentCurrency || !customerCurrency || !baseCurrency) {
        return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
      }

      // Convert to customer currency (for loan reversal)
      let amountInCustomerCurrency = amount;
      let discountInCustomerCurrency = discount;

      if (paymentData.currency_id !== customerCurrency.id) {
        // Use the stored exchangeRate for conversion
        amountInCustomerCurrency = amount * (customerCurrency.exchange_rate / exchangeRate);
        discountInCustomerCurrency = discount * (customerCurrency.exchange_rate / exchangeRate);
      }

      // Calculate amount in base currency (for wallet reversal)
      let amountInBase = amount;
      if (paymentData.currency_id !== baseCurrency.id) {
        amountInBase = amount * (baseCurrency.exchange_rate / exchangeRate);
      }

      const totalForLoan = amountInCustomerCurrency + discountInCustomerCurrency;

      // Soft delete
      Payment.deleteSoft(paymentId, async (err) => {
        if (err) {
          return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
        }

        // Reverse effects
        try {
          if (paymentData.type === i18n.__('payment_type.payment')) {
            await new Promise((resolve, reject) =>
              Customer.decreaseLoan(paymentData.customer_id, totalForLoan, err => err ? reject(err) : resolve())
            );
            await new Promise((resolve, reject) =>
              Branch.increaseWallet(paymentData.branch_id, amountInBase, err => err ? reject(err) : resolve())
            );
          } else if (paymentData.type === i18n.__('payment_type.receipt')) {
            await new Promise((resolve, reject) =>
              Customer.increaseLoan(paymentData.customer_id, totalForLoan, err => err ? reject(err) : resolve())
            );
            await new Promise((resolve, reject) =>
              Branch.decreaseWallet(paymentData.branch_id, amountInBase, err => err ? reject(err) : resolve())
            );
          }

          res.status(200).json({ message: i18n.__('messages.payment_deleted') });
        } catch (err) {
          console.error('Delete payment error:', err);
          res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
        }
      });
    });
  });
};

