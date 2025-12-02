import { createClient } from '@base44/sdk';
import env from '@/lib/env';

// Create a client with authentication OPTIONAL
// Core text analysis features work without authentication
// AI features require authentication
export const base44 = createClient({
  appId: env.BASE44_APP_ID,
  requiresAuth: false // Make auth optional - core features work without login
});

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    return await base44.auth.isAuthenticated();
  } catch {
    return false;
  }
};

// Helper to check if AI features are available
export const isAIAvailable = async () => {
  try {
    const isAuth = await base44.auth.isAuthenticated();
    return isAuth;
  } catch {
    return false;
  }
};
