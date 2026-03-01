const admin = require('firebase-admin');

// Debug: Log environment variables (remove in production)
// console.log('🔧 Firebase Config Debug:');
// console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
// console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET');
// console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'NOT SET');

// Validate Firebase environment variables
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ Error: FIREBASE_PROJECT_ID is not set in .env file');
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Error: FIREBASE_PRIVATE_KEY is not set in .env file');
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Error: FIREBASE_CLIENT_EMAIL is not set in .env file');
}

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

module.exports = admin;
