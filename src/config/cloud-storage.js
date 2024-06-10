const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const storage = new Storage({
  keyFilename: 'artscape-key.json',
  projectId: process.env.FIRESTORE_PROJECT_ID
});

const bucketName = 'artscape-bucket';
const bucket = storage.bucket(bucketName);

module.exports = bucket;
