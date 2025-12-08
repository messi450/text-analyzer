import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitize = {
  // Sanitize text content (remove potentially dangerous characters)
  text: (input) => {
    if (typeof input !== 'string') return '';

    // Remove null bytes and other control characters
    let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Limit maximum length (reasonable for text analysis)
    const MAX_LENGTH = 100000; // ~100KB of text
    if (sanitized.length > MAX_LENGTH) {
      sanitized = sanitized.substring(0, MAX_LENGTH);
      console.warn('Text input truncated to maximum allowed length');
    }

    return sanitized;
  },

  // Sanitize HTML content (for any HTML that might be displayed)
  html: (input) => {
    if (typeof input !== 'string') return '';

    // Use DOMPurify to sanitize HTML
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
    });
  },

  // Sanitize filename
  filename: (filename) => {
    if (typeof filename !== 'string') return '';

    // Remove path separators and dangerous characters
    return filename
      .replace(/[\/\\:*?"<>|]/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .substring(0, 255); // Max filename length
  },

  // Validate file type and size
  validateFile: (file) => {
    const errors = [];

    const allowedMimeTypes = new Set([
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];

    // Check file type
    const hasAllowedMime = file.type && (file.type.startsWith('text/') || allowedMimeTypes.has(file.type));
    const fileName = typeof file.name === 'string' ? file.name.toLowerCase() : '';
    const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasAllowedMime && !hasAllowedExtension) {
      errors.push('Unsupported file type. Please upload a TXT, PDF, or Word document.');
    }

    // Check file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      errors.push('File size must be less than 5MB');
    }

    // Check filename
    if (!file.name || file.name.length === 0) {
      errors.push('Invalid filename');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize and validate user input object
  userInput: (input) => {
    const sanitized = {};

    // Sanitize text content
    if (input.text !== undefined) {
      sanitized.text = sanitize.text(input.text);
    }

    // Sanitize writing style (whitelist approach)
    if (input.writingStyle !== undefined) {
      const allowedStyles = ['academic', 'business', 'casual', 'creative', 'technical'];
      sanitized.writingStyle = allowedStyles.includes(input.writingStyle)
        ? input.writingStyle
        : 'academic';
    }

    // Sanitize language (whitelist approach)
    if (input.language !== undefined) {
      const allowedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
      sanitized.language = allowedLanguages.includes(input.language)
        ? input.language
        : 'en';
    }

    // Sanitize boolean flags
    if (input.autoAnalyze !== undefined) {
      sanitized.autoAnalyze = Boolean(input.autoAnalyze);
    }

    // Sanitize font size (whitelist approach)
    if (input.fontSize !== undefined) {
      const allowedSizes = ['small', 'medium', 'large'];
      sanitized.fontSize = allowedSizes.includes(input.fontSize)
        ? input.fontSize
        : 'medium';
    }

    return sanitized;
  }
};

export default sanitize;
