import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from '../customer/schemas/customer.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private premiumApiUrl = process.env.PREMIUM_API_URL;

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    private readonly http: HttpService,
    private readonly ai: AiService,
  ) {}

  /**
   * High-level method: fetch customer, get premium details, and ask AI to synthesize.
   * Keeps logic readable and testable.
   */
  async getCustomerInsight(customerId: string) {
    const customer = await this.customerModel.findById(customerId).lean();
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    const premium = await this.fetchPremiumDetails(customer);
    const prompt = this.buildPrompt(customer, premium);

    const aiAnswer = await this.ai.generateAssistantAnswer(prompt);

    return {
      customer,
      premium,
      answer: aiAnswer,
    };
  }

  private async fetchPremiumDetails(customer: any) {
    if (!this.premiumApiUrl) {
      this.logger.warn('PREMIUM_API_URL not configured — returning empty premium payload');
      return { source: 'none', data: null };
    }

    try {
      const resp = await firstValueFrom(
        this.http.post(
          `${this.premiumApiUrl}/premium`,
          { email: customer.email, customerId: customer._id },
          { timeout: 8_000 },
        ),
      );
      return { source: 'premium-api', data: resp.data };
    } catch (err) {
      this.logger.error('Failed to fetch premium details', err as any);
      return { source: 'error', error: 'Failed to fetch premium details' };
    }
  }

  private buildPrompt(customer: any, premium: any) {
    return `You are an assistant that combines customer records with external premium details.
Customer:
- id: ${customer._id}
- name: ${customer.name ?? 'N/A'}
- email: ${customer.email ?? 'N/A'}
- totalPolicies: ${customer.totalPolicies ?? 0}

Premium API result (source: ${premium?.source}):
${JSON.stringify(premium?.data ?? premium?.error ?? null, null, 2)}

Provide:
1) One-paragraph summary of the customer's insurance position.
2) Top 3 recommendations (concise).
3) If premium data has numeric values, highlight anomalies.

Be concise and format as JSON with keys: summary, recommendations, anomalies.
`;
  }
}
