import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

interface ChatRequestBody {
  message: string;
  /** Omit on the first call; echo back the sessionId you receive on later calls */
  sessionId?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/chat')
  async chat(@Body() body: ChatRequestBody) {
    const { message, sessionId } = body;
    return this.appService.sendChat(message, sessionId);
  }
}
