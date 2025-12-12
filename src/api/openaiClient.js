
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export function isOpenAIAvailable() {
    return !!OPENAI_API_KEY;
}

export async function checkGrammar(text) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert grammar checker. Analyze the text and identify grammar errors, spelling mistakes, punctuation issues, and style problems. Return your response as a JSON array of objects with this structure:
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

Only return the JSON array, nothing else.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return [];
        }

        // Parse the JSON response
        try {
            // Remove markdown code blocks if present
            const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const errors = JSON.parse(jsonContent);
            
            // Validate the structure
            if (Array.isArray(errors)) {
                return errors.map((error, index) => ({
                    id: `grammar-${index}`,
                    original: error.original || '',
                    suggested: error.suggested || '',
                    title: error.title || 'Grammar Error',
                    severity: error.severity || 'medium',
                    explanation: error.explanation || 'This appears to be a grammar error.'
                }));
            }
            
            return [];
        } catch (parseError) {
            console.error('Failed to parse grammar check response:', parseError);
            console.log('Raw content:', content);
            return [];
        }

    } catch (error) {
        console.error('Grammar check error:', error);
        throw error;
    }
}

export async function improveWriting(text, style = 'casual') {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional writing coach. Improve the given text to be more ${style}. Return only the improved text without any preamble or explanation.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || text;

    } catch (error) {
        console.error('Writing improvement error:', error);
        throw error;
    }
}
