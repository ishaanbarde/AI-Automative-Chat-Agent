import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ZohoAuthService } from './zoho-auth.service';
import { ZohoCrmService } from './zoho-crm.service';
import { ZohoController } from './zoho.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ZohoController],
  providers: [ZohoAuthService, ZohoCrmService],
  exports: [ZohoCrmService], // import ZohoModule wherever your agent/tool layer needs CRM access
})
export class ZohoModule {}
