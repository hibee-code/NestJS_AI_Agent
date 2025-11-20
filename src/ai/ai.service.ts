import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set — AiService will return fallback responses.');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate assistant text for a given prompt.
   * Keeps the interface small so callers don't depend on SDK details.
   */
  async generateAssistantAnswer(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return 'OPENAI_API_KEY not configured. Enable it to get AI responses.';
    }

    try {
      const res = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 800,
      });

      const content = res.choices?.[0]?.message?.content;
      return content?.trim() ?? 'No response from AI.';
    } catch (err) {
      this.logger.error('AI generation failed', err as any);
      return 'AI generation failed. See server logs for details.';
    }
  }
}
