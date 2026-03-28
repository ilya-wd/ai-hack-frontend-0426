import { useState, useCallback } from 'react';
import { WorkerSelector } from '../components/WorkerSelector';
import { WorkReportForm } from '../components/WorkReportForm';
import { ChatPanel } from '../components/ChatPanel';
import { VoiceButton } from '../components/VoiceButton';
import { AppHeader } from '../components/AppHeader';
import { useWorkReport } from '../hooks/useWorkReport';
import { useChat } from '../hooks/useChat';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAgentMode } from '../context/AgentModeContext';
import type { FormState } from '../types/form';

const VOICEOVER_KEY = 'nanoclaw_voiceover_enabled';

export default function TechnicianApp() {
  const [workerId, setWorkerId] = useState('W-002');
  const [chatOpen, setChatOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [liveError, setLiveError] = useState<string | null>(null);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(() => {
    return localStorage.getItem(VOICEOVER_KEY) !== 'false';
  });

  const { agentService } = useAgentMode();
  const { form, sections, clarification, applyAgentResponse, updateField, reset } = useWorkReport(workerId);
  const { messages, addMessage, reset: resetChat } = useChat();
  const { speak, stop: stopSpeaking } = useSpeechSynthesis();

  const toggleVoiceover = useCallback(() => {
    setVoiceoverEnabled(prev => {
      const next = !prev;
      localStorage.setItem(VOICEOVER_KEY, String(next));
      if (!next) stopSpeaking();
      return next;
    });
  }, [stopSpeaking]);

  const handleTranscript = useCallback(async (text: string) => {
    addMessage('worker', text);
    setIsLoading(true);
    setLiveError(null);
    try {
      const response = await agentService.sendMessage(text, {
        worker_id: workerId,
        date: form.date,
        conversation_id: 'session-1',
      }, form);
      addMessage('agent', response.message);
      applyAgentResponse(response);
      if (voiceoverEnabled) {
        speak(response.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reach agent';
      setLiveError(msg);
      addMessage('agent', `⚠️ ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [agentService, workerId, form, addMessage, applyAgentResponse, voiceoverEnabled, speak]);

  const { state: voiceState, error: voiceError, isSupported, start, stop } = useVoiceInput({
    onTranscript: handleTranscript,
  });

  const handleSendText = useCallback(async () => {
    const text = textInput.trim();
    if (!text || isLoading) return;
    setTextInput('');
    await handleTranscript(text);
  }, [textInput, isLoading, handleTranscript]);

  const handleWorkerChange = (id: string) => {
    setWorkerId(id);
    reset();
    resetChat();
    agentService.reset();
  };

  const handleNewReport = () => {
    reset();
    resetChat();
    agentService.reset();
    setSubmitOpen(false);
    setLiveError(null);
  };

  const agentMessageCount = messages.filter(m => m.role === 'agent').length;

  return (
    <div className="flex flex-col h-[100svh] w-full sm:max-w-lg sm:mx-auto bg-white sm:shadow-sm">

      <AppHeader
        onNewReport={handleNewReport}
        onOpenChat={() => setChatOpen(true)}
        chatBadge={agentMessageCount}
        voiceoverEnabled={voiceoverEnabled}
        onToggleVoiceover={toggleVoiceover}
      />

      {/* Worker selector */}
      <WorkerSelector value={workerId} onChange={handleWorkerChange} />

      {/* Form (scrollable) */}
      <WorkReportForm
        form={form}
        sections={sections}
        clarification={clarification}
        isLoading={isLoading}
        onFieldChange={<K extends keyof FormState>(k: K, v: FormState[K]) => updateField(k, v)}
      />

      {/* Bottom input bar */}
      <div className="px-4 pt-3 pb-4 bg-white border-t border-gray-100 safe-bottom space-y-2">
        {(voiceError || liveError) && (
          <p className="text-xs text-red-500 text-center">{voiceError || liveError}</p>
        )}

        {/* Text input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendText()}
            placeholder="Or type your report…"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform"
          >
            Send
          </button>
        </div>

        {/* Voice + Submit row */}
        <div className="flex gap-2">
          <VoiceButton
            state={voiceState}
            isSupported={isSupported}
            onStart={start}
            onStop={stop}
          />
          <button
            onClick={() => setSubmitOpen(true)}
            className="px-4 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium whitespace-nowrap active:scale-95 transition-transform"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Chat overlay */}
      <ChatPanel
        messages={messages}
        isOpen={chatOpen}
        isLoading={isLoading}
        onClose={() => setChatOpen(false)}
        onSend={handleTranscript}
      />

      {/* Submit overlay */}
      {submitOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <div>
              <h2 className="font-semibold text-gray-900">Work Log Output</h2>
              <p className="text-xs text-gray-500">Structured JSON ready for Nanoclaw agent</p>
            </div>
            <button onClick={() => setSubmitOpen(false)} className="text-sm text-blue-600 font-medium">
              ← Back
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify({ worker_id: form.worker_id, date: form.date, customer_id: form.customer_id, site_id: form.site_id, service_category: form.service_category, description: form.description, hours_worked: parseFloat(form.hours) || 0, materials: form.materials, compliance_flags: form.compliance_flags, approval_notes: form.approval_notes || undefined, certification_verified: form.certification_verified }, null, 2)}
            </pre>
          </div>
          <div className="px-4 py-4 bg-white border-t border-gray-200 safe-bottom flex gap-2">
            <button
              onClick={handleNewReport}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm"
            >
              Log another report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
