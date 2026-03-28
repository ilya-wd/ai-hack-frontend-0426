import type { FormState, DynamicSections } from './form';

export interface AgentContext {
  worker_id: string;
  date: string;
  conversation_id: string;
}

export interface AgentResponse {
  message: string;
  fieldUpdates: Partial<FormState>;
  sectionsToShow: Partial<DynamicSections>;
  clarification?: string;
  isComplete?: boolean;
}

export interface AgentService {
  sendMessage(text: string, context: AgentContext, currentForm: FormState): Promise<AgentResponse>;
  reset(): void;
}
