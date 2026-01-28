
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaSlug, Persona } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Always use named parameter for apiKey and direct reference to process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateAgentResponse(
    persona: Persona, 
    userMessage: string, 
    history: {role: 'user' | 'model', text: string}[] = [],
    useSearch: boolean = false
  ) {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    const config: any = {
      systemInstruction: persona.systemPrompt,
      temperature: 0.7,
      // Gemini 3 series supports thinkingBudget
      thinkingConfig: { thinkingBudget: persona.slug === 'orchestrator' ? 0 : 4000 }
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      // Use ai.models.generateContent directly
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
            { role: 'user', parts: [{ text: userMessage }] }
        ],
        config
      });

      return {
        // Access .text property directly
        text: response.text || "I'm sorry, I couldn't process that request.",
        grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }

  async orchestrate(message: string): Promise<PersonaSlug> {
    // Orchestration is a complex reasoning task, using gemini-3-pro-preview
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Determine the best agent for this request: "${message}". 
      Available: executive, tasks, calendar, email, research, automation. 
      Respond ONLY with the slug.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slug: { type: Type.STRING }
          },
          required: ["slug"]
        }
      }
    });

    try {
        // Access .text property
        const result = JSON.parse(response.text || '{"slug": "orchestrator"}');
        return result.slug as PersonaSlug;
    } catch {
        return 'orchestrator';
    }
  }
}

export const gemini = new GeminiService();
