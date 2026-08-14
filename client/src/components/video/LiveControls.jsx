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
  ShieldAlert,
} from 'lucide-react';
import Button from '../common/Button';

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
    <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-2 shadow-2xl z-30 select-none">
      {/* Left section: Participant count / Info */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleParticipants}
          title="Participants"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isParticipantsOpen
              ? 'bg-brand-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">People</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-3xs font-semibold">
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
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
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
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
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
              : 'bg-slate-800 hover:bg-slate-700 text-white'
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
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>
        )}

        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          title="Open Classroom Chat"
          className={`relative p-3 rounded-full transition-all duration-150 shadow-md ${
            isChatOpen
              ? 'bg-brand-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {!isChatOpen && unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-3xs font-bold flex items-center justify-center animate-pulse">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>

      {/* Right section: Leave / End Class */}
      <div className="flex items-center gap-2">
        {isTeacher ? (
          <Button
            variant="danger"
            size="sm"
            onClick={onEndClass}
            icon={PhoneOff}
            className="text-xs bg-rose-600 hover:bg-rose-700 whitespace-nowrap"
          >
            <span className="hidden sm:inline">End Class</span>
            <span className="sm:hidden">End</span>
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={onLeaveClass}
            icon={PhoneOff}
            className="text-xs bg-rose-600 hover:bg-rose-700 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Leave</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default LiveControls;
