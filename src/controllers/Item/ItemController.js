const Item = require('../../models/Item/Item');
const i18n = require('../../config/i18nConfig');
const multer = require('multer');
const path = require('path');

// Multer configuration for image upload
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
exports.createItem = [
  upload.single('image'),
  (req, res) => {
    const itemData = req.body;
    
    // Handle image upload
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
    }

    // Validate required fields
    if (!itemData.name) {
      return res.status(400).json({ error: i18n.__('validation.required.item_name') });
    }
    if (!itemData.branch_id) {
      return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
    }

    // Set default values for optional fields
    itemData.category_id = itemData.category_id || 0;
    itemData.is_available = itemData.is_available !== undefined ? itemData.is_available : 1;

    Item.create(itemData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('name')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
          }
        }
        return res.status(500).json({ error: i18n.__('messages.error_creating_item') });
      }
      res.status(201).json({ 
        message: i18n.__('messages.item_created'), 
        id: result.insertId 
      });
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

// Get Item by ID
exports.getItemById = (req, res) => {
  const itemId = req.params.id;
  
  Item.getById(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item') });
    }
    if (!result || result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Get Item with Sizes
exports.getItemWithSizes = (req, res) => {
  const itemId = req.params.id;
  
  Item.getWithSizes(itemId, (err, items) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item') });
    }
    if (!items || items.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json(items[0]);
  });
};

// Filter Items
exports.getFilteredItems = (req, res) => {
  const filters = {
    id: req.query.id,
    name: req.query.name,
    category_id: req.query.category_id,
    branch_id: req.query.branch_id,
    is_available: req.query.is_available,
    page: req.query.page,
    pageSize: req.query.pageSize,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder
  };

  Item.getByFilters(filters, (err, data) => {
    if (err) {
      console.error('Error filtering items:', err);
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items') });
    }
    res.status(200).json({
      items: data.results,
      total: data.total
    });
  });
};

// Autocomplete Search
exports.autocompleteSearch = (req, res) => {
  const { q = '', limit = 20 } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  Item.autocompleteSearch(q, limit, (err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items') });
    }
    res.json(results);
  });
};

// Search Items (for pagination)
exports.searchItems = (req, res) => {
  const { q = '', page = 1, pageSize = 20 } = req.query;
  
  const filters = {
    name: q,
    page,
    pageSize,
    sortBy: 'name',
    sortOrder: 'asc'
  };
  
  Item.getByFilters(filters, (err, data) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items') });
    }
    
    const items = (data.results || []).map(i => ({ 
      id: i.id, 
      name: i.name,
      branch_name: i.branch_name 
    }));
    
    res.json({ 
      items, 
      total: data.total || 0 
    });
  });
};

// Update Item
exports.updateItem = [
  upload.single('image'),
  (req, res) => {
    const itemId = req.params.id;
    const itemData = req.body;
    
    // Handle image upload
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
    } else if (!itemData.image) {
      // Keep existing image if no new image uploaded
      delete itemData.image;
    }

    // Validate required fields
    if (!itemData.name) {
      return res.status(400).json({ error: i18n.__('validation.required.item_name') });
    }
    if (!itemData.branch_id) {
      return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
    }

    // Set default values
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

// Delete Item (Soft Delete)
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