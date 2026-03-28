import type { AgentService, AgentContext, AgentResponse } from '../types/agent';
import type { FormState } from '../types/form';

export class NanoclawAgentService implements AgentService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async sendMessage(text: string, context: AgentContext, currentForm: FormState): Promise<AgentResponse> {
    const res = await fetch(`${this.baseUrl}/api/worker/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...context, form: currentForm }),
    });

    if (!res.ok) {
      throw new Error(`Nanoclaw server error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<AgentResponse>;
  }

  reset(): void {}
}
