// Gemini API Client for Text Analysis
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export function isGeminiAvailable() {
    return !!GEMINI_API_KEY;
}

/**
 * General purpose function to invoke Gemini LLM
 */
export async function invokeGeminiLLM({ prompt, response_json_schema }) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('Gemini API key is not configured. Please add a valid VITE_GEMINI_API_KEY to your .env file');
    }

    try {
        const fullPrompt = response_json_schema
            ? `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching this schema: ${JSON.stringify(response_json_schema)}. Do not include markdown formatting, code blocks, or any other text.`
            : prompt;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`Gemini API error (${response.status}): ${errorText}`);
            }
            throw new Error(errorData.error?.message || `Gemini API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            throw new Error('No content received from Gemini API');
        }

        if (response_json_schema) {
            // More robust JSON extraction
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                const cleanedJson = jsonMatch ? jsonMatch[0] : content;
                return JSON.parse(cleanedJson);
            } catch (e) {
                console.error("Failed to parse Gemini JSON response:", content);
                throw new Error("The AI returned an invalid response format. Please try again.");
            }
        }

        return content;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}


/**
 * Specifically for grammar checking to maintain compatibility with existing components
 */
export async function checkGrammarGemini(text) {
    const prompt = `You are an expert grammar checker. Analyze the text and identify grammar errors, spelling mistakes, punctuation issues, and style problems. Return your response as a JSON array of objects with this structure:
[
    {
        "original": "the exact text with the error",
        "suggested": "the corrected text",
        "title": "brief title of the error type",
        "severity": "high|medium|low",
        "explanation": "detailed explanation of why this is an error and how to fix it"
    }
]

Focus on:
- Subject-verb agreement
- Tense consistency
- Punctuation errors
- Spelling mistakes
- Run-on sentences
- Fragment sentences
- Pronoun agreement
- Misplaced modifiers

Only return the JSON array, nothing else. If there are no errors, return an empty array [].

TEXT TO CHECK:
"${text}"`;

    const result = await invokeGeminiLLM({
        prompt,
        response_json_schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    original: { type: "string" },
                    suggested: { type: "string" },
                    title: { type: "string" },
                    severity: { type: "string" },
                    explanation: { type: "string" }
                },
                required: ["original", "suggested", "title", "severity", "explanation"]
            }
        }
    });

    // Format for component compatibility (adding IDs)
    return (result || []).map((error, index) => ({
        id: `grammar-${index}-${Date.now()}`,
        ...error
    }));
}

/**
 * Specifically for writing suggestions
 */
export async function generateSuggestionsGemini(text, stats, writingStyle) {
    const prompt = `Analyze this text for writing improvements. Return 3-5 high-quality suggestions.
Context: Writing style is ${writingStyle}.
Stats: ${JSON.stringify(stats)}

TEXT:
"${text}"

Provide response as JSON:
[
    {
        "type": "error|warning|info|success",
        "title": "Brief title",
        "description": "Clear explanation",
        "examples": ["example1", "example2"]
    }
]`;

    return await invokeGeminiLLM({
        prompt,
        response_json_schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    type: { type: "string", enum: ["error", "warning", "info", "success"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    examples: { type: "array", items: { type: "string" } }
                }
            }
        }
    });
}
