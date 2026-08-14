import React from 'react';
import { Mic, MicOff, Hand, UserX, Crown, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export const ParticipantList = ({
  participants = [],
  currentUserId,
  isTeacher = false,
  onMuteParticipant,
  onRemoveParticipant,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {participants.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No participants joined yet.</p>
      ) : (
        participants.map((p) => {
          const isSelf = p.user?._id === currentUserId;
          const participantIsTeacher = p.user?.role === 'teacher';

          return (
            <div
              key={p.socketId || p._id || p.user?._id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
            >
              {/* User Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs border border-brand-200 flex-shrink-0">
                    {p.user?.avatarUrl ? (
                      <img
                        src={p.user.avatarUrl}
                        alt={p.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      p.user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  {p.isHandRaised && (
                    <span
                      title="Hand Raised"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs animate-bounce"
                    >
                      <Hand className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {p.user?.name || 'Anonymous'}
                    </p>
                    {isSelf && (
                      <span className="text-3xs text-slate-400 font-medium">(You)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {participantIsTeacher ? (
                      <Badge variant="brand" size="sm" className="text-3xs py-0">
                        <Crown className="w-2.5 h-2.5 mr-0.5" /> Teacher
                      </Badge>
                    ) : (
                      <span className="text-3xs text-slate-500 capitalize">
                        {p.user?.role || 'Student'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Moderation Controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Audio Status */}
                <span
                  title={p.isAudioEnabled ? 'Microphone On' : 'Microphone Muted'}
                  className={`p-1.5 rounded-md text-xs ${
                    p.isAudioEnabled
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-400 bg-slate-100'
                  }`}
                >
                  {p.isAudioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </span>

                {/* Teacher moderation controls on students */}
                {isTeacher && !participantIsTeacher && !isSelf && (
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-1">
                    {p.isAudioEnabled && onMuteParticipant && (
                      <button
                        onClick={() => onMuteParticipant(p.socketId)}
                        title="Mute Participant"
                        className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <MicOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onRemoveParticipant && (
                      <button
                        onClick={() => onRemoveParticipant(p.socketId)}
                        title="Remove from Class"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ParticipantList;
