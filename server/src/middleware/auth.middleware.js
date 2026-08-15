const { admin, firebaseAdminInitialized } = require('../config/firebase');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Access denied.',
      });
    }

    let decodedToken;

    if (!firebaseAdminInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Admin authentication is not configured on the server.',
      });
    }

    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (verifyError) {
      console.error('[Firebase Token Verification Error]:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Firebase authentication token.',
      });
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase ID token payload.',
      });
    }

    req.firebaseUser = decodedToken;

    // Attach MongoDB user if already synced
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server authentication error.',
    });
  }
};

/**
 * Ensures user is authenticated AND exists in MongoDB
 */
const requireExistingUser = (req, res, next) => {
  if (!req.user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found. Please sync your account.',
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireExistingUser,
};
