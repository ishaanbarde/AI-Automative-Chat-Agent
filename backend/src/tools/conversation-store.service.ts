import { Injectable } from '@nestjs/common';
import { Content } from '@google/genai';

/**
 * In-memory session store. Fine for a single-instance demo/assessment.
 */
@Injectable()
export class ConversationStoreService {
  private sessions = new Map<string, Content[]>();

  getHistory(sessionId: string): Content[] {
    return this.sessions.get(sessionId) ?? [];
  }

  appendTurns(sessionId: string, turns: Content[]): void {
    const history = this.getHistory(sessionId);
    history.push(...turns);
    this.sessions.set(sessionId, history);
  }

  reset(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
