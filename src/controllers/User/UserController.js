const User = require('../../models/User/User');
const Branch = require('../../models/Branch/Branch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization
const multer = require('multer');
const path = require('path');

// File upload setup
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
// Create user
exports.create = [
  upload.single('image'),
  (req, res) => {
    if (req.fileValidationError) {
      return res.status(400).json({ error: i18n.__('validation.invalid.image_type') });
    }

const { name, username, phone, branch_id, password, is_system_user, is_agent, salary } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate input
    if (!name) return res.status(400).json({ error: i18n.__('validation.required.user_name') });
    if (!username) return res.status(400).json({ error: i18n.__('validation.required.username') });
    if (!phone) return res.status(400).json({ error: i18n.__('validation.required.phone') });
    if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
    if (is_system_user == 1 && !password) {
    return res.status(400).json({ error: i18n.__('validation.required.password') });
   }
    Branch.getById(branch_id, (err, branchResult) => {
      if (err || branchResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
      }

      User.getByUsername(username, (err, userResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
        if (userResult.length > 0) {
          return res.status(400).json({ error: i18n.__('validation.unique.username') });
        }

        const userData = {
          name,
          username,
          phone,
          image,
          branch_id,
          is_system_user: is_system_user ? 1 : 0,
          is_agent: is_agent ? 1 : 0,
          salary: salary !== undefined ? salary : 0
        };
            if (password) {
              userData.password = bcrypt.hashSync(password, 10);
            }
        User.create(userData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_user') });
          res.status(201).json({ message: i18n.__('messages.user_created'), user: { id: result.insertId, ...userData } });
        });
      });
    });
  }
];

exports.filter = (req, res) => {
  const { search } = req.query;
  if (!search) {
    return res.status(400).json({ error: i18n.__('validation.required.search') });
  }
  User.filter(search, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_users') });
    res.status(200).json(result);
  });
};


// Get all users
exports.getAll = (req, res) => {
  User.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_users') });
    res.status(200).json(result);
  });
};

// Get user by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  User.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get All Agents

exports.getAllAgents = (req, res) => {
  User.getAllAgents((err, result) => {
    if (err) return res.status(400).json({ error: 'Error fetching agents' });
    res.json(result);
  });
};

// Update user
exports.update = [
  upload.single('image'),
  (req, res) => {
    const { id } = req.params;

const { name, username, phone, branch_id, password, is_system_user, is_agent, salary } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image; // keep old if not uploading new
  
    // Validate input
    if (!name) return res.status(400).json({ error: i18n.__('validation.required.user_name') });
    if (!username) return res.status(400).json({ error: i18n.__('validation.required.username') });
    if (!phone) return res.status(400).json({ error: i18n.__('validation.required.phone') });
    if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
   // if (is_system_user == 1 && !password && !selectedUserId) return res.status(400).json({ error: i18n.__('validation.required.password') });

    Branch.getById(branch_id, (err, branchResult) => {
      if (err || branchResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
      }

      User.getByUsername(username, (err, userResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
        // Allow update if username is unchanged or not taken by another user
        if (userResult.length > 0 && userResult[0].id != id) {
          return res.status(400).json({ error: i18n.__('validation.unique.username') });
        }

      const userData = {
        name,
        username,
        phone,
        image,
        branch_id,
        is_system_user: is_system_user ? 1 : 0,
        is_agent: is_agent ? 1 : 0,
        salary: salary !== undefined ? salary : 0
      };
          if (!password) {
          // Fetch current user to get the existing password
          User.getById(id, (err, userResult) => {
            if (err || userResult.length === 0) {
              return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
            }
            userData.password = userResult[0].password;
            // ...call User.update here...
          });
          return;
        }
       
        User.update(id, userData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_user') });
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
          res.status(200).json({ message: i18n.__('messages.user_updated') });
        });
      });
    });
  }
];

// Soft delete user
exports.delete = (req, res) => {
  const { id } = req.params;
  User.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_user') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
    res.status(200).json({ message: i18n.__('messages.user_deleted') });
  });
};

// Login user
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: i18n.__('validation.required.username_and_password') });
  }

  User.getByUsername(username, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });

    const user = result[0];

    // Check password
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: i18n.__('validation.invalid.password') });
    }

    // Generate token
     const expiresIn = 2 * 60 * 60; // the token will be valid for 2 hours
     //const expiresIn = 3 * 60; //  the token will be valid for 3 minute

    
    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn });
   // const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn });

  
    // Calculate expiry timestamp for frontend (milliseconds)
    const expiryTimestamp = Date.now() + expiresIn * 1000;
    // Set token and expiry in response headers

      res.status(200).json({
      message: i18n.__('messages.login_successful'),
      token,
      expiresAt: expiryTimestamp
    });
  });
};

// Logout user
exports.logout = (req, res) => {
  // Invalidate the token (this can be done by implementing token blacklisting or simply by the client deleting the token)
  res.status(200).json({ message: i18n.__('messages.logout_successful') });
};

// Middleware to authenticate user
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: i18n.__('validation.required.token') });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(400).json({ error: i18n.__('validation.invalid.token') });
  }
};