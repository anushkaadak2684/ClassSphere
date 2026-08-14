const Message = require('../models/Message');

/**
 * Real-Time Chat Socket Handlers
 */
const registerChatSocketHandlers = (io, socket) => {
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
