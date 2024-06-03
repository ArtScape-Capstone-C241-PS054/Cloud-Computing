const admin = require('firebase-admin');
const serviceAccount = require('../../artscape-key.json');
const dotenv = require('dotenv');

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIRESTORE_PROJECT_ID
});

const firestore = admin.firestore();
firestore.settings({
  databaseId: process.env.FIRESTORE_DATABASE_ID
});

module.exports = firestore;