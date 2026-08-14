import React from 'react';
import { Megaphone, Crown } from 'lucide-react';
import Badge from '../common/Badge';

export const ChatMessage = ({ message, isSelf = false }) => {
  const isAnnouncement = message.type === 'ANNOUNCEMENT';
  const senderIsTeacher = message.sender?.role === 'teacher';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex flex-col ${
        isAnnouncement
          ? 'items-center my-2'
          : isSelf
          ? 'items-end'
          : 'items-start'
      }`}
    >
      {isAnnouncement ? (
        // Teacher Announcement Style
        <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Classroom Announcement</span>
            <span className="text-3xs text-amber-400/70 ml-auto">{formatTime(message.createdAt)}</span>
          </div>
          <p className="text-xs text-amber-100 leading-relaxed break-words">{message.content}</p>
          <span className="text-3xs text-amber-400/80 mt-1 block">— {message.sender?.name || 'Teacher'}</span>
        </div>
      ) : (
        // Standard Chat Message Style
        <div className={`max-w-[85%] ${isSelf ? 'items-end' : 'items-start'}`}>
          {!isSelf && (
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-2xs font-semibold text-slate-300 truncate max-w-[120px]">
                {message.sender?.name || 'User'}
              </span>
              {senderIsTeacher && (
                <span className="inline-flex items-center text-3xs font-semibold text-brand-400 bg-brand-950/80 px-1.5 py-0.2 rounded border border-brand-800/50">
                  <Crown className="w-2.5 h-2.5 mr-0.5" /> Teacher
                </span>
              )}
              <span className="text-3xs text-slate-500">{formatTime(message.createdAt)}</span>
            </div>
          )}

          <div
            className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
              isSelf
                ? 'bg-brand-600 text-white rounded-br-xs'
                : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60'
            }`}
          >
            {message.content}
          </div>

          {isSelf && (
            <div className="text-right px-1 mt-0.5">
              <span className="text-3xs text-slate-500">{formatTime(message.createdAt)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
