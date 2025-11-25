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
  private readonly premiumApiUrl = process.env.PREMIUM_API_URL;
  private readonly premiumMode = (process.env.PREMIUM_API_MODE || 'local').toLowerCase();

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    private readonly http: HttpService,
    private readonly ai: AiService,
  ) {}

  async getCustomerInsight(customerId: string) {
    const customer = await this.customerModel.findById(customerId).lean();
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    const premium = await this.fetchPremiumDetails(customer);
    const prompt = this.buildPrompt(customer, premium);
    const aiAnswer = await this.ai.generateAssistantAnswer(prompt);
    const finalAnswer = this.isAiUnavailable(aiAnswer)
      ? this.buildFallbackAnswer(customer, premium)
      : aiAnswer;

    return { customer, premium, answer: finalAnswer };
  }

  private async fetchPremiumDetails(customer: any) {
    if (this.premiumMode === 'local') {
      const data = this.computeLocalPremium(customer);
      return { source: 'local', data };
    }

    if (!this.premiumApiUrl) {
      this.logger.warn('PREMIUM_API_URL not configured');
      return { source: 'none', data: null };
    }

    try {
      const resp = await firstValueFrom(
        this.http.post(
          `${this.premiumApiUrl.replace(/\/$/, '')}/premium`,
          { email: customer.email, customerId: customer._id },
          { timeout: 8000 },
        ),
      );
      return { source: this.premiumMode, data: resp.data };
    } catch (err) {
      this.logger.error('Failed to fetch premium details', err);
      // Fallback to local calculation on API failure
      const data = this.computeLocalPremium(customer);
      return { source: 'local-fallback', data };
    }
  }

  private computeLocalPremium(customer: any) {
    const premiumRates = {
      home: 0.02,    // 2%
      travel: 0.05,  // 5%
      fire: 0.015,   // 1.5%
      health: 0.03,  // 3%
      auto: 0.04,    // 4%
    };

    const policies = Array.isArray(customer.policies) ? customer.policies : [];
    let basePremium = 0;
    const breakdown: Array<{ policyNumber: any; type: any; coverageAmount: any; premium: number }> = [];

    policies.forEach((policy: any) => {
      const type = (policy.type || '').toLowerCase();
      const rate = premiumRates[type] || 0.02;
      const premium = (policy.coverageAmount || 0) * rate;
      basePremium += premium;

      breakdown.push({
        policyNumber: policy.policyNumber,
        type: policy.type,
        coverageAmount: policy.coverageAmount,
        premium: Math.round(premium * 100) / 100,
      });
    });

    const taxes = Math.round(basePremium * 0.15 * 100) / 100;
    const fees = policies.length * 500;
    const totalPremium = Math.round((basePremium + taxes + fees) * 100) / 100;

    return {
      totalPremium,
      basePremium: Math.round(basePremium * 100) / 100,
      taxes,
      processingFees: fees,
      policyCount: policies.length,
      breakdown,
      currency: 'NGN',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  private isAiUnavailable(aiText: string) {
    if (!aiText) return true;
    const lower = aiText.toLowerCase();
    return (
      lower.includes('ai generation failed') ||
      lower.includes('openai_api_key not configured') ||
      lower.includes('no response from ai')
    );
  }

  private buildFallbackAnswer(customer: any, premium: any) {
    const summary = `${customer.name} has ${customer.totalPolicies || 0} active policies with total premium of ₦${premium?.data?.totalPremium?.toLocaleString() || 'N/A'}.`;
    
    const recommendations = [
      'Review high-value policies for adequate coverage',
      'Consider policy bundling for potential discounts',
      'Verify contact information is up to date',
    ];

    const anomalies: string[] = [];
    (customer.policies || []).forEach((p: any) => {
      if (p.coverageAmount > 1000000) {
        anomalies.push(`High coverage: ${p.policyNumber} (₦${p.coverageAmount.toLocaleString()})`);
      }
    });

    return JSON.stringify({ summary, recommendations, anomalies }, null, 2);
  }

  private buildPrompt(customer: any, premium: any) {
    return `Analyze this insurance customer profile:

Customer: ${customer.name} (${customer.email})
Policies: ${customer.totalPolicies || 0}
Premium Data (${premium?.source}): ${JSON.stringify(premium?.data, null, 2)}

Provide concise JSON response with:
1. summary: One paragraph overview
2. recommendations: Array of 3 actionable items
3. anomalies: Array of notable issues

Format as valid JSON only.`;
  }
}
