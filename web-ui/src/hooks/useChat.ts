import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((role: 'worker' | 'agent', content: string) => {
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: new Date() },
    ]);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, addMessage, reset };
}
