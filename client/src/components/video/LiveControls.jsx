import React from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Hand,
  MessageSquare,
  Users,
  PhoneOff,
} from 'lucide-react';

export const LiveControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isHandRaised,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHand,
  onToggleChat,
  onToggleParticipants,
  onLeaveClass,
  onEndClass,
  isChatOpen,
  isParticipantsOpen,
  unreadChatCount = 0,
  participantCount = 1,
  isTeacher = false,
}) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-2 shadow-xl z-30 select-none transition-colors">
      {/* Left section: Participant count / Info */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleParticipants}
          title="Participants"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            isParticipantsOpen
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">People</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-950/60 text-[10px] font-bold">
            {participantCount}
          </span>
        </button>
      </div>

      {/* Center section: Media & Interaction Toggles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleAudio}
          title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          className={`p-3 rounded-full transition-all duration-150 shadow-md ${
            isAudioEnabled
              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          className={`p-3 rounded-full transition-all duration-150 shadow-md ${
            isVideoEnabled
              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          className={`p-3 rounded-full transition-all duration-150 shadow-md ${
            isScreenSharing
              ? 'bg-brand-600 hover:bg-brand-700 text-white ring-2 ring-brand-400'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
          }`}
        >
          <MonitorUp className="w-5 h-5" />
        </button>

        {/* Raise Hand Toggle (Student only) */}
        {!isTeacher && (
          <button
            onClick={onToggleHand}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            className={`p-3 rounded-full transition-all duration-150 shadow-md ${
              isHandRaised
                ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right section: Chat Toggle & Leave/End Session */}
      <div className="flex items-center gap-2">
        {/* Chat Toggle Button */}
        <button
          onClick={onToggleChat}
          title="Open Classroom Chat"
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            isChatOpen
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Chat</span>
          {unreadChatCount > 0 && !isChatOpen && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Leave or End Class Button */}
        {isTeacher ? (
          <button
            onClick={onEndClass}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Class</span>
          </button>
        ) : (
          <button
            onClick={onLeaveClass}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveControls;
