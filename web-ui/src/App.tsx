import { useState, useCallback } from 'react';
import { WorkerSelector } from './components/WorkerSelector';
import { WorkReportForm } from './components/WorkReportForm';
import { ChatPanel } from './components/ChatPanel';
import { VoiceButton } from './components/VoiceButton';
import { useWorkReport } from './hooks/useWorkReport';
import { useChat } from './hooks/useChat';
import { useVoiceInput } from './hooks/useVoiceInput';
import { agentService } from './services/mockAgent';
import type { FormState } from './types/form';

export default function App() {
  const [workerId, setWorkerId] = useState('W-002');
  const [chatOpen, setChatOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');

  const { form, sections, clarification, applyAgentResponse, updateField, reset } = useWorkReport(workerId);
  const { messages, addMessage, reset: resetChat } = useChat();

  const handleTranscript = useCallback(async (text: string) => {
    addMessage('worker', text);
    setIsLoading(true);
    try {
      const response = await agentService.sendMessage(text, {
        worker_id: workerId,
        date: form.date,
        conversation_id: 'session-1',
      }, form);
      addMessage('agent', response.message);
      applyAgentResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [workerId, form, addMessage, applyAgentResponse]);

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
  };

  const agentMessageCount = messages.filter(m => m.role === 'agent').length;

  return (
    <div className="flex flex-col h-[100svh] w-full sm:max-w-lg sm:mx-auto bg-white sm:shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔧</span>
          <h1 className="font-bold text-gray-900 text-base">Work Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewReport}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            New report
          </button>
          <button
            onClick={() => setChatOpen(true)}
            className="relative text-xl"
            aria-label="Open conversation"
          >
            💬
            {agentMessageCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-[10px] rounded-full font-bold">
                {agentMessageCount}
              </span>
            )}
          </button>
        </div>
      </div>

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
        {voiceError && (
          <p className="text-xs text-red-500 text-center">{voiceError}</p>
        )}

        {/* Text input fallback */}
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
