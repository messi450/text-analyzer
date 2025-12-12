// Environment configuration with validation and security checks
const requiredEnvVars = {
  // Base44 API configuration
  VITE_BASE44_APP_ID: {
    required: false, // Optional for core features
    validate: (value) => typeof value === 'string' && value.length > 0,
    default: '692ee5cf01eb8c5c45d1e044'
  },

    // OpenAI
  OPENAI_API_KEY: import.meta.env.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,
  
  // Analytics (optional)
  VITE_GA_TRACKING_ID: {
    required: false,
    validate: (value) => !value || (typeof value === 'string' && value.startsWith('G-')),
  },

  // Environment
  NODE_ENV: {
    required: true,
    validate: (value) => ['development', 'production', 'test'].includes(value),
  },
};

const warnings = [];
const errors = [];

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, config]) => {
  const value = import.meta.env[key];

  if (config.required && !value) {
    errors.push(`Required environment variable ${key} is missing`);
    return;
  }

  if (value && !config.validate(value)) {
    errors.push(`Environment variable ${key} has invalid value: ${value}`);
    return;
  }

  // Use default if not provided and not required
  if (!value && config.default) {
    import.meta.env[key] = config.default;
  }
});

// Check for potentially sensitive data in client-side env vars
const clientEnvVars = Object.keys(import.meta.env).filter(key =>
  key.startsWith('VITE_') && import.meta.env[key]
);

clientEnvVars.forEach(key => {
  const value = import.meta.env[key];

  // Warn about potentially sensitive patterns
  if (value.includes('password') || value.includes('secret') || value.includes('key')) {
    warnings.push(`Potentially sensitive data found in ${key} - ensure this is safe for client-side exposure`);
  }

  // Check for valid URLs if it looks like a URL
  if (value.startsWith('http') && !value.startsWith('https://')) {
    warnings.push(`${key} uses HTTP instead of HTTPS`);
  }
});

// Export validated environment
export const env = {
  // Base44
  BASE44_APP_ID: import.meta.env.VITE_BASE44_APP_ID || '692ee5cf01eb8c5c45d1e044',

  // Analytics
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,

  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production',
};

// Log warnings and errors
if (errors.length > 0) {
  console.error('Environment validation errors:', errors);
  if (env.isProduction) {
    throw new Error('Environment validation failed. Check console for details.');
  }
}

if (warnings.length > 0) {
  console.warn('Environment validation warnings:', warnings);
}

// Security: Freeze the env object to prevent runtime modifications
Object.freeze(env);

export default env;
