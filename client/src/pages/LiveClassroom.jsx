import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Video,
  Users,
  MessageSquare,
  PhoneOff,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import useWebRTC from '../hooks/useWebRTC';
import classroomService from '../services/classroom.service';
import VideoGrid from '../components/video/VideoGrid';
import LiveControls from '../components/video/LiveControls';
import ChatPanel from '../components/chat/ChatPanel';
import ParticipantList from '../components/classroom/ParticipantList';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';

export const LiveClassroom = () => {
  const { id: classroomId } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { socket, isConnected } = useSocket();

  const [classroom, setClassroom] = useState(null);
  const [participants, setParticipants] = useState([]); // Active live participants in room
  const [messages, setMessages] = useState([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebRTC Hook
  const {
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
  } = useWebRTC(socket, classroomId, user);

  // Fetch Classroom details on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        const data = await classroomService.getClassroomById(classroomId);
        if (isMounted) {
          setClassroom(data);
          // If student and class is not live yet, still allow entry with status
        }
      } catch (err) {
        console.error('[LiveClassroom fetch error]:', err);
        if (isMounted) setError(err.message || 'Failed to connect to live classroom.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [classroomId]);

  // Join Classroom & Initialize Media
  useEffect(() => {
    if (!socket || !isConnected || !classroomId || !user) return;

    let cleanupFn = () => {};

    const joinRoomAndMedia = async () => {
      // 1. Start local camera / mic
      const stream = await startLocalMedia();

      // 2. Join Socket.io room
      const hasAudio = stream ? stream.getAudioTracks().some((t) => t.enabled) : false;
      const hasVideo = stream ? stream.getVideoTracks().some((t) => t.enabled) : false;

      socket.emit('classroom:join', {
        classroomId,
        isAudioEnabled: hasAudio,
        isVideoEnabled: hasVideo,
      });
    };

    joinRoomAndMedia();

    // Socket Event Listeners for Presence, Chat, and Moderation
    const handleInitialParticipants = ({ participants: initialList, self }) => {
      setParticipants([...initialList, self]);
    };

    const handleUserJoined = ({ participant }) => {
      setParticipants((prev) => {
        const filtered = prev.filter((p) => p.socketId !== participant.socketId);
        return [...filtered, participant];
      });
    };

    const handleUserLeft = ({ socketId }) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    };

    const handleHandUpdated = ({ socketId, isHandRaised: raised }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised: raised } : p))
      );
      if (socketId === socket.id) {
        setIsHandRaised(raised);
      }
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadChatCount((prev) => prev + 1);
      }
    };

    const handleParticipantRemoved = ({ message: removeMsg }) => {
      alert(removeMsg || 'You have been removed from the classroom.');
      cleanupMedia();
      navigate(`/classrooms/${classroomId}`);
    };

    const handleClassroomEnded = () => {
      alert('The teacher has ended the live session.');
      cleanupMedia();
      navigate(`/classrooms/${classroomId}`);
    };

    socket.on('classroom:participants', handleInitialParticipants);
    socket.on('classroom:user-joined', handleUserJoined);
    socket.on('classroom:user-left', handleUserLeft);
    socket.on('hand:updated', handleHandUpdated);
    socket.on('chat:message', handleChatMessage);
    socket.on('participant:removed', handleParticipantRemoved);
    socket.on('classroom:ended', handleClassroomEnded);

    cleanupFn = () => {
      socket.emit('classroom:leave', { classroomId });
      socket.off('classroom:participants', handleInitialParticipants);
      socket.off('classroom:user-joined', handleUserJoined);
      socket.off('classroom:user-left', handleUserLeft);
      socket.off('hand:updated', handleHandUpdated);
      socket.off('chat:message', handleChatMessage);
      socket.off('participant:removed', handleParticipantRemoved);
      socket.off('classroom:ended', handleClassroomEnded);
      cleanupMedia();
    };

    return () => {
      cleanupFn();
    };
  }, [socket, isConnected, classroomId, user]);

  // Chat panel toggle
  const handleToggleChat = () => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadChatCount(0);
      return !prev;
    });
  };

  // Participant list toggle
  const handleToggleParticipants = () => {
    setIsParticipantsOpen((prev) => !prev);
  };

  // Hand raise toggle
  const handleToggleHand = () => {
    if (isHandRaised) {
      socket?.emit('hand:lower');
      setIsHandRaised(false);
    } else {
      socket?.emit('hand:raise');
      setIsHandRaised(true);
    }
  };

  // Teacher Moderation Actions
  const handleMuteParticipant = (targetSocketId) => {
    socket?.emit('participant:mute', { targetSocketId });
  };

  const handleRemoveParticipant = (targetSocketId) => {
    if (window.confirm('Are you sure you want to remove this participant from the live classroom?')) {
      socket?.emit('participant:remove', { targetSocketId });
    }
  };

  // Send Chat message
  const handleSendMessage = ({ content, type }) => {
    socket?.emit('chat:send', {
      classroomId,
      content,
      type,
    });
  };

  // Leave Class
  const handleLeaveClass = () => {
    cleanupMedia();
    navigate(`/classrooms/${classroomId}`);
  };

  // End Class (Teacher)
  const handleEndClass = async () => {
    if (!window.confirm('Are you sure you want to end this live class for all participants?')) return;
    try {
      await classroomService.endLiveSession(classroomId);
      socket?.emit('classroom:ended', { classroomId });
      cleanupMedia();
      navigate(`/classrooms/${classroomId}`);
    } catch (err) {
      console.error('[End class error]:', err);
      cleanupMedia();
      navigate(`/classrooms/${classroomId}`);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Entering live classroom theater..." />;
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Classroom Connection Failed</h2>
          <p className="text-xs text-slate-400">{error || 'Could not join live classroom.'}</p>
          <Link to="/dashboard">
            <Button variant="outline" size="md">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isClassroomTeacher = isTeacher && (classroom.teacher?._id === user?._id || classroom.teacher === user?._id);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to={`/classrooms/${classroomId}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Classroom Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
                {classroom.name}
              </h2>
              <Badge variant="live" size="sm" className="font-bold uppercase tracking-wider text-3xs">
                LIVE
              </Badge>
            </div>
            <span className="text-3xs text-slate-400 hidden sm:inline-block">
              Subject: {classroom.subject}
            </span>
          </div>
        </div>

        {/* Media Warning Banner if permissions failed */}
        {mediaError && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-3xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Audio/Video Restricted (Text chat available)</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isClassroomTeacher ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndClass}
              className="text-xs bg-rose-600 hover:bg-rose-700"
            >
              End Session
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={handleLeaveClass}
              className="text-xs bg-rose-600 hover:bg-rose-700"
            >
              Leave Session
            </Button>
          )}
        </div>
      </header>

      {/* Main Center Area: Video Grid + Optional Collapsible Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Video Theater */}
        <main className="flex-1 h-full p-2 sm:p-4 overflow-y-auto custom-dark-scrollbar flex items-center justify-center">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            currentUser={user}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isHandRaised={isHandRaised}
            isTeacher={isClassroomTeacher}
            classroomTeacherId={classroom.teacher?._id || classroom.teacher}
          />
        </main>

        {/* Collapsible Participants Sidebar */}
        {isParticipantsOpen && (
          <aside className="w-full sm:w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full flex-shrink-0 z-30 animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Live Participants ({participants.length})
              </h3>
              <button
                onClick={() => setIsParticipantsOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto custom-dark-scrollbar">
              <ParticipantList
                participants={participants}
                currentUserId={user?._id}
                isTeacher={isClassroomTeacher}
                onMuteParticipant={handleMuteParticipant}
                onRemoveParticipant={handleRemoveParticipant}
              />
            </div>
          </aside>
        )}

        {/* Collapsible Real-Time Chat Panel */}
        {isChatOpen && (
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={user?._id}
            isTeacher={isClassroomTeacher}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>

      {/* Bottom Control Bar */}
      <LiveControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleHand={handleToggleHand}
        onToggleChat={handleToggleChat}
        onToggleParticipants={handleToggleParticipants}
        onLeaveClass={handleLeaveClass}
        onEndClass={handleEndClass}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadChatCount={unreadChatCount}
        participantCount={participants.length}
        isTeacher={isClassroomTeacher}
      />
    </div>
  );
};

export default LiveClassroom;
