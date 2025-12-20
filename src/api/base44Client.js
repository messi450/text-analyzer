/**
 * Base44 API Client Proxy for Gemini
 * This file acts as a compatibility layer to allow existing code 
 * to use Gemini AI while still calling the base44Client API.
 */
import { invokeGeminiLLM, isGeminiAvailable, checkGrammarGemini } from './geminiClient';

class GeminiProxy {
    isAvailable() {
        return isGeminiAvailable();
    }

    async invokeLLM({ prompt, response_json_schema, temperature = 0.3 }) {
        return await invokeGeminiLLM({ prompt, response_json_schema });
    }

    async analyzeWriting(text, style = 'casual') {
        const prompt = `Analyze this text for writing quality and provide detailed suggestions.
        Style: ${style}
        Text: ${text}`;

        const response = await invokeGeminiLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    suggestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                severity: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" },
                                original: { type: "string" },
                                suggested: { type: "string" },
                                explanation: { type: "string" }
                            }
                        }
                    },
                    overall_score: { type: "number" }
                }
            }
        });
        return response;
    }

    async checkTone(text) {
        const prompt = `Analyze the tone of this text. Return tones, consistency score, and assessment.
        Text: ${text}`;

        return await invokeGeminiLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    detected_tones: { type: "array", items: { type: "string" } },
                    consistency_score: { type: "number" },
                    inconsistencies: { type: "array", items: { type: "string" } },
                    overall_assessment: { type: "string" }
                }
            }
        });
    }

    async improveSentence(sentence, context = '') {
        const prompt = `Improve this sentence: "${sentence}" in context: ${context}`;

        return await invokeGeminiLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    improved: { type: "string" },
                    explanation: { type: "string" },
                    alternatives: { type: "array", items: { type: "string" } }
                }
            }
        });
    }

    async rewriteInStyle(text, targetStyle) {
        const prompt = `Rewrite this text in a ${targetStyle} style: ${text}`;
        const response = await invokeGeminiLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    rewritten_text: { type: "string" }
                }
            }
        });
        return response.rewritten_text;
    }
}

const client = new GeminiProxy();

export const base44 = {
    integrations: {
        Core: {
            InvokeLLM: (params) => client.invokeLLM(params),
            IsAvailable: () => client.isAvailable()
        }
    },
    analyzeWriting: (text, style) => client.analyzeWriting(text, style),
    checkTone: (text) => client.checkTone(text),
    improveSentence: (sentence, context) => client.improveSentence(sentence, context),
    rewriteInStyle: (text, style) => client.rewriteInStyle(text, style),
    isAvailable: () => client.isAvailable()
};

export default base44;
