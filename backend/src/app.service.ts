import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService } from './ai/ai.service';
import { ConversationStoreService } from './tools/conversation-store.service';

@Injectable()
export class AppService {
  constructor(
    private readonly aiService: AiService,
    private readonly conversationStore: ConversationStoreService,
  ) {}

  async sendChat(message: string, sessionId?: string) {
    const sid = sessionId ?? randomUUID();
    const history = this.conversationStore.getHistory(sid);

    const { text, newTurns } = await this.aiService.chat(history, message);
    this.conversationStore.appendTurns(sid, newTurns);

    return { reply: text, sessionId: sid };
  }
}
