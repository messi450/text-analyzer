import OpenAI from 'openai';
import env from '@/lib/env';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage - TODO: Move to secure backend proxy
});

// Check if OpenAI is available
export const isOpenAIAvailable = () => {
  return !!env.OPENAI_API_KEY;
};

// Grammar checking function
export const checkGrammar = async (text) => {
  if (!isOpenAIAvailable()) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-3.5-turbo' for cost savings
      messages: [
        {
          role: 'system',
          content: 'You are an expert grammar checker and writing assistant. Focus specifically on grammatical errors, punctuation, spelling, and basic sentence structure issues.'
        },
        {
          role: 'user',
          content: `Please analyze this text for grammar errors only. Provide corrections for:
- Subject-verb agreement issues
- Tense consistency problems  
- Pronoun reference errors
- Punctuation mistakes
- Sentence fragment issues
- Run-on sentences
- Spelling errors

Text to check:
"${text}"

Return your response as a JSON array of grammar issues found. Each issue should have:
- type: "grammar"
- severity: "high", "medium", or "low" 
- title: Brief description of the error
- original: The problematic text
- suggested: The corrected version
- explanation: Why this is a grammar error

If no grammar errors are found, return an empty array [].`
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Grammar Check Error:', error);
    throw new Error('Failed to check grammar with OpenAI');
  }
};
