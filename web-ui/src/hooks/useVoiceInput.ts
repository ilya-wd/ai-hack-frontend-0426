import { useState, useRef, useCallback } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing';

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  lang?: string;
}

export function useVoiceInput({ onTranscript, lang = 'en-US' }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Safari.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setState('listening');
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      setState('processing');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(event.results as any[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => result[0].transcript)
        .join(' ')
        .trim();
      if (transcript) onTranscript(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setState('idle');
        return;
      }
      setError(`Microphone error: ${event.error}`);
      setState('idle');
    };

    recognition.onend = () => {
      setState(prev => (prev === 'listening' ? 'idle' : prev));
    };

    recognition.start();
  }, [isSupported, lang, onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { state, error, isSupported, start, stop, clearError };
}
