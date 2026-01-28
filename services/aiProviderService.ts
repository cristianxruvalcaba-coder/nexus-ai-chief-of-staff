
import { GoogleGenAI } from "@google/genai";
import { AIProvider, Persona } from "../types";

export interface AIResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: AIProvider;
  source: 'user' | 'platform';
}

class AIProviderService {
  constructor() {}

  private getApiKeyForProvider(provider: AIProvider): { key: string; source: 'user' | 'platform' } {
    const userKey = localStorage.getItem(`nexus_key_${provider}`);
    if (userKey && userKey.length > 5) {
      return { key: userKey, source: 'user' };
    }
    
    // Fallback to platform keys (usually injected via env)
    // For this demo, we assume process.env.API_KEY is the platform key for Gemini
    // and others would follow similar logic
    const platformKey = provider === 'gemini' ? process.env.API_KEY : '';
    
    // In a real production app, you'd have internal platform keys for OpenAI/Anthropic etc.
    // For now, if no user key and no platform key, it will throw error or use default
    return { key: platformKey || '', source: 'platform' };
  }

  async chat(
    provider: AIProvider,
    persona: Persona,
    message: string,
    history: { role: 'user' | 'model', text: string }[] = [],
    config: { useSearch?: boolean } = {}
  ): Promise<AIResponse> {
    
    const { key, source } = this.getApiKeyForProvider(provider);

    if (provider === 'gemini') {
      const actualKey = key || process.env.API_KEY || ''; // Ensure we have something
      const ai = new GoogleGenAI({ apiKey: actualKey });
      const contents = [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: persona.systemPrompt,
          tools: config.useSearch ? [{ googleSearch: {} }] : undefined
        }
      });

      return {
        text: result.text || "No response generated.",
        usage: {
          promptTokens: 100, // Approximate as API doesn't return count for all models yet
          completionTokens: 200,
          totalTokens: 300
        },
        provider: 'gemini',
        source: key === process.env.API_KEY && source === 'platform' ? 'platform' : 'user'
      };
    }

    if (!key) {
      throw new Error(`API Key for ${provider} is missing. Add your own key in Settings to unlock this provider.`);
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: persona.systemPrompt },
            ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
            { role: 'user', content: message }
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return {
        text: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        provider: 'openai',
        source
      };
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          system: persona.systemPrompt,
          messages: [
            ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
            { role: 'user', content: message }
          ],
          max_tokens: 4096
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return {
        text: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        provider: 'anthropic',
        source
      };
    }

    if (provider === 'perplexity') {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: persona.systemPrompt },
            ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
            { role: 'user', content: message }
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return {
        text: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        provider: 'perplexity',
        source
      };
    }

    throw new Error(`Provider ${provider} not supported`);
  }

  async getBestProvider(request: string): Promise<AIProvider> {
    const r = request.toLowerCase();
    if (r.includes("search") || r.includes("news") || r.includes("current") || r.includes("latest")) {
      return 'perplexity';
    }
    if (request.length > 1000 || r.includes("code") || r.includes("analyze")) {
      return 'anthropic';
    }
    return 'gemini';
  }
}

export const aiProviderService = new AIProviderService();
