import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ZohoAuthService } from './zoho-auth.service';

export type ZohoModuleName = 'Leads' | 'Deals' | 'Cases' | 'Contacts';

@Injectable()
export class ZohoCrmService {
  private readonly logger = new Logger(ZohoCrmService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly auth: ZohoAuthService,
  ) {}

  private get apiUrl(): string {
    return this.config.get<string>('ZOHO_API_URL', 'https://www.zohoapis.in');
  }

  private async headers() {
    const token = await this.auth.getAccessToken();
    return { Authorization: `Zoho-oauthtoken ${token}` };
  }

  async createRecord(module: ZohoModuleName, fields: Record<string, any>) {
    const headers = await this.headers();
    const { data } = await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/crm/v6/${module}`,
        { data: [fields] },
        { headers },
      ),
    );
    return data.data?.[0];
  }

  async updateRecord(
    module: ZohoModuleName,
    recordId: string,
    fields: Record<string, any>,
  ) {
    const headers = await this.headers();
    const { data } = await firstValueFrom(
      this.http.put(
        `${this.apiUrl}/crm/v6/${module}/${recordId}`,
        { data: [{ id: recordId, ...fields }] },
        { headers },
      ),
    );
    return data.data?.[0];
  }

  /** Zoho criteria search, e.g. "(Phone:equals:9876543210)" */
  async searchRecords(module: ZohoModuleName, criteria: string) {
    const headers = await this.headers();
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.apiUrl}/crm/v6/${module}/search`, {
          headers,
          params: { criteria },
        }),
      );
      return data.data ?? [];
    } catch (err: any) {
      // Zoho returns 204/no-content-style responses when nothing matches
      if (err?.response?.status === 204) return [];
      this.logger.error(`Search failed on ${module}: ${criteria}`, err);
      throw err;
    }
  }

  /**
   * Create new lead
   * Stage 1: New Lead
   */
  async createLead(fields: {
    Last_Name: string;
    First_Name?: string;
    Phone: string;
    Email?: string;
    City?: string;
    Vehicle_Model?: string; // custom field
  }) {
    return this.createRecord('Leads', fields);
  }

  async findLeadByPhone(phone: string) {
    const results = await this.searchRecords(
      'Leads',
      `(Phone:equals:${phone})`,
    );
    return results[0] ?? null;
  }

  // ---------- Stage 2: Ongoing Pipeline (Deals) ----------

  async findDealByPhoneOrDealId(identifier: string) {
    const byId = await this.searchRecords(
      'Deals',
      `(Deal_Name:equals:${identifier})`,
    );
    if (byId.length) return byId[0];
    const byPhone = await this.searchRecords(
      'Deals',
      `(Phone:equals:${identifier})`,
    );
    return byPhone[0] ?? null;
  }

  async updateDealFollowUp(dealId: string, fields: Record<string, any>) {
    return this.updateRecord('Deals', dealId, fields);
  }

  /* Stage 3: Booked Vehicle
   * Modeled as Deals filtered to the "Closed Won" stage,
   */
  async findBookingByIdOrPhone(bookingId?: string, phone?: string) {
    const criteria = bookingId
      ? `(Booking_ID:equals:${bookingId})`
      : `(Phone:equals:${phone})`;
    const results = await this.searchRecords('Deals', criteria);
    return results.find((r: any) => r.Stage === 'Closed Won') ?? null;
  }

  /**
   * Creates cases in zoho crm
   * Stage 4: Post-Purchase / Service (Cases
   * @param fields
   * @returns
   */
  async createServiceCase(fields: {
    Subject: string;
    Registration_Number: string;
    Odometer_Reading?: number;
    Issue_Type?: string;
    Preferred_Service_Center?: string;
    Contact_Id?: string; // links the Case to an existing Contact
  }) {
    const payload: Record<string, any> = { ...fields };
    if (fields.Contact_Id) {
      payload.Contact_Id = { id: fields.Contact_Id };
      delete payload.Contact_Id_flat;
    }
    return this.createRecord('Cases', payload);
  }

  async findContactByPhone(phone: string) {
    const results = await this.searchRecords(
      'Contacts',
      `(Phone:equals:${phone})`,
    );
    return results[0] ?? null;
  }
}
