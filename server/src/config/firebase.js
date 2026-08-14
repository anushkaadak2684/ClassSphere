const admin = require('firebase-admin');

let firebaseAdminInitialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    firebaseAdminInitialized = true;
    console.log('[Firebase Admin] Initialized with environment credentials');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    firebaseAdminInitialized = true;
    console.log('[Firebase Admin] Initialized with application default credentials');
  } else {
    console.warn('[Firebase Admin Warning] Credentials not fully supplied in environment. Running in development mode.');
  }
} catch (error) {
  console.error('[Firebase Admin Init Error]:', error.message);
}

module.exports = {
  admin,
  firebaseAdminInitialized,
};
