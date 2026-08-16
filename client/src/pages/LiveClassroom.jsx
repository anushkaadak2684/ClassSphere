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
  GraduationCap,
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
import ThemeToggle from '../components/common/ThemeToggle';

export const LiveClassroom = () => {
  const { id: classroomId } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { socket, isConnected } = useSocket();

  const [classroom, setClassroom] = useState(null);
  const [participants, setParticipants] = useState([]);
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
      const stream = await startLocalMedia();

      const hasAudio = stream ? stream.getAudioTracks().some((t) => t.enabled) : false;
      const hasVideo = stream ? stream.getVideoTracks().some((t) => t.enabled) : false;

      socket.emit('classroom:join', {
        classroomId,
        isAudioEnabled: hasAudio,
        isVideoEnabled: hasVideo,
      });

      // Request chat history
      socket.emit('chat:history', { classroomId });
    };

    joinRoomAndMedia();

    // Socket Event Listeners
    const handleParticipantJoined = (data) => {
      setParticipants((prev) => {
        const exists = prev.some((p) => p.userId === data.userId);
        if (exists) {
          return prev.map((p) => (p.userId === data.userId ? { ...p, ...data } : p));
        }
        return [...prev, data];
      });
    };

    const handleParticipantLeft = ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
    };

    const handleRoomState = ({ participants: initialParticipants }) => {
      setParticipants(initialParticipants || []);
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadChatCount((count) => count + 1);
      }
    };

    const handleChatHistory = (history) => {
      setMessages(history || []);
    };

    const handleHandStatus = ({ userId, isHandRaised: raised }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, isHandRaised: raised } : p))
      );
      if (userId === user?._id) {
        setIsHandRaised(raised);
      }
    };

    const handleMediaStatus = ({ userId, isAudioEnabled: audio, isVideoEnabled: video }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === userId
            ? {
                ...p,
                isAudioEnabled: audio !== undefined ? audio : p.isAudioEnabled,
                isVideoEnabled: video !== undefined ? video : p.isVideoEnabled,
              }
            : p
        )
      );
    };

    const handleForceMute = () => {
      if (isAudioEnabled) {
        toggleAudio();
      }
    };

    const handleForceRemove = () => {
      alert('You have been removed from this live session by the teacher.');
      navigate(`/classrooms/${classroomId}`);
    };

    socket.on('classroom:participant_joined', handleParticipantJoined);
    socket.on('classroom:participant_left', handleParticipantLeft);
    socket.on('classroom:room_state', handleRoomState);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:history', handleChatHistory);
    socket.on('classroom:hand_raised', handleHandStatus);
    socket.on('classroom:media_status', handleMediaStatus);
    socket.on('classroom:force_mute', handleForceMute);
    socket.on('classroom:force_remove', handleForceRemove);

    return () => {
      socket.emit('classroom:leave', { classroomId });
      socket.off('classroom:participant_joined', handleParticipantJoined);
      socket.off('classroom:participant_left', handleParticipantLeft);
      socket.off('classroom:room_state', handleRoomState);
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:history', handleChatHistory);
      socket.off('classroom:hand_raised', handleHandStatus);
      socket.off('classroom:media_status', handleMediaStatus);
      socket.off('classroom:force_mute', handleForceMute);
      socket.off('classroom:force_remove', handleForceRemove);
      cleanupMedia();
    };
  }, [socket, isConnected, classroomId, user?._id]);

  const handleSendMessage = useCallback(
    (messageData) => {
      if (!socket || !isConnected) return;
      const text = typeof messageData === 'object' ? messageData.content : messageData;
      const msgType = typeof messageData === 'object' && messageData.type ? messageData.type : 'CHAT';
      if (!text || typeof text !== 'string' || !text.trim()) return;
      socket.emit('chat:send', { classroomId, content: text.trim(), type: msgType });
    },
    [socket, isConnected, classroomId]
  );

  const handleToggleHand = useCallback(() => {
    if (!socket || !isConnected) return;
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    socket.emit('classroom:raise_hand', { classroomId, isHandRaised: nextState });
  }, [socket, isConnected, isHandRaised, classroomId]);

  const handleMuteParticipant = useCallback(
    (targetUserId) => {
      if (!socket || !isTeacher) return;
      socket.emit('classroom:moderate_mute', { classroomId, targetUserId });
    },
    [socket, isTeacher, classroomId]
  );

  const handleRemoveParticipant = useCallback(
    (targetUserId) => {
      if (!socket || !isTeacher) return;
      if (window.confirm('Are you sure you want to remove this participant?')) {
        socket.emit('classroom:moderate_remove', { classroomId, targetUserId });
      }
    },
    [socket, isTeacher, classroomId]
  );

  const handleToggleChat = () => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadChatCount(0);
      return !prev;
    });
    if (isParticipantsOpen) setIsParticipantsOpen(false);
  };

  const handleToggleParticipants = () => {
    setIsParticipantsOpen((prev) => !prev);
    if (isChatOpen) setIsChatOpen(false);
  };

  const handleLeaveClass = () => {
    navigate(`/classrooms/${classroomId}`);
  };

  const handleEndClass = async () => {
    if (window.confirm('Are you sure you want to end this live session for all participants?')) {
      try {
        await classroomService.endLiveSession(classroomId);
        navigate(`/classrooms/${classroomId}`);
      } catch (err) {
        console.error('End session error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader size="lg" text="Connecting to ClassSphere Live Theater..." />
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Live Session Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6">{error || 'Could not join classroom session.'}</p>
        <Link to={`/classrooms/${classroomId}`}>
          <Button variant="outline" size="md" icon={ArrowLeft}>
            Return to Classroom Hub
          </Button>
        </Link>
      </div>
    );
  }

  const isClassroomTeacher = isTeacher && (classroom.teacher?._id === user?._id || classroom.teacher === user?._id);

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden select-none transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <Link
            to={`/classrooms/${classroomId}`}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Classroom Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
                {classroom.name}
              </h2>
              <Badge variant="live" size="sm" className="font-bold uppercase tracking-wider text-[10px]">
                LIVE
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline-block">
              Subject: {classroom.subject}
            </span>
          </div>
        </div>

        {/* Screen Sharing Active Status Bar */}
        {isScreenSharing && (
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-500 text-brand-700 dark:text-brand-300 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>Screen Sharing Active</span>
            <button
              onClick={toggleScreenShare}
              className="ml-1 px-2.5 py-0.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold transition-colors"
            >
              Stop Sharing
            </button>
          </div>
        )}

        {/* Media Warning Banner if permissions failed */}
        {mediaError && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Audio/Video Restricted (Text chat active)</span>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <ThemeToggle className="scale-90" />
          {isClassroomTeacher ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndClass}
              className="text-xs bg-rose-600 hover:bg-rose-700 font-bold"
            >
              End Session
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={handleLeaveClass}
              className="text-xs bg-rose-600 hover:bg-rose-700 font-bold"
            >
              Leave Session
            </Button>
          )}
        </div>
      </header>

      {/* Main Center Area: Video Grid + Optional Collapsible Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Video Theater */}
        <main className="flex-1 h-full p-2 sm:p-4 overflow-y-auto custom-dark-scrollbar flex flex-col items-center justify-center relative">
          {isScreenSharing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/95 border border-brand-500/50 shadow-xl backdrop-blur-xs flex items-center gap-2 text-xs text-brand-200">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              <span>You are currently sharing your screen</span>
              <button
                onClick={toggleScreenShare}
                className="ml-2 px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs"
              >
                Stop Sharing
              </button>
            </div>
          )}
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
          <aside className="w-full sm:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 z-30 animate-fade-in shadow-xl transition-colors">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Live Participants ({participants.length})
              </h3>
              <button
                onClick={() => setIsParticipantsOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs p-1"
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
