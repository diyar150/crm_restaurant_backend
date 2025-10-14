const Item = require('../../models/Item/Item');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      req.fileValidationError = 'Invalid file type';
      return cb(null, false);
    }
    cb(null, true);
  },
});

// Create Item
// Create Item (with image upload)
exports.createItem = [
  upload.single('image'),
  (req, res) => {
    const itemData = req.body;
    if (req.file) {
      itemData.image_url = `/uploads/${req.file.filename}`;
    }

    // Validate required fields
    if (!itemData.name) {
      return res.status(400).json({ error: i18n.__('validation.required.item_name') });
    }

    // Set default values for optional fields
    itemData.brand_id = itemData.brand_id || 0;
    itemData.category_id = itemData.category_id || 0;

    Item.create(itemData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {

          if (err.sqlMessage.includes('name')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
          }
        }
        return res.status(500).json({ error: i18n.__('messages.error_creating_item') });
      }
      res.status(201).json({ message: i18n.__('messages.item_created'), id: result.insertId });
    });
  }
];

// Get All Items
exports.getAllItems = (req, res) => {
  Item.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items') });
    }
    res.status(200).json(results);
  });
};

exports.getItemFullInfo = (req, res) => {
  // Collect filters from query parameters
  const filters = {
    id: req.query.id,
    category_id: req.query.category_id,
    name: req.query.name,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    page: req.query.page,
    pageSize: req.query.pageSize
  };

  Item.getItemFullInfo(filters, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items')  });
    }
    res.json(result);
  });
};

exports.autocompleteSearch = (req, res) => {
  const { q = '', limit = 20 } = req.query;
  if (!q || q.length < 2) return res.json([]);
  Item.autocompleteSearch(q, limit, (err, results) => {
    if (err) return res.status(500).json({ error: "Error searching items" });
    res.json(results);
  });
};


// Get Item by ID
exports.getItemById = (req, res) => {
  const itemId = req.params.id;
  Item.getById(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// get item with sizes
exports.getItemWithSizes = (req, res) => {
  const itemId = req.params.id;
  Item.getWithSizes(itemId, (err, items) => {
    if (err) return res.status(500).json({ error: 'Error fetching item' });
    if (!items.length) return res.status(404).json({ error: 'Item not found' });
    res.json(items[0]);
  });
};



exports.searchItems = (req, res) => {
  const { q = '', page = 1, pageSize = 20 } = req.query;
  const filters = {
    name: q,
    barcode: q,
    page,
    pageSize,
    sortBy: 'name',
    sortOrder: 'asc'
  };
  Item.getByFilters(filters, (err, result) => {
    if (err) return res.status(500).json({ error: 'هەڵە لە گەڕان' });
    const items = (result.results || result).map(i => ({ id: i.id, name: i.name}));
    res.json({ items, total: result.total || items.length });
  });
};

 // Get Filtered Items

exports.getFilteredItems = (req, res) => {
  const filters = req.query;
  Item.getByFilters(filters, (err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item') });
    }
    res.status(200).json(results);
  });
};

// Update Item (with image upload)
exports.updateItem = [
  upload.single('image'),
  (req, res) => {
    const itemId = req.params.id;
    const itemData = req.body;
    if (req.file) {
      itemData.image_url = `/uploads/${req.file.filename}`;
    } else if (itemData.image_url) {
      // keep the existing image_url
    } else {
      // do not set image_url to null!
      delete itemData.image_url;
    }

    // Validate required fields
    if (!itemData.name) {
      return res.status(400).json({ error: i18n.__('validation.required.item_name') });
    }

    // Set default values for optional fields
    itemData.category_id = itemData.category_id || 0;

    Item.update(itemId, itemData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {

          if (err.sqlMessage.includes('name')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
          }
        }
        return res.status(500).json({ error: i18n.__('messages.error_updating_item') });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
      }
      res.status(200).json({ message: i18n.__('messages.item_updated') });
    });
  }
];

// Delete Item
exports.deleteItem = (req, res) => {
  const itemId = req.params.id;
  Item.deleteSoft(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_deleted') });
  });
};




