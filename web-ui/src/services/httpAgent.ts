import type { AgentService, AgentContext, AgentResponse } from '../types/agent';
import type { FormState } from '../types/form';

const PORT = import.meta.env.VITE_HTTP_CHANNEL_PORT ?? 3001;
const BASE_URL = `${window.location.protocol}//${window.location.hostname}:${PORT}`;

export class HttpAgentService implements AgentService {
  async sendMessage(text: string, context: AgentContext, _currentForm: FormState): Promise<AgentResponse> {
    const res = await fetch(`${BASE_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my-secret-token',
      },
      body: JSON.stringify({ sessionId: `ui-${context.worker_id}`, text }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      message: data.text,
      fieldUpdates: data.fieldUpdates ?? {},
      sectionsToShow: data.sectionsToShow ?? {},
      clarification: data.clarification,
      isComplete: data.isComplete,
    };
  }

  reset(): void {
    // Sessions are server-side; nothing to reset on the client
  }
}
