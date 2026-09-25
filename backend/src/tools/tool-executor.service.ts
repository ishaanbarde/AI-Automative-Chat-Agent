import { Injectable, Logger } from '@nestjs/common';
import { ZohoCrmService } from '../zoho/zoho-crm.service';

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(private readonly zoho: ZohoCrmService) {}

  async execute(name: string, args: Record<string, any>): Promise<any> {
    this.logger.log(`Executing tool: ${name} ${JSON.stringify(args)}`);
    try {
      switch (name) {
        case 'create_lead':
          return await this.zoho.createLead(args as any);

        case 'find_deal_by_identifier':
          return await this.zoho.findDealByPhoneOrDealId(args.identifier);

        case 'find_booking_status':
          return await this.zoho.findBookingByIdOrPhone(args.bookingId, args.phone);

        case 'create_service_case':
          return await this.zoho.createServiceCase(args as any);

        default:
          this.logger.warn(`Unknown tool requested: ${name}`);
          return { error: `Unknown tool: ${name}` };
      }
    } catch (err: any) {
      // Returned (not thrown) so Gemini sees the failure as a function result
      // and can decide how to respond to the user, rather than the request 500ing.
      this.logger.error(`Tool "${name}" failed`, err);
      return { error: err?.message ?? 'Tool execution failed' };
    }
  }
}
