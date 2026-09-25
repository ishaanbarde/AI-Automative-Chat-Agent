import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiService } from './ai/ai.service';
import { ConfigModule } from '@nestjs/config';
import { ZohoModule } from './zoho/zoho.module';
import { ConversationStoreService } from './tools/conversation-store.service';
import { ToolExecutorService } from './tools/tool-executor.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ZohoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AiService,
    ConversationStoreService,
    ToolExecutorService,
  ],
})
export class AppModule {}
