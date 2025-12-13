// Base44 API Client for AI Writing Analysis - Enhanced with debugging

const BASE44_API_KEY = import.meta.env.VITE_BASE44_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug logging
console.log('Base44 Client Initialized:', {
    hasBase44Key: !!import.meta.env.VITE_BASE44_API_KEY,
    hasOpenAIKey: !!import.meta.env.VITE_OPENAI_API_KEY,
    usingKey: BASE44_API_KEY ? BASE44_API_KEY.substring(0, 7) : 'none',
    keyLength: BASE44_API_KEY ? BASE44_API_KEY.length : 0
});

class Base44Client {
    constructor() {
        this.apiKey = BASE44_API_KEY;
        this.baseURL = API_URL;
        console.log('Base44Client instance created');
    }

    isAvailable() {
        const available = !!this.apiKey && this.apiKey.startsWith('sk-');
        console.log('Base44Client.isAvailable:', available);
        return available;
    }

    async invokeLLM({ prompt, response_json_schema, model = 'gpt-4o-mini', temperature = 0.3 }) {
        console.log('invokeLLM called:', {
            promptLength: prompt?.length,
            model,
            temperature,
            hasSchema: !!response_json_schema
        });

        if (!this.apiKey) {
            const error = new Error('API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file');
            console.error('API Key Error:', error.message);
            throw error;
        }

        if (!this.apiKey.startsWith('sk-')) {
            const error = new Error('Invalid API key format. OpenAI keys should start with "sk-"');
            console.error('API Key Format Error:', error.message);
            throw error;
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

            console.log('Sending request to OpenAI API...');

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: { message: errorText } };
                }

                const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
                
                // Provide helpful error messages
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your VITE_OPENAI_API_KEY in .env file');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again in a few moments');
                } else if (response.status === 500) {
                    throw new Error('OpenAI service error. Please try again later');
                } else if (response.status === 400) {
                    throw new Error(`Bad request: ${errorMessage}`);
                } else {
                    throw new Error(errorMessage);
                }
            }

            const data = await response.json();
            console.log('API Response parsed successfully');

            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No content in API response');
            }

            console.log('Content length:', content.length);

            // Parse JSON response
            try {
                // Remove markdown code blocks if present
                const cleanContent = content
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();
                
                console.log('Cleaned content, attempting to parse JSON...');
                
                const parsed = JSON.parse(cleanContent);
                console.log('JSON parsed successfully:', Object.keys(parsed));
                return parsed;
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                console.log('Raw content:', content.substring(0, 200));
                
                // Try to extract JSON from text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        console.log('Attempting to extract JSON from content...');
                        const extracted = JSON.parse(jsonMatch[0]);
                        console.log('Successfully extracted JSON');
                        return extracted;
                    } catch (e) {
                        console.error('Failed to extract JSON from content:', e);
                    }
                }
                
                throw new Error('Invalid JSON response from API. The AI did not return properly formatted JSON.');
            }

        } catch (error) {
            console.error('Base44 API error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    async analyzeWriting(text, style = 'casual') {
        console.log('analyzeWriting called:', { textLength: text?.length, style });

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

Return as JSON with suggestions array and overall_score.`;

        try {
            return await this.invokeLLM({
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
        } catch (error) {
            console.error('analyzeWriting error:', error);
            throw error;
        }
    }

    async checkTone(text) {
        console.log('checkTone called:', { textLength: text?.length });

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

        try {
            return await this.invokeLLM({
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
        } catch (error) {
            console.error('checkTone error:', error);
            throw error;
        }
    }

    async improveSentence(sentence, context = '') {
        console.log('improveSentence called:', { sentenceLength: sentence?.length });

        const prompt = `Improve this sentence while maintaining its meaning.

SENTENCE: "${sentence}"
${context ? `CONTEXT: ${context}` : ''}

Provide:
1. Improved version
2. Explanation of improvements
3. Alternative versions

Return as JSON.`;

        try {
            return await this.invokeLLM({
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
        } catch (error) {
            console.error('improveSentence error:', error);
            throw error;
        }
    }

    async generateSynonyms(word, context = '') {
        console.log('generateSynonyms called:', { word });

        const prompt = `Provide synonyms for the word "${word}" in this context: ${context}

Return a JSON array of synonyms with usage examples.`;

        try {
            return await this.invokeLLM({
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
        } catch (error) {
            console.error('generateSynonyms error:', error);
            throw error;
        }
    }

    async rewriteInStyle(text, targetStyle) {
        console.log('rewriteInStyle called:', { textLength: text?.length, targetStyle });

        const prompt = `Rewrite this text in a ${targetStyle} style.

ORIGINAL TEXT:
"""
${text}
"""

Maintain the core meaning while adjusting the tone and style. Return as JSON with a "rewritten_text" field.`;

        try {
            const response = await this.invokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        rewritten_text: { type: "string" }
                    }
                },
                temperature: 0.7
            });

            // If response is an object with a 'text' property, return that
            if (response && typeof response === 'object') {
                return response.rewritten_text || response.text || response.result || JSON.stringify(response);
            }

            return response;
        } catch (error) {
            console.error('rewriteInStyle error:', error);
            throw error;
        }
    }
}

// Create integrations object structure
const base44Client = new Base44Client();

export const base44 = {
    integrations: {
        Core: {
            InvokeLLM: (params) => {
                console.log('base44.integrations.Core.InvokeLLM called');
                return base44Client.invokeLLM(params);
            },
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
