// ============================================================
// middleware/uploadMiddleware.js - Multer File Upload Handler
// ============================================================
// Configures Multer storage, allowed file types, and size limits
// for employee profile pictures and HR documents.
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
const documentsDir = path.join(__dirname, '..', 'uploads', 'documents');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'document') {
      cb(null, 'uploads/documents');
    } else {
      cb(null, 'uploads/profiles');
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanFieldName = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
    cb(null, `${cleanFieldName}-${Date.now()}${ext}`);
  }
});

// File Type Filter (jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (.jpg, .jpeg, .png) are permitted!'));
  }
};

// Multer Instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

// Export configured middleware
const uploadProfile = upload.single('profilePhoto');
const uploadDocument = upload.single('document');

module.exports = {
  uploadProfile,
  uploadDocument
};
