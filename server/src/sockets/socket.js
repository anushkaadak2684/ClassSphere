const { Server } = require('socket.io');
const { admin, firebaseAdminInitialized } = require('../config/firebase');
const User = require('../models/User');
const { registerClassroomSocketHandlers } = require('./classroom.socket');
const registerChatSocketHandlers = require('./chat.socket');
const registerWebRTCSocketHandlers = require('./webrtc.socket');

const initSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token missing.'));
      }

      let decodedToken;

      if (firebaseAdminInitialized) {
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (err) {
          console.error('[Socket Auth] Token verification failed:', err.message);
          return next(new Error('Invalid token.'));
        }
      } else {
        // Dev fallback decoding
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = Buffer.from(parts[1], 'base64').toString('utf8');
            decodedToken = JSON.parse(payload);
            decodedToken.uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;
          } else {
            decodedToken = { uid: token, email: `${token}@example.com` };
          }
        } catch (e) {
          return next(new Error('Malformed token.'));
        }
      }

      if (!decodedToken || !decodedToken.uid) {
        return next(new Error('Invalid token payload.'));
      }

      // Lookup user in MongoDB
      let user = await User.findOne({ firebaseUid: decodedToken.uid });
      if (!user && decodedToken.email) {
        user = await User.findOne({ email: decodedToken.email.toLowerCase() });
      }

      if (!user) {
        return next(new Error('User profile not found.'));
      }

      socket.user = {
        _id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      };

      next();
    } catch (error) {
      console.error('[Socket Auth Middleware Error]:', error);
      next(new Error('Authentication error.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] User: ${socket.user.name} (${socket.user.role}) - ID: ${socket.id}`);

    // Register all modular socket event handlers
    registerClassroomSocketHandlers(io, socket);
    registerChatSocketHandlers(io, socket);
    registerWebRTCSocketHandlers(io, socket);
  });

  return io;
};

module.exports = initSocketIO;
