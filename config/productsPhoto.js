const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, function(err, bytes) {
      const fn = bytes.toString('hex') + path.extname(file.originalname);
      cb(null, fn); // Appending extension
    });
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
