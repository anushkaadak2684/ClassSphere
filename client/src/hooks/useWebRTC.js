import { useState, useEffect, useRef, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/**
 * Custom WebRTC Hook for Peer-to-Peer Audio/Video & Screen Sharing
 * @param {object} socket - Socket.io client instance
 * @param {string} classroomId - ID of current classroom
 * @param {object} currentUser - Logged in user object
 */
export const useWebRTC = (socket, classroomId, currentUser) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map()); // Map<peerSocketId, { stream, user, isAudioEnabled, isVideoEnabled }>
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  // References to keep state consistent across async callbacks
  const peerConnections = useRef(new Map()); // Map<peerSocketId, RTCPeerConnection>
  const iceCandidatesQueue = useRef(new Map()); // Map<peerSocketId, Array<RTCIceCandidateInit>>
  const remoteStreamsRef = useRef(new Map()); // Mirror of remoteStreams
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const originalVideoTrackRef = useRef(null);

  // Helper to update remote streams state immutably
  const updateRemoteStream = useCallback((peerId, streamData) => {
    remoteStreamsRef.current.set(peerId, streamData);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.set(peerId, streamData);
      return next;
    });
  }, []);

  const removeRemoteStream = useCallback((peerId) => {
    remoteStreamsRef.current.delete(peerId);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  /**
   * Drain any queued ICE candidates for a peer once remote description is set
   */
  const processQueuedCandidates = useCallback(async (peerSocketId, pc) => {
    const queue = iceCandidatesQueue.current.get(peerSocketId);
    if (queue && queue.length > 0) {
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn(`[WebRTC] Error adding queued ICE candidate for ${peerSocketId}:`, err);
        }
      }
      iceCandidatesQueue.current.delete(peerSocketId);
    }
  }, []);

  /**
   * Initialize Local Camera and Microphone stream
   */
  const startLocalMedia = useCallback(async () => {
    try {
      setMediaError(null);
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch (err) {
        console.warn('[WebRTC] Video+Audio getUserMedia failed, trying Audio only:', err);
        // Fallback: try audio only if camera is unavailable or denied
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setIsVideoEnabled(false);
        } catch (audioErr) {
          console.warn('[WebRTC] Media permissions denied or devices unavailable:', audioErr);
          setMediaError('Camera/Microphone access was denied or not found. You can still participate in chat.');
          // Create an empty dummy stream so RTCPeerConnection still works cleanly
          stream = new MediaStream();
          setIsAudioEnabled(false);
          setIsVideoEnabled(false);
        }
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Store initial video track reference
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        originalVideoTrackRef.current = videoTracks[0];
      }

      return stream;
    } catch (error) {
      console.error('[WebRTC startLocalMedia error]:', error);
      setMediaError(error.message);
      return null;
    }
  }, []);

  /**
   * Create RTCPeerConnection for a given peer
   */
  const createPeerConnection = useCallback((peerSocketId, peerUser) => {
    // If peer connection already exists, return it
    if (peerConnections.current.has(peerSocketId)) {
      return peerConnections.current.get(peerSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', {
          toPeerId: peerSocketId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote track reception
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track (${event.track.kind}) from peer:`, peerSocketId);
      let mediaStream = event.streams && event.streams[0];
      if (!mediaStream) {
        const existing = remoteStreamsRef.current.get(peerSocketId);
        mediaStream = existing?.stream ? new MediaStream(existing.stream.getTracks()) : new MediaStream();
        if (!mediaStream.getTracks().some((t) => t.id === event.track.id)) {
          mediaStream.addTrack(event.track);
        }
      }

      updateRemoteStream(peerSocketId, {
        stream: mediaStream,
        user: peerUser || { name: 'Participant', role: 'student' },
        isAudioEnabled: true,
        isVideoEnabled: true,
      });
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state with ${peerSocketId}:`, pc.iceConnectionState);
    };

    peerConnections.current.set(peerSocketId, pc);
    return pc;
  }, [socket, updateRemoteStream]);

  /**
   * Call a newly joined peer by creating an SDP Offer
   */
  const initiateCall = useCallback(async (peerSocketId, peerUser) => {
    try {
      const pc = createPeerConnection(peerSocketId, peerUser);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      socket.emit('webrtc:offer', {
        toPeerId: peerSocketId,
        offer: offer,
      });
    } catch (error) {
      console.error(`[WebRTC initiateCall Error to ${peerSocketId}]:`, error);
    }
  }, [createPeerConnection, socket]);

  /**
   * Handle incoming SDP Offer from another peer
   */
  const handleReceiveOffer = useCallback(async ({ fromPeerId, fromUser, offer }) => {
    try {
      const pc = createPeerConnection(fromPeerId, fromUser);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await processQueuedCandidates(fromPeerId, pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc:answer', {
        toPeerId: fromPeerId,
        answer: answer,
      });
    } catch (error) {
      console.error(`[WebRTC handleReceiveOffer Error from ${fromPeerId}]:`, error);
    }
  }, [createPeerConnection, processQueuedCandidates, socket]);

  /**
   * Handle incoming SDP Answer
   */
  const handleReceiveAnswer = useCallback(async ({ fromPeerId, answer }) => {
    try {
      const pc = peerConnections.current.get(fromPeerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await processQueuedCandidates(fromPeerId, pc);
      }
    } catch (error) {
      console.error(`[WebRTC handleReceiveAnswer Error from ${fromPeerId}]:`, error);
    }
  }, [processQueuedCandidates]);

  /**
   * Handle incoming ICE Candidate
   */
  const handleReceiveIceCandidate = useCallback(async ({ fromPeerId, candidate }) => {
    try {
      const pc = peerConnections.current.get(fromPeerId);
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!iceCandidatesQueue.current.has(fromPeerId)) {
          iceCandidatesQueue.current.set(fromPeerId, []);
        }
        iceCandidatesQueue.current.get(fromPeerId).push(candidate);
      }
    } catch (error) {
      console.error(`[WebRTC handleReceiveIceCandidate Error from ${fromPeerId}]:`, error);
    }
  }, []);

  /**
   * Remove and clean up peer connection
   */
  const closePeerConnection = useCallback((peerSocketId) => {
    const pc = peerConnections.current.get(peerSocketId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerSocketId);
    }
    iceCandidatesQueue.current.delete(peerSocketId);
    removeRemoteStream(peerSocketId);
  }, [removeRemoteStream]);

  /**
   * Toggle Microphone Audio Track
   */
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      const newState = !audioTracks[0].enabled;
      audioTracks[0].enabled = newState;
      setIsAudioEnabled(newState);

      if (socket) {
        socket.emit('media:state-change', {
          isAudioEnabled: newState,
          isVideoEnabled,
        });
      }
    }
  }, [socket, isVideoEnabled]);

  /**
   * Toggle Camera Video Track
   */
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    const videoTracks = localStreamRef.current.getVideoTracks();
    if (videoTracks.length > 0) {
      const newState = !videoTracks[0].enabled;
      videoTracks[0].enabled = newState;
      setIsVideoEnabled(newState);

      if (socket) {
        socket.emit('media:state-change', {
          isAudioEnabled,
          isVideoEnabled: newState,
        });
      }
    }
  }, [socket, isAudioEnabled]);

  /**
   * Start / Stop Screen Sharing
   */
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop Screen Share -> Revert to camera video track
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      if (originalVideoTrackRef.current && localStreamRef.current) {
        const senders = [];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) senders.push(sender);
        });

        // Replace track on all active peer connections
        for (const sender of senders) {
          await sender.replaceTrack(originalVideoTrackRef.current);
        }

        // Replace track in local stream for self preview
        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (currentVideoTrack) {
          localStreamRef.current.removeTrack(currentVideoTrack);
        }
        localStreamRef.current.addTrack(originalVideoTrackRef.current);
      }

      setIsScreenSharing(false);
    } else {
      // Start Screen Share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        // Listen for browser's native "Stop Sharing" button click
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        // Replace video track on all peer connections with screen track
        const senders = [];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) senders.push(sender);
        });

        for (const sender of senders) {
          await sender.replaceTrack(screenTrack);
        }

        // Update local preview
        const currentVideoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (currentVideoTrack && localStreamRef.current) {
          localStreamRef.current.removeTrack(currentVideoTrack);
          localStreamRef.current.addTrack(screenTrack);
        }

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('[Screen Share cancelled or failed]:', err);
      }
    }
  }, [isScreenSharing]);

  /**
   * Complete Media Cleanup (on leave or unmount)
   */
  const cleanupMedia = useCallback(() => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    setRemoteStreams(new Map());
    setLocalStream(null);
    setIsScreenSharing(false);
  }, []);

  // Wire up Socket Signaling Listeners
  useEffect(() => {
    if (!socket || !classroomId) return;

    // Existing participants received when joining room
    const handleParticipantsList = async ({ participants }) => {
      console.log('[WebRTC] Received initial participants list:', participants);
      // As the newly joined participant, initiate WebRTC calls to all existing peers in the room
      for (const p of participants) {
        if (p.socketId !== socket.id) {
          await initiateCall(p.socketId, p.user);
        }
      }
    };

    // New user joined the room -> existing participants wait for their incoming offer (resolves glare)
    const handleUserJoined = ({ participant }) => {
      console.log('[WebRTC] New user joined room (awaiting their offer):', participant);
      // Note: We deliberately do NOT call initiateCall here.
      // The joining user calls all existing peers via handleParticipantsList, preventing dual-offer glare.
    };

    // User left room -> cleanup peer connection
    const handleUserLeft = ({ socketId }) => {
      console.log('[WebRTC] User left room, closing peer connection:', socketId);
      closePeerConnection(socketId);
    };

    // Media status update from a peer
    const handleMediaUpdated = ({ socketId, isAudioEnabled: aEnabled, isVideoEnabled: vEnabled }) => {
      setRemoteStreams((prev) => {
        if (!prev.has(socketId)) return prev;
        const next = new Map(prev);
        const existing = next.get(socketId);
        next.set(socketId, {
          ...existing,
          isAudioEnabled: aEnabled !== undefined ? aEnabled : existing.isAudioEnabled,
          isVideoEnabled: vEnabled !== undefined ? vEnabled : existing.isVideoEnabled,
        });
        return next;
      });
    };

    // Teacher muted this client
    const handleForcedMute = () => {
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks[0].enabled = false;
          setIsAudioEnabled(false);
        }
      }
    };

    socket.on('classroom:participants', handleParticipantsList);
    socket.on('classroom:user-joined', handleUserJoined);
    socket.on('classroom:user-left', handleUserLeft);
    socket.on('participant:media-updated', handleMediaUpdated);
    socket.on('participant:muted', handleForcedMute);

    // WebRTC Signaling events
    socket.on('webrtc:offer', handleReceiveOffer);
    socket.on('webrtc:answer', handleReceiveAnswer);
    socket.on('webrtc:ice-candidate', handleReceiveIceCandidate);

    return () => {
      socket.off('classroom:participants', handleParticipantsList);
      socket.off('classroom:user-joined', handleUserJoined);
      socket.off('classroom:user-left', handleUserLeft);
      socket.off('participant:media-updated', handleMediaUpdated);
      socket.off('participant:muted', handleForcedMute);
      socket.off('webrtc:offer', handleReceiveOffer);
      socket.off('webrtc:answer', handleReceiveAnswer);
      socket.off('webrtc:ice-candidate', handleReceiveIceCandidate);
    };
  }, [
    socket,
    classroomId,
    initiateCall,
    handleReceiveOffer,
    handleReceiveAnswer,
    handleReceiveIceCandidate,
    closePeerConnection,
  ]);

  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    mediaError,
    startLocalMedia,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    cleanupMedia,
  };
};

export default useWebRTC;

