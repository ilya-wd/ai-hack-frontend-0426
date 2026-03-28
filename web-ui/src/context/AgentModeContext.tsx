import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AgentService } from '../types/agent';
import { MockAgentService } from '../services/mockAgent';
import { NanoclawAgentService } from '../services/nanoclawAgent';

export type AgentMode = 'mock' | 'live';

interface AgentModeContextValue {
  mode: AgentMode;
  agentService: AgentService;
  toggle: () => void;
}

const AgentModeContext = createContext<AgentModeContextValue | null>(null);

const STORAGE_KEY = 'nanoclaw_agent_mode';

function createService(mode: AgentMode): AgentService {
  return mode === 'live' ? new NanoclawAgentService() : new MockAgentService();
}

export function AgentModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AgentMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'live' ? 'live' : 'mock';
  });

  const [agentService, setAgentService] = useState<AgentService>(() => createService(
    localStorage.getItem(STORAGE_KEY) === 'live' ? 'live' : 'mock'
  ));

  const toggle = useCallback(() => {
    setMode(prev => {
      const next: AgentMode = prev === 'mock' ? 'live' : 'mock';
      localStorage.setItem(STORAGE_KEY, next);
      setAgentService(createService(next));
      return next;
    });
  }, []);

  return (
    <AgentModeContext.Provider value={{ mode, agentService, toggle }}>
      {children}
    </AgentModeContext.Provider>
  );
}

export function useAgentMode() {
  const ctx = useContext(AgentModeContext);
  if (!ctx) throw new Error('useAgentMode must be used inside AgentModeProvider');
  return ctx;
}
