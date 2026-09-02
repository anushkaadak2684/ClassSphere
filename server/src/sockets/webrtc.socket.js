/**
 * WebRTC Signaling Socket Handlers
 * Relays SDP offers, SDP answers, and ICE candidates between peers
 */
const registerWebRTCSocketHandlers = (io, socket) => {
  // Relay SDP offer to target peer
  socket.on('webrtc:offer', ({ toPeerId, offer }) => {
    if (!toPeerId || !offer) return;
    const targetSocket = io.sockets.sockets.get(toPeerId);
    if (!targetSocket) return;

    io.to(toPeerId).emit('webrtc:offer', {
      fromPeerId: socket.id,
      fromUser: socket.user,
      offer: offer,
    });
  });

  // Relay SDP answer to target peer
  socket.on('webrtc:answer', ({ toPeerId, answer }) => {
    if (!toPeerId || !answer) return;
    const targetSocket = io.sockets.sockets.get(toPeerId);
    if (!targetSocket) return;

    io.to(toPeerId).emit('webrtc:answer', {
      fromPeerId: socket.id,
      fromUser: socket.user,
      answer: answer,
    });
  });

  // Relay ICE candidate to target peer
  socket.on('webrtc:ice-candidate', ({ toPeerId, candidate }) => {
    if (!toPeerId || !candidate) return;
    const targetSocket = io.sockets.sockets.get(toPeerId);
    if (!targetSocket) return;

    io.to(toPeerId).emit('webrtc:ice-candidate', {
      fromPeerId: socket.id,
      candidate: candidate,
    });
  });
};

module.exports = registerWebRTCSocketHandlers;

