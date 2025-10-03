const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

/**
 * Create a GridFS storage engine for a given bucket
 * @param {string} bucketName - The bucket/collection name in GridFS
 * @returns {GridFsStorage} - Multer storage engine configured for GridFS
 */

function createStorage(bucketName) {
  return new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            console.error('Error generating filename:', err);
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename,
            bucketName   // decides which GridFS bucket (announcements, notes, past_papers, etc.)
          };
          resolve(fileInfo);
        });
      });
    }
  });
}

module.exports = createStorage;