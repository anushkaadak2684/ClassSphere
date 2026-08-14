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

    if (firebaseAdminInitialized) {
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (verifyError) {
        console.error('[Token Verification Error]:', verifyError.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }
    } else {
      // In development mode when Firebase Admin credentials are not yet set up in .env,
      // safely decode JWT payload to keep development smooth and testable
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = Buffer.from(parts[1], 'base64').toString('utf8');
          decodedToken = JSON.parse(payload);
          // Standardize uid / user_id
          decodedToken.uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;
        } else {
          // Dev test token format
          decodedToken = { uid: token, email: `${token}@example.com` };
        }
      } catch (decodeErr) {
        return res.status(401).json({
          success: false,
          message: 'Malformed authentication token.',
        });
      }
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user token payload.',
      });
    }

    // Lookup user in MongoDB by firebaseUid
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user && decodedToken.email) {
      // Fallback lookup by email if UID changed
      user = await User.findOne({ email: decodedToken.email.toLowerCase() });
      if (user) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    req.firebaseUser = decodedToken;
    req.user = user; // may be null on initial registration/sync endpoint

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// Middleware requiring that the user must already exist in MongoDB
const requireExistingUser = (req, res, next) => {
  if (!req.user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found. Please complete profile registration.',
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireExistingUser,
};
