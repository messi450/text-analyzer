/**
 * Error Handling Utilities
 * Centralized error handling and logging
 */

/**
 * Error types for better error categorization
 */
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    API: 'API_ERROR',
    AUTH: 'AUTH_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Error} originalError - Original error object
 * @returns {Object} Standardized error object
 */
export function createError(message, type = ErrorTypes.UNKNOWN, originalError = null) {
    return {
        message,
        type,
        timestamp: new Date().toISOString(),
        originalError: originalError ? {
            message: originalError.message,
            stack: originalError.stack,
        } : null,
    };
}

/**
 * Handle API errors with proper formatting
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error
 */
export function handleApiError(error, context = 'API call') {
    console.error(`[${context}]`, error);
    
    if (error.name === 'AbortError') {
        return createError(
            'Request timed out. Please try again.',
            ErrorTypes.NETWORK,
            error
        );
    }
    
    if (error.message?.includes('API key')) {
        return createError(
            'API key not configured. Please check your environment variables.',
            ErrorTypes.API,
            error
        );
    }
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return createError(
            'Network error. Please check your internet connection.',
            ErrorTypes.NETWORK,
            error
        );
    }
    
    return createError(
        error.message || 'An unexpected error occurred',
        ErrorTypes.API,
        error
    );
}

/**
 * Handle validation errors
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @returns {Object} Formatted error
 */
export function handleValidationError(field, message) {
    return createError(
        `${field}: ${message}`,
        ErrorTypes.VALIDATION
    );
}

/**
 * Safe async function wrapper with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Promise} Wrapped function result
 */
export async function safeAsync(fn, context = 'Operation') {
    try {
        return await fn();
    } catch (error) {
        const formattedError = handleApiError(error, context);
        throw formattedError;
    }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const waitTime = delay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    throw lastError;
}

