const { Server } = require('socket.io');
const { admin, firebaseAdminInitialized } = require('../config/firebase');
const User = require('../models/User');
const { registerClassroomSocketHandlers } = require('./classroom.socket');
const registerChatSocketHandlers = require('./chat.socket');
const registerWebRTCSocketHandlers = require('./webrtc.socket');

const initSocketIO = (server) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
  ];

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
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

      if (!firebaseAdminInitialized) {
        return next(new Error('Firebase Admin authentication not configured.'));
      }

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err) {
        console.error('[Socket Auth] Firebase token verification failed:', err.message);
        return next(new Error('Invalid or expired Firebase ID token.'));
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
        return next(new Error('User profile not found in database.'));
      }

      // Attach user to socket
      socket.user = user;
      socket.firebaseUid = decodedToken.uid;
      next();
    } catch (error) {
      console.error('[Socket Auth Error]:', error.message);
      next(new Error('Socket authentication failed.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] User: ${socket.user?.name} (${socket.user?.role}) - ID: ${socket.id}`);

    // Register Modular Handlers
    registerClassroomSocketHandlers(io, socket);
    registerChatSocketHandlers(io, socket);
    registerWebRTCSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnect] Socket ${socket.id} - Reason: ${reason}`);
    });
  });

  return io;
};

module.exports = initSocketIO;
