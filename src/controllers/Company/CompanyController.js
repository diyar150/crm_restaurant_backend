const Company = require('../../models/Company/Company');
const multer = require('multer');
const path = require('path');
const i18n = require('../../config/i18nConfig');

// File upload setup
const upload = multer({
  dest: path.join(__dirname, '../../uploads'), // Save files in the 'uploads' directory
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/avif'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      req.fileValidationError = i18n.__('validation.invalid.image_type'); // Add i18n message for invalid type
      return cb(null, false);
    }
    cb(null, true);
  },
});

// Create company
exports.create = [upload.single('logo_1'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  // multer will reject files that exceed limits and won't set req.file; if you need
  // custom errors for size you can handle multer errors in an error-handling middleware.

    const { name, phone_1, phone_2, address, tagline, email, note } = req.body;
  const logo_1 = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.company_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }

  // Check if company name is unique
  Company.getByName(name, (err, companyResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (companyResult.length > 0) {
      return res.status(400).json({ error: i18n.__('validation.unique.company_name') });
    }

    // Prepare data for saving
  const companyData = { name, phone_1, phone_2, address, tagline, logo_1, email, note };

    Company.create(companyData, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_company') });
      res.status(201).json({ message: i18n.__('messages.company_created'), company: { id: result.insertId, ...companyData } });
    });
  });
}];

// Get all companies
exports.getAll = (req, res) => {
  Company.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_companies') });
    res.status(200).json(result);
  });
};

// Get company by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  Company.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_company') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.company_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get last inserted company ID
exports.getLastInsertedId = (req, res) => {
  Company.getLastInsertId((err, id) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_last_id') });
    }
    res.status(200).json({ id });
  });
};


// Update company
exports.update = [upload.single('logo_1'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  // multer enforces file size via limits; any size errors should be caught by multer's
  // error handler (express error middleware). We don't rely on req.fileSizeError here.

  const { id } = req.params;
  const { name, phone_1, phone_2, address, tagline, email, note } = req.body;
  let logo_1 = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.company_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }

  // Fetch the current logo_1 value if no new file is uploaded
  Company.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_company') });
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.company_not_found') });
    }

    if (!logo_1) {
      logo_1 = result[0].logo_1;
    }

    const companyData = { name, phone_1, phone_2, address, tagline, logo_1, email, note };

    Company.update(id, companyData, (err, updateResult) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
          return res.status(400).json({ error: i18n.__('validation.unique.company_name') });
        }
        return res.status(500).json({ error: i18n.__('messages.error_updating_company') });
      }
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.company_not_found') });
      }
      res.status(200).json({ message: i18n.__('messages.company_updated') });
    });
  });
}];

// Delete company
exports.delete = (req, res) => {
  const { id } = req.params;
  Company.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_company') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.company_not_found') });
    res.status(200).json({ message: i18n.__('messages.company_deleted') });
  });
};