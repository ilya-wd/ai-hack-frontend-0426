import type { VoiceState } from '../hooks/useVoiceInput';

interface Props {
  state: VoiceState;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({ state, isSupported, onStart, onStop }: Props) {
  if (!isSupported) {
    return (
      <div className="flex-1 text-center text-xs text-gray-400 py-2">
        Voice not supported. Use Chrome or Safari.
      </div>
    );
  }

  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  return (
    <button
      onPointerDown={onStart}
      onPointerUp={onStop}
      onPointerLeave={onStop}
      disabled={isProcessing}
      aria-label={isListening ? 'Release to stop recording' : 'Hold to speak'}
      className={`
        flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-medium text-sm transition-all
        ${isListening
          ? 'bg-red-500 text-white scale-95 shadow-inner'
          : isProcessing
          ? 'bg-gray-200 text-gray-400 cursor-wait'
          : 'bg-blue-600 text-white active:scale-95 shadow-md'}
      `}
    >
      {isListening ? (
        <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          Listening…
        </>
      ) : isProcessing ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Processing…
        </>
      ) : (
        <>
          <span className="text-lg">🎤</span>
          Hold to speak
        </>
      )}
    </button>
  );
}
