import { Link, useLocation } from 'react-router-dom';
import { useAgentMode } from '../context/AgentModeContext';

interface AppHeaderProps {
  onNewReport?: () => void;
  onOpenChat?: () => void;
  chatBadge?: number;
}

export function AppHeader({ onNewReport, onOpenChat, chatBadge }: AppHeaderProps) {
  const { mode, toggle } = useAgentMode();
  const location = useLocation();
  const isWorker = location.pathname === '/' || location.pathname === '/worker';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔧</span>
        <h1 className="font-bold text-gray-900 text-base">
          {isWorker ? 'Work Report' : 'Manager View'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode toggle */}
        <button
          onClick={toggle}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
            mode === 'live'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-gray-100 text-gray-500 border border-gray-300'
          }`}
          title={mode === 'live' ? 'Connected to Nanoclaw — click to switch to Mock' : 'Using Mock — click to switch to Live'}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${mode === 'live' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {mode === 'live' ? 'Live' : 'Mock'}
        </button>

        {/* Role nav */}
        {isWorker ? (
          <Link to="/manager" className="text-xs text-gray-500 hover:text-gray-700 font-medium">
            Manager
          </Link>
        ) : (
          <Link to="/worker" className="text-xs text-gray-500 hover:text-gray-700 font-medium">
            ← Worker
          </Link>
        )}

        {/* Worker-only controls */}
        {isWorker && onNewReport && (
          <button
            onClick={onNewReport}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            New report
          </button>
        )}
        {isWorker && onOpenChat && (
          <button
            onClick={onOpenChat}
            className="relative text-xl"
            aria-label="Open conversation"
          >
            💬
            {chatBadge != null && chatBadge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-[10px] rounded-full font-bold">
                {chatBadge}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
