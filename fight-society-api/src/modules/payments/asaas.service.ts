import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

const ASAAS_BASE_URLS = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
} as const;

export type AsaasBillingType = 'UNDEFINED' | 'BOLETO' | 'CREDIT_CARD' | 'PIX';

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  status: string;
  billingType: AsaasBillingType | 'DEBIT_CARD';
  value: number;
  invoiceUrl: string;
  externalReference?: string | null;
}

export interface AsaasWebhookEvent {
  id: string;
  event: string;
  payment?: AsaasPayment;
}

interface AsaasErrorBody {
  errors?: { code?: string; description?: string }[];
}

export class AsaasApiError extends BadRequestException {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly errors: AsaasErrorBody['errors'] = [],
  ) {
    super(message);
  }
}

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly userAgent: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ASAAS_API_KEY');
    if (!apiKey) {
      throw new Error('ASAAS_API_KEY is not defined');
    }
    this.apiKey = apiKey;

    const env = this.configService.get<string>('ASAAS_ENV', 'sandbox');
    this.baseUrl =
      env === 'production' ? ASAAS_BASE_URLS.production : ASAAS_BASE_URLS.sandbox;
    this.userAgent = this.configService.get<string>('APP_NAME', 'FightSociety');
  }

  async createCustomer(data: {
    name: string;
    cpfCnpj: string;
    email: string;
    mobilePhone?: string;
    externalReference?: string;
  }): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPayment(data: {
    customer: string;
    billingType: AsaasBillingType;
    value: number;
    dueDate: string;
    description?: string;
    externalReference?: string;
    callback?: { successUrl: string; autoRedirect?: boolean };
  }): Promise<AsaasPayment> {
    return this.request<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayment(id: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${id}`, { method: 'GET' });
  }

  /** Validates the `asaas-access-token` header sent with every webhook. */
  isValidWebhookToken(received: string | undefined): boolean {
    const expected = this.configService.get<string>('ASAAS_WEBHOOK_TOKEN');
    if (!expected) {
      throw new Error('ASAAS_WEBHOOK_TOKEN is not defined');
    }
    if (!received) return false;

    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.userAgent,
        access_token: this.apiKey,
      },
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errors = (body as AsaasErrorBody).errors ?? [];
      const message =
        errors.map((e) => e.description).filter(Boolean).join(', ') ||
        `Asaas request failed with status ${response.status}`;
      this.logger.error(`Asaas ${init.method} ${path} -> ${response.status}: ${message}`);
      throw new AsaasApiError(message, response.status, errors);
    }

    return body as T;
  }
}
