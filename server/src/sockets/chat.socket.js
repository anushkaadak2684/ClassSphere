const Message = require('../models/Message');
const Classroom = require('../models/Classroom');

/**
 * Real-Time Chat Socket Handlers
 */
const registerChatSocketHandlers = (io, socket) => {
  // Fetch chat history for classroom (scoped to current active live session)
  socket.on('chat:history', async ({ classroomId }) => {
    try {
      if (!classroomId) return;

      const classroom = await Classroom.findById(classroomId).lean();
      if (!classroom) return socket.emit('chat:history', []);

      // If the classroom is live or has a liveStartedAt timestamp, scope chat history to current session
      const query = { classroom: classroomId };
      if (classroom.liveStartedAt) {
        query.createdAt = { $gte: classroom.liveStartedAt };
      } else if (!classroom.isLive) {
        // If not live and no current session timestamp, don't show old session chats
        return socket.emit('chat:history', []);
      }

      const messages = await Message.find(query)
        .populate('sender', 'name email avatarUrl role')
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      const formatted = messages.map((m) => ({
        _id: m._id,
        classroomId: m.classroom,
        sender: m.sender || { name: 'Unknown', role: 'student' },
        content: m.content,
        type: m.type,
        createdAt: m.createdAt,
      }));

      socket.emit('chat:history', formatted);
    } catch (error) {
      console.error('[Chat History Error]:', error);
      socket.emit('chat:history', []);
    }
  });

  // Send message in classroom room
  socket.on('chat:send', async ({ classroomId, content, type }) => {
    try {
      if (!classroomId || !content || !content.trim()) return;

      const messageType = type === 'ANNOUNCEMENT' && socket.user?.role === 'teacher' ? 'ANNOUNCEMENT' : 'CHAT';

      // Save message in MongoDB
      const messageDoc = await Message.create({
        classroom: classroomId,
        sender: socket.user._id,
        content: content.trim(),
        type: messageType,
      });

      const populatedMessage = await messageDoc.populate('sender', 'name email avatarUrl role');

      const messagePayload = {
        _id: populatedMessage._id,
        classroomId: classroomId,
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          avatarUrl: socket.user.avatarUrl,
          role: socket.user.role,
        },
        content: populatedMessage.content,
        type: populatedMessage.type,
        createdAt: populatedMessage.createdAt,
      };

      // Broadcast to everyone in the classroom room
      io.to(`classroom:${classroomId}`).emit('chat:message', messagePayload);
    } catch (error) {
      console.error('[Chat Socket Error]:', error);
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });
};

module.exports = registerChatSocketHandlers;

