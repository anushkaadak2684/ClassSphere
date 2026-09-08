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
        <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-left shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-bold mb-1">
            <Megaphone className="w-3 h-3" />
            <span>Classroom Announcement</span>
            <span className="text-[9px] text-amber-500/70 ml-auto font-mono">{formatTime(message.createdAt)}</span>
          </div>
          <p className="text-xs text-slate-800 dark:text-amber-100 leading-relaxed break-words">{message.content}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1 block font-medium">— {message.sender?.name || 'Teacher'}</span>
        </div>
      ) : (
        // Standard Chat Message Style
        <div className={`max-w-[85%] ${isSelf ? 'items-end' : 'items-start'}`}>
          {!isSelf && (
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {message.sender?.name || 'User'}
              </span>
              {senderIsTeacher && (
                <span className="inline-flex items-center text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-1 py-0.2 rounded border border-brand-200 dark:border-brand-800/50 leading-tight">
                  <Crown className="w-2.5 h-2.5 mr-0.5 text-brand-500" /> Teacher
                </span>
              )}
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono">{formatTime(message.createdAt)}</span>
            </div>
          )}

          <div
            className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
              isSelf
                ? 'bg-brand-600 text-white rounded-br-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/60'
            }`}
          >
            {message.content}
          </div>

          {isSelf && (
            <div className="text-right px-1 mt-0.5">
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono">{formatTime(message.createdAt)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
