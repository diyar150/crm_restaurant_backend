const SellItem = require('../../models/Sell/SellItem');
const SellInvoice = require('../../models/Sell/SellInvoice');
const ItemQuantity = require('../../models/Item/ItemQuantity');
const ItemUnit = require('../../models/Item/ItemUnit');
const Item = require('../../models/Item/Item');
const i18n = require('../../config/i18nConfig');

// Helper: Adjust inventory (decrease on sell, increase on revert)
function adjustInventory({ item_id, warehouse_id, base_quantity }, revert, callback) {
  const quantityFn = revert
    ? ItemQuantity.increaseQuantity // Revert: increase inventory
    : ItemQuantity.decreaseQuantity; // Sell: decrease inventory
  quantityFn(warehouse_id, item_id, base_quantity, callback);
}

// Create Sell Item
exports.createSellItem = (req, res) => {
  const data = req.body;

  // Validate required fields
  if (
    !data.invoice_id ||
    !data.item_id ||
    !data.item_unit_id ||
    isNaN(Number(data.quantity)) ||
    isNaN(Number(data.unit_price)) ||
    isNaN(Number(data.total_amount))
  ) {
    return res.status(400).json({ error: i18n.__('validation.required.fields') });
  }

  // Fetch the warehouse_id from the sell_invoice table
  SellInvoice.getById(data.invoice_id, (err, invoiceResult) => {
    if (err || !invoiceResult || invoiceResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.sell_invoice') });
    }
    const warehouse_id = invoiceResult[0].warehouse_id;

    // Fetch the conversion factor for the item unit
    ItemUnit.getById(data.item_unit_id, (err, unitResult) => {
      if (err || !unitResult || unitResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.item_unit') });
      }
      const conversionFactor = unitResult[0].conversion_factor;
      const baseQuantity = Number(data.quantity) * conversionFactor;

      // Save the sell item
      SellItem.create({ ...data, base_quantity: baseQuantity }, (err, result) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_sell_item') });

        // Adjust inventory (decrease)
        adjustInventory(
          {
            item_id: data.item_id,
            warehouse_id,
            base_quantity: baseQuantity,
          },
          false,
          (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });
            res.status(201).json({ message: i18n.__('messages.sell_item_created'), id: result.insertId });
          }
        );
      });
    });
  });
};

// Get sell items by invoice ID
exports.getByInvoiceId = (req, res) => {
  const { invoice_id } = req.query;
  if (!invoice_id) {
    return res.status(400).json({ error: i18n.__('validation.required.invoice_id') });
  }
  SellItem.getAllByInvoiceId(invoice_id, (err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_sell_items') });
    res.json(rows);
  });
};

// Get Sell Item by ID
exports.getSellItemById = (req, res) => {
  const { id } = req.params;
  SellItem.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_sell_item') });
    }
    if (!result || result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.sell_item_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Sell Item
exports.updateSellItem = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  SellItem.getById(id, (err, existingItem) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_sell_item') });
    if (!existingItem || existingItem.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.sell_item_not_found') });

    const oldBaseQuantity = existingItem[0].base_quantity;
    const oldItemId = existingItem[0].item_id;

    SellInvoice.getById(existingItem[0].invoice_id, (err, invoiceResult) => {
      if (err || !invoiceResult || invoiceResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.sell_invoice') });
      }
      const warehouse_id = invoiceResult[0].warehouse_id;

      ItemUnit.getById(data.item_unit_id, (err, unitResult) => {
        if (err || !unitResult || unitResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.item_unit') });
        }
        const conversionFactor = unitResult[0].conversion_factor;
        const newBaseQuantity = Number(data.quantity) * conversionFactor;

        // First, revert the old inventory
        adjustInventory(
          {
            item_id: oldItemId,
            warehouse_id,
            base_quantity: oldBaseQuantity,
          },
          true,
          (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });

            // Update the sell item
            SellItem.update(id, { ...data, base_quantity: newBaseQuantity }, (err, result) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_sell_item') });
              if (!result || result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.sell_item_not_found') });

              // Then, apply the new inventory change
              adjustInventory(
                {
                  item_id: data.item_id,
                  warehouse_id,
                  base_quantity: newBaseQuantity,
                },
                false,
                (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });
                  res.status(200).json({ message: i18n.__('messages.sell_item_updated') });
                }
              );
            });
          }
        );
      });
    });
  });
};

// Delete Sell Item
exports.deleteSellItem = (req, res) => {
  const { id } = req.params;

  SellItem.getById(id, (err, existingItem) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_sell_item') });
    if (!existingItem || existingItem.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.sell_item_not_found') });

    const { item_id, base_quantity, invoice_id } = existingItem[0];

    SellInvoice.getById(invoice_id, (err, invoiceResult) => {
      if (err || !invoiceResult || invoiceResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.sell_invoice') });
      }
      const warehouse_id = invoiceResult[0].warehouse_id;

      SellItem.deleteSoft(id, (err, result) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_sell_item') });
        if (!result || result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.sell_item_not_found') });

        // Revert inventory (increase)
        adjustInventory(
          {
            item_id,
            warehouse_id,
            base_quantity,
          },
          true,
          (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });
            res.status(200).json({ message: i18n.__('messages.sell_item_deleted') });
          }
        );
      });
    });
  });
};