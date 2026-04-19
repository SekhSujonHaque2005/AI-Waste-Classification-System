const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // Attempt to parse if it's a JSON string
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    // If not JSON, it might be base64 encoded
    serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString());
  }
} else {
  // Local development fallback
  try {
    const path = require("path");
    serviceAccount = require(path.join(__dirname, "..", "serviceAccountKey.json"));
  } catch (e) {
    console.error("Firebase Service Account key missing! Set FIREBASE_SERVICE_ACCOUNT env var.");
  }
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized");
}

module.exports = admin;
