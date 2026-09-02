const Classroom = require('../models/Classroom');
const attendanceService = require('../services/attendance.service');

// Store active classroom participants in memory:
// Map<classroomId, Map<socketId, { socketId, user, isAudioEnabled, isVideoEnabled, isHandRaised, attendanceId, joinedAt }>>
const activeClassroomRooms = new Map();

const getRoomParticipants = (classroomId) => {
  const room = activeClassroomRooms.get(classroomId);
  if (!room) return [];
  return Array.from(room.values());
};

const registerClassroomSocketHandlers = (io, socket) => {
  // Join a live classroom
  socket.on('classroom:join', async ({ classroomId, isAudioEnabled = false, isVideoEnabled = false }) => {
    try {
      if (!classroomId || !socket.user) return;

      const roomName = `classroom:${classroomId}`;
      socket.join(roomName);
      socket.currentClassroomId = classroomId;

      if (!activeClassroomRooms.has(classroomId)) {
        activeClassroomRooms.set(classroomId, new Map());
      }

      const classroomRoom = activeClassroomRooms.get(classroomId);

      // Record attendance if the participant is a student
      let attendanceRecord = null;
      if (socket.user.role === 'student') {
        attendanceRecord = await attendanceService.recordStudentJoin(classroomId, socket.user._id);
      }

      const participantData = {
        socketId: socket.id,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email,
          role: socket.user.role,
          avatarUrl: socket.user.avatarUrl,
        },
        isAudioEnabled: Boolean(isAudioEnabled),
        isVideoEnabled: Boolean(isVideoEnabled),
        isHandRaised: false,
        attendanceId: attendanceRecord ? attendanceRecord._id : null,
        joinedAt: new Date(),
      };

      classroomRoom.set(socket.id, participantData);

      // Send existing active participants to the joining user
      const existingParticipants = Array.from(classroomRoom.values()).filter(
        (p) => p.socketId !== socket.id
      );

      socket.emit('classroom:participants', {
        participants: existingParticipants,
        self: participantData,
      });

      // Broadcast new user joined to all existing participants in the room
      socket.to(roomName).emit('classroom:user-joined', {
        participant: participantData,
      });

      console.log(`[Socket] User ${socket.user.name} (${socket.user.role}) joined ${roomName}`);
    } catch (error) {
      console.error('[Socket classroom:join error]:', error);
    }
  });

  // Leave a live classroom
  socket.on('classroom:leave', async ({ classroomId } = {}) => {
    const targetClassroomId = classroomId || socket.currentClassroomId;
    if (!targetClassroomId) return;

    await handleUserLeavingRoom(io, socket, targetClassroomId);
  });

  // Toggle media state (mic / camera)
  socket.on('media:state-change', ({ isAudioEnabled, isVideoEnabled }) => {
    const classroomId = socket.currentClassroomId;
    if (!classroomId || !activeClassroomRooms.has(classroomId)) return;

    const room = activeClassroomRooms.get(classroomId);
    const participant = room.get(socket.id);
    if (participant) {
      if (typeof isAudioEnabled === 'boolean') participant.isAudioEnabled = isAudioEnabled;
      if (typeof isVideoEnabled === 'boolean') participant.isVideoEnabled = isVideoEnabled;

      io.to(`classroom:${classroomId}`).emit('participant:media-updated', {
        socketId: socket.id,
        isAudioEnabled: participant.isAudioEnabled,
        isVideoEnabled: participant.isVideoEnabled,
      });
    }
  });

  // Student raises hand
  socket.on('hand:raise', () => {
    const classroomId = socket.currentClassroomId;
    if (!classroomId || !activeClassroomRooms.has(classroomId)) return;

    const room = activeClassroomRooms.get(classroomId);
    const participant = room.get(socket.id);
    if (participant) {
      participant.isHandRaised = true;
      io.to(`classroom:${classroomId}`).emit('hand:updated', {
        socketId: socket.id,
        userId: socket.user._id,
        name: socket.user.name,
        isHandRaised: true,
      });
    }
  });

  // Student lowers hand
  socket.on('hand:lower', () => {
    const classroomId = socket.currentClassroomId;
    if (!classroomId || !activeClassroomRooms.has(classroomId)) return;

    const room = activeClassroomRooms.get(classroomId);
    const participant = room.get(socket.id);
    if (participant) {
      participant.isHandRaised = false;
      io.to(`classroom:${classroomId}`).emit('hand:updated', {
        socketId: socket.id,
        userId: socket.user._id,
        name: socket.user.name,
        isHandRaised: false,
      });
    }
  });

  // Teacher mutes a participant
  socket.on('participant:mute', ({ targetSocketId }) => {
    if (socket.user?.role !== 'teacher') return;
    const classroomId = socket.currentClassroomId;
    if (!classroomId) return;

    // Notify the target participant to mute their mic
    io.to(targetSocketId).emit('participant:muted', {
      mutedBy: socket.user.name,
    });

    // Notify room of update
    const room = activeClassroomRooms.get(classroomId);
    if (room && room.has(targetSocketId)) {
      const p = room.get(targetSocketId);
      p.isAudioEnabled = false;
      io.to(`classroom:${classroomId}`).emit('participant:media-updated', {
        socketId: targetSocketId,
        isAudioEnabled: false,
        isVideoEnabled: p.isVideoEnabled,
      });
    }
  });

  // Teacher removes a participant from the classroom
  socket.on('participant:remove', async ({ targetSocketId }) => {
    if (socket.user?.role !== 'teacher') return;
    const classroomId = socket.currentClassroomId;
    if (!classroomId) return;

    // Send removal notification to target participant
    io.to(targetSocketId).emit('participant:removed', {
      removedBy: socket.user.name,
      message: 'You have been removed from the classroom by the teacher.',
    });

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      await handleUserLeavingRoom(io, targetSocket, classroomId);
      targetSocket.leave(`classroom:${classroomId}`);
    }
  });

  // Live session started / ended signals
  socket.on('classroom:started', ({ classroomId }) => {
    if (socket.user?.role !== 'teacher') return;
    io.to(`classroom:${classroomId}`).emit('classroom:started', { classroomId });
  });

  socket.on('classroom:ended', async ({ classroomId }) => {
    if (socket.user?.role !== 'teacher') return;
    const targetClassroomId = classroomId || socket.currentClassroomId;
    if (targetClassroomId) {
      await attendanceService.finalizeClassroomSessions(targetClassroomId);
      io.to(`classroom:${targetClassroomId}`).emit('classroom:ended', { classroomId: targetClassroomId });
    }
  });


  // Handle socket disconnect
  socket.on('disconnect', async () => {
    if (socket.currentClassroomId) {
      await handleUserLeavingRoom(io, socket, socket.currentClassroomId);
    }
    console.log(`[Socket Disconnect] Socket ${socket.id}`);
  });
};

/**
 * Handle participant departure from room & attendance recording
 */
const handleUserLeavingRoom = async (io, socket, classroomId) => {
  const roomName = `classroom:${classroomId}`;
  const room = activeClassroomRooms.get(classroomId);

  if (room && room.has(socket.id)) {
    const participant = room.get(socket.id);

    // Record leave in attendance if student
    if (participant.attendanceId) {
      await attendanceService.recordStudentLeave(participant.attendanceId);
    }

    room.delete(socket.id);
    if (room.size === 0) {
      activeClassroomRooms.delete(classroomId);
    }

    socket.leave(roomName);
    socket.currentClassroomId = null;

    // Broadcast user left to peers
    socket.to(roomName).emit('classroom:user-left', {
      socketId: socket.id,
      userId: socket.user?._id,
      name: socket.user?.name,
    });

    console.log(`[Socket] User ${socket.user?.name || socket.id} left ${roomName}`);
  }
};

module.exports = {
  registerClassroomSocketHandlers,
  getRoomParticipants,
};
