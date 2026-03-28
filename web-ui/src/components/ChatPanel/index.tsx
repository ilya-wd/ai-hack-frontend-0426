import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, isOpen, isLoading, onClose, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    onSend(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900">Conversation</h2>
          <p className="text-xs text-gray-500">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-blue-600 font-medium"
        >
          ← Back to form
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <span className="text-4xl mb-2">💬</span>
            <p className="text-sm">No messages yet.<br />Start speaking to log your work.</p>
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            Agent is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pt-3 pb-4 bg-white border-t border-gray-200 safe-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
