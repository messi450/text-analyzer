/**
 * Application Constants
 * Centralized constants for the application
 */

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES = {
    theme: 'light',
    default_writing_style: 'casual',
    default_language: 'en',
    show_suggestions: true,
    auto_analyze: true,
    font_size: 'medium',
};

/**
 * Reading speed (words per minute)
 */
export const DEFAULT_READING_SPEED = 200;

/**
 * Session expiration time (7 days in milliseconds)
 */
export const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Minimum password length
 */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Maximum text length for analysis (to prevent performance issues)
 */
export const MAX_TEXT_LENGTH = 100000;

/**
 * Minimum text length for AI suggestions
 */
export const MIN_TEXT_LENGTH_FOR_AI = 20;

