import { useState, useCallback } from 'react';
import type { FormState, DynamicSections } from '../types/form';
import { initialFormState, initialDynamicSections } from '../types/form';
import type { AgentResponse } from '../types/agent';

export function useWorkReport(workerId: string) {
  const [form, setForm] = useState<FormState>({ ...initialFormState, worker_id: workerId });
  const [sections, setSections] = useState<DynamicSections>({ ...initialDynamicSections });
  const [clarification, setClarification] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const applyAgentResponse = useCallback((response: AgentResponse) => {
    if (Object.keys(response.fieldUpdates).length > 0) {
      setForm(prev => ({ ...prev, ...response.fieldUpdates }));
    }
    if (Object.keys(response.sectionsToShow).length > 0) {
      setSections(prev => ({ ...prev, ...response.sectionsToShow }));
    }
    setClarification(response.clarification ?? null);
  }, []);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setForm({ ...initialFormState, worker_id: workerId });
    setSections({ ...initialDynamicSections });
    setClarification(null);
    setIsSubmitted(false);
  }, [workerId]);

  const submit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  return { form, sections, clarification, isSubmitted, applyAgentResponse, updateField, reset, submit };
}
