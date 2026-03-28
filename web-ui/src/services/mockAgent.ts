import type { AgentService, AgentContext, AgentResponse } from '../types/agent';
import type { FormState } from '../types/form';
import { extractFieldUpdates, generateMockResponse } from '../data/mockResponses';

export class MockAgentService implements AgentService {
  private messageCount = 0;

  async sendMessage(text: string, _context: AgentContext, currentForm: FormState): Promise<AgentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    this.messageCount++;
    const updates = extractFieldUpdates(text, currentForm);
    return generateMockResponse(text, updates, currentForm);
  }

  reset(): void {
    this.messageCount = 0;
  }
}

// Singleton — swap this for HttpAgentService when connecting to Nanoclaw
export const agentService: AgentService = new MockAgentService();
