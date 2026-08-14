const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Sync or create user profile after Firebase Authentication
 * POST /api/users/sync
 */
const syncUser = asyncHandler(async (req, res) => {
  const { name, role, avatarUrl } = req.body;
  const firebaseUid = req.firebaseUser.uid;
  const email = req.firebaseUser.email || req.body.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required to sync user profile.',
    });
  }

  let user = await User.findOne({ firebaseUid });

  if (!user) {
    // Check if user exists by email
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (user) {
    // Update existing user
    user.firebaseUid = firebaseUid;
    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    // Don't overwrite existing role unless specified explicitly on profile creation
    if (role && !user.role) user.role = role;
    await user.save();
  } else {
    // Create new user profile
    const selectedRole = role === 'teacher' ? 'teacher' : 'student';
    user = await User.create({
      firebaseUid,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: selectedRole,
      avatarUrl: avatarUrl || '',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Get current authenticated user profile
 * GET /api/users/me
 */
const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found in database.',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      _id: req.user._id,
      firebaseUid: req.user.firebaseUid,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * Update current user profile
 * PUT /api/users/me
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;

  if (name) req.user.name = name;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;

  await req.user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: req.user._id,
      firebaseUid: req.user.firebaseUid,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
    },
  });
});

module.exports = {
  syncUser,
  getMe,
  updateMe,
};
