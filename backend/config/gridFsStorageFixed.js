const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const path = require('path');

/**
 * Fixed GridFS storage using native MongoDB GridFSBucket
 */
function createStorage(bucketName) {
  return {
    // Generate unique filename
    generateFilename: (file) => {
      return crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    },
    
    // Handle file storage manually with GridFSBucket
    storeFile: async (file, gfs) => {
      return new Promise((resolve, reject) => {
        const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        
        console.log(`📁 Storing file in GridFS as: ${filename}`);

        // Create upload stream with GridFSBucket
        const uploadStream = gfs.openUploadStream(filename, {
          metadata: {
            originalName: file.originalname,
            uploadDate: new Date(),
            mimetype: file.mimetype
          }
        });

        // Handle stream events
        uploadStream.on('finish', () => {
          console.log(`✅ File stored successfully: ${filename}`);
          resolve(filename);
        });

        uploadStream.on('error', (err) => {
          console.error('❌ GridFS upload error:', err);
          reject(err);
        });

        // Write the buffer to the stream
        uploadStream.end(file.buffer);
      });
    }
  };
}

module.exports = createStorage;