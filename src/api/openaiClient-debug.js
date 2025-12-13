// OpenAI API Client for Grammar Checking - Enhanced with debugging

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug logging
console.log('OpenAI Client Initialized:', {
    hasKey: !!OPENAI_API_KEY,
    keyPrefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 7) : 'none',
    keyLength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0
});

export function isOpenAIAvailable() {
    const available = !!OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-');
    console.log('isOpenAIAvailable:', available);
    return available;
}

export async function checkGrammar(text) {
    console.log('checkGrammar called with text length:', text?.length);

    if (!OPENAI_API_KEY) {
        const error = new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file');
        console.error('API Key Error:', error.message);
        throw error;
    }

    if (!OPENAI_API_KEY.startsWith('sk-')) {
        const error = new Error('Invalid API key format. OpenAI keys should start with "sk-"');
        console.error('API Key Format Error:', error.message);
        throw error;
    }

    try {
        console.log('Making request to OpenAI...');
        
        const requestBody = {
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

Only return the JSON array, nothing else. If there are no errors, return an empty array [].`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        };

        console.log('Request body prepared, sending to OpenAI API...');

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
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
                throw new Error('Invalid API key. Please check your VITE_OPENAI_API_KEY in .env.example file');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few moments');
            } else if (response.status === 500) {
                throw new Error('OpenAI service error. Please try again later');
            } else {
                throw new Error(errorMessage);
            }
        }

        const data = await response.json();
        console.log('API Response parsed successfully');

        const content = data.choices[0]?.message?.content;
        console.log('Content extracted:', content ? content.substring(0, 100) + '...' : 'empty');

        if (!content) {
            console.warn('No content in response, returning empty array');
            return [];
        }

        // Parse the JSON response
        try {
            // Remove markdown code blocks if present
            const jsonContent = content
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            console.log('Cleaned JSON content:', jsonContent.substring(0, 100) + '...');
            
            const errors = JSON.parse(jsonContent);
            console.log('Parsed errors:', errors.length, 'errors found');
            
            // Validate the structure
            if (Array.isArray(errors)) {
                const formattedErrors = errors.map((error, index) => ({
                    id: `grammar-${index}`,
                    original: error.original || '',
                    suggested: error.suggested || '',
                    title: error.title || 'Grammar Error',
                    severity: error.severity || 'medium',
                    explanation: error.explanation || 'This appears to be a grammar error.'
                }));
                
                console.log('Returning formatted errors:', formattedErrors.length);
                return formattedErrors;
            }
            
            console.warn('Response is not an array, returning empty');
            return [];
        } catch (parseError) {
            console.error('Failed to parse grammar check response:', parseError);
            console.log('Raw content that failed to parse:', content);
            
            // Return empty array instead of throwing to avoid breaking the UI
            return [];
        }

    } catch (error) {
        console.error('Grammar check error:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

export async function improveWriting(text, style = 'casual') {
    console.log('improveWriting called:', { textLength: text?.length, style });

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
        const improved = data.choices[0]?.message?.content || text;
        
        console.log('Writing improved successfully');
        return improved;

    } catch (error) {
        console.error('Writing improvement error:', error);
        throw error;
    }
}
