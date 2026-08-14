import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Hand, Crown, User } from 'lucide-react';
import Badge from '../common/Badge';

export const VideoTile = ({
  stream,
  user = {},
  isLocal = false,
  isAudioEnabled = true,
  isVideoEnabled = true,
  isHandRaised = false,
  isTeacher = false,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasActiveVideo = isVideoEnabled && stream && stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live');

  return (
    <div className="relative w-full h-full min-h-[180px] bg-slate-900 rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-slate-800 group">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute self to avoid echo feedback
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasActiveVideo ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
        } ${isLocal ? 'scale-x-[-1]' : ''}`} // Mirror local camera preview
      />

      {/* Avatar Fallback when camera is disabled */}
      {!hasActiveVideo && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-inner">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <span className="mt-2 text-xs font-medium text-slate-300 truncate max-w-[150px]">
            {user.name || 'Participant'}
          </span>
        </div>
      )}

      {/* Hand Raised Floating Badge */}
      {isHandRaised && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1.5 text-xs font-semibold shadow-lg animate-bounce z-10">
          <Hand className="w-3.5 h-3.5" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Teacher Crown Badge */}
      {isTeacher && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-brand-600/90 backdrop-blur-xs text-white flex items-center gap-1 text-3xs font-semibold uppercase tracking-wider z-10 shadow-xs">
          <Crown className="w-3 h-3" />
          Teacher
        </div>
      )}

      {/* Bottom Bar: Name Tag & Mic Indicator */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 text-white text-xs font-medium truncate drop-shadow-xs">
          <span className="truncate">{user.name || 'Participant'}</span>
          {isLocal && <span className="text-3xs text-slate-400 font-normal">(You)</span>}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`p-1 rounded-md text-xs ${
              isAudioEnabled
                ? 'bg-slate-800/80 text-emerald-400'
                : 'bg-rose-600 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
