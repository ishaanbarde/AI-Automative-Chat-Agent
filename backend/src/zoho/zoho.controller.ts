import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZohoCrmService } from './zoho-crm.service';
import { CreateLeadDto, CreateServiceCaseDto } from './dto/zoho.dto';

@Controller('zoho')
export class ZohoController {
  constructor(private readonly zoho: ZohoCrmService) {}

  @Post('leads')
  createLead(@Body() body: CreateLeadDto) {
    return this.zoho.createLead(body);
  }

  @Get('leads/by-phone')
  findLead(@Query('phone') phone: string) {
    return this.zoho.findLeadByPhone(phone);
  }

  @Get('deals/lookup')
  findDeal(@Query('identifier') identifier: string) {
    return this.zoho.findDealByPhoneOrDealId(identifier);
  }

  @Put('deals/:id')
  updateDeal(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.zoho.updateDealFollowUp(id, body);
  }

  @Get('bookings/lookup')
  findBooking(
    @Query('bookingId') bookingId?: string,
    @Query('phone') phone?: string,
  ) {
    return this.zoho.findBookingByIdOrPhone(bookingId, phone);
  }

  @Post('cases')
  createCase(@Body() body: CreateServiceCaseDto) {
    return this.zoho.createServiceCase(body);
  }
}
