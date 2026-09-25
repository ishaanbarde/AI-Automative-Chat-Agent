import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface TokenCache {
  accessToken: string;
  expiresAt: number; // epoch ms
}

/**
 * Manages the Zoho OAuth access token lifecycle.
 *
 * Zoho's "Self Client" flow gives you a long-lived refresh_token once.
 * This service exchanges it for a short-lived (1hr) access_token on demand
 * and caches it in memory, refreshing ~60s before expiry.
 */
@Injectable()
export class ZohoAuthService {
  private readonly logger = new Logger(ZohoAuthService.name);
  private tokenCache: TokenCache | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get accountsUrl(): string {
    return this.config.get<string>(
      'ZOHO_ACCOUNTS_URL',
      'https://accounts.zoho.in',
    );
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt - 60_000 > now) {
      return this.tokenCache.accessToken;
    }
    // Coalesce concurrent callers into a single refresh request
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshAccessToken().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async refreshAccessToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.get<string>('ZOHO_CLIENT_ID')!,
      client_secret: this.config.get<string>('ZOHO_CLIENT_SECRET')!,
      refresh_token: this.config.get<string>('ZOHO_REFRESH_TOKEN')!,
    });

    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.accountsUrl}/oauth/v2/token`,
          params.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      if (!data.access_token) {
        this.logger.error(
          `Zoho token refresh returned no access_token: ${JSON.stringify(data)}`,
        );
        throw new Error(
          'Failed to obtain Zoho access token — check client_id/secret/refresh_token',
        );
      }

      this.tokenCache = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
      };
      this.logger.log('Zoho access token refreshed');
      return this.tokenCache.accessToken;
    } catch (err) {
      this.logger.error('Error refreshing Zoho access token', err as Error);
      throw err;
    }
  }
}
