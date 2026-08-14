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
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 w-full sm:w-80 lg:w-96 flex-shrink-0 z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Classroom Chat
          </h3>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-3xs font-medium">
            {messages.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-dark-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <p className="text-xs">No messages yet.</p>
            <p className="text-3xs text-slate-600 mt-1">Say hello to the classroom!</p>
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
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950/60">
        {isTeacher && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <label className="flex items-center gap-1.5 text-3xs text-amber-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/20"
              />
              <Megaphone className="w-3 h-3" />
              <span>Send as Classroom Announcement</span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={isAnnouncement ? 'Type announcement...' : 'Send a message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800/90 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!inputText.trim()}
            className="px-3 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-white"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
