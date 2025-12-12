// Base44 API Client for AI Writing Analysis
// This is a comprehensive AI integration servic

const BASE44_API_KEY = import.meta.env.VITE_BASE44_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Fallback to OpenAI if Base44 is not configured
const useOpenAI = !import.meta.env.VITE_BASE44_API_KEY && import.meta.env.VITE_OPENAI_API_KEY;

class Base44Client {
    constructor() {
        this.apiKey = BASE44_API_KEY;
        this.baseURL = API_URL;
    }

    isAvailable() {
        return !!this.apiKey;
    }

    async invokeLLM({ prompt, response_json_schema, model = 'gpt-4o-mini', temperature = 0.3 }) {
        if (!this.apiKey) {
            throw new Error('API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file');
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: 'You are an expert writing coach and editor. Always respond with valid JSON matching the requested schema.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ];

            const requestBody = {
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: 3000
            };

            // Add response format for JSON mode (GPT-4 and newer models)
            if (response_json_schema) {
                requestBody.response_format = { type: "json_object" };
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No content in API response');
            }

            // Parse JSON response
            try {
                // Remove markdown code blocks if present
                const cleanContent = content
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();
                
                const parsed = JSON.parse(cleanContent);
                return parsed;
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                console.log('Raw content:', content);
                
                // Try to extract JSON from text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        return JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error('Failed to extract JSON from content');
                    }
                }
                
                throw new Error('Invalid JSON response from API');
            }

        } catch (error) {
            console.error('Base44 API error:', error);
            throw error;
        }
    }

    async analyzeWriting(text, style = 'casual') {
        const prompt = `Analyze this text for writing quality and provide suggestions.

Writing Style: ${style}

TEXT:
"""
${text}
"""

Provide detailed analysis including:
1. Grammar and spelling issues
2. Style improvements
3. Clarity enhancements
4. Tone consistency
5. Structure suggestions

Return as JSON with suggestions array.`;

        return this.invokeLLM({
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
    }

    async checkTone(text) {
        const prompt = `Analyze the tone of this text.

TEXT:
"""
${text}
"""

Identify:
1. Detected tones (formal, casual, professional, friendly, assertive, etc.)
2. Tone consistency score (0-100)
3. Any tone inconsistencies
4. Overall assessment

Return as JSON.`;

        return this.invokeLLM({
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
        const prompt = `Improve this sentence while maintaining its meaning.

SENTENCE: "${sentence}"
${context ? `CONTEXT: ${context}` : ''}

Provide:
1. Improved version
2. Explanation of improvements
3. Alternative versions

Return as JSON.`;

        return this.invokeLLM({
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

    async generateSynonyms(word, context = '') {
        const prompt = `Provide synonyms for the word "${word}" in this context: ${context}

Return a JSON array of synonyms with usage examples.`;

        return this.invokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    synonyms: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                word: { type: "string" },
                                definition: { type: "string" },
                                example: { type: "string" }
                            }
                        }
                    }
                }
            }
        });
    }

    async rewriteInStyle(text, targetStyle) {
        const prompt = `Rewrite this text in a ${targetStyle} style.

ORIGINAL TEXT:
"""
${text}
"""

Maintain the core meaning while adjusting the tone and style. Return only the rewritten text.`;

        const response = await this.invokeLLM({
            prompt,
            temperature: 0.7
        });

        // If response is an object with a 'text' property, return that
        if (response && typeof response === 'object') {
            return response.text || response.rewritten_text || response.result || JSON.stringify(response);
        }

        return response;
    }
}

// Create integrations object structure
const base44Client = new Base44Client();

export const base44 = {
    integrations: {
        Core: {
            InvokeLLM: (params) => base44Client.invokeLLM(params),
            IsAvailable: () => base44Client.isAvailable()
        }
    },
    // Direct methods
    analyzeWriting: (text, style) => base44Client.analyzeWriting(text, style),
    checkTone: (text) => base44Client.checkTone(text),
    improveSentence: (sentence, context) => base44Client.improveSentence(sentence, context),
    generateSynonyms: (word, context) => base44Client.generateSynonyms(word, context),
    rewriteInStyle: (text, style) => base44Client.rewriteInStyle(text, style),
    isAvailable: () => base44Client.isAvailable()
};

export default base44;
