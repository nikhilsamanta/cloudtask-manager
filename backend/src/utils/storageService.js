const fs = require('fs');
const path = require('path');

/**
 * Storage Service Abstraction Layer
 * Supports STORAGE_TYPE="local" or STORAGE_TYPE="s3"
 */
class StorageService {
  constructor() {
    this.type = process.env.STORAGE_TYPE || 'local';
  }

  async saveFile(file) {
    if (this.type === 's3') {
      // Future AWS S3 Upload Logic Placeholder
      // const s3Client = new S3Client({ region: process.env.AWS_REGION });
      // await s3Client.send(new PutObjectCommand({ ... }));
      console.log(`[StorageService]: Mocking AWS S3 upload for ${file.originalname}`);
      return {
        url: `https://${process.env.AWS_S3_BUCKET || 'cloudtask-attachments'}.s3.amazonaws.com/${file.filename}`,
        path: file.path,
      };
    } else {
      // Local Storage
      return {
        url: `/uploads/${file.filename}`,
        path: file.path,
      };
    }
  }

  async deleteFile(filePath) {
    if (this.type === 'local' && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = new StorageService();
