const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

/**
 * Create a GridFS storage engine for a given bucket
 */
function createStorage(bucketName) {
  return new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: bucketName,
            metadata: {
              originalName: file.originalname,
              contentType: file.mimetype,
              uploadDate: new Date()
            }
          };
          resolve(fileInfo);
        });
      });
    }
  });
}

module.exports = createStorage;