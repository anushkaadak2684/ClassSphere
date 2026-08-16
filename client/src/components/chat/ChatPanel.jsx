import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Megaphone } from 'lucide-react';
import ChatMessage from './ChatMessage';
import Button from '../common/Button';

export const ChatPanel = ({
  messages = [],
  onSendMessage,
  currentUserId,
  isTeacher = false,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      content: inputText.trim(),
      type: isAnnouncement && isTeacher ? 'ANNOUNCEMENT' : 'CHAT',
    });

    setInputText('');
    setIsAnnouncement(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 w-full sm:w-80 lg:w-96 shrink-0 z-30 shadow-xl transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Classroom Chat
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
            {messages.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-dark-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-12">
            <p className="text-xs font-medium">No messages yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Say hello to the classroom!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg._id || idx}
              message={msg}
              isSelf={msg.sender?._id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60">
        {isTeacher && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <label className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500/20"
              />
              <Megaphone className="w-3.5 h-3.5" />
              <span>Send as Announcement</span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={isAnnouncement ? 'Type announcement...' : 'Send a message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputText.trim()}
            icon={Send}
            className="px-3"
          />
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
