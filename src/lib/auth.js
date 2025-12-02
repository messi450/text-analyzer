// Local Authentication Service
// Works completely offline using localStorage

const AUTH_KEY = 'textalyzer_auth';
const USERS_KEY = 'textalyzer_users';

// Simple hash function that works in all environments
// For production, consider using bcryptjs or similar
function simpleHash(str) {
    let hash = 0;
    const salt = 'textalyzer_secure_salt_2024_v2';
    const input = str + salt;
    
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive hex string and add more entropy
    const base = Math.abs(hash).toString(16);
    let result = base;
    
    // Add multiple rounds for better security
    for (let round = 0; round < 3; round++) {
        let roundHash = 0;
        const roundInput = result + salt + round;
        for (let i = 0; i < roundInput.length; i++) {
            const char = roundInput.charCodeAt(i);
            roundHash = ((roundHash << 5) - roundHash) + char;
            roundHash = roundHash & roundHash;
        }
        result += Math.abs(roundHash).toString(16);
    }
    
    return result;
}

// Hash password with fallback for non-secure contexts
async function hashPassword(password) {
    const salt = 'textalyzer_salt_2024';
    const input = password + salt;
    
    // Try using Web Crypto API first (more secure)
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fall through to simple hash
            console.warn('Web Crypto API failed, using fallback hash');
        }
    }
    
    // Fallback to simple hash for non-secure contexts
    return simpleHash(input);
}

// Get all registered users
function getUsers() {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch {
        return [];
    }
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current session
function getSession() {
    try {
        const session = localStorage.getItem(AUTH_KEY);
        if (!session) return null;
        
        const parsed = JSON.parse(session);
        // Check if session is expired (7 days)
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
            localStorage.removeItem(AUTH_KEY);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

// Create session
function createSession(user) {
    const session = {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
}

// Auth Service
export const authService = {
    // Check if user is authenticated
    isAuthenticated() {
        const session = getSession();
        return !!session;
    },

    // Get current user
    getCurrentUser() {
        const session = getSession();
        return session?.user || null;
    },

    // Register new user
    async register(email, password, name) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const users = getUsers();
        
        // Check if email already exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('An account with this email already exists');
        }

        const hashedPassword = await hashPassword(password);
        
        const newUser = {
            id: `user_${Date.now()}`,
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // Auto login after registration
        const session = createSession(newUser);
        return session.user;
    },

    // Login
    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error('No account found with this email');
        }

        const hashedPassword = await hashPassword(password);
        
        if (user.password !== hashedPassword) {
            throw new Error('Incorrect password');
        }

        const session = createSession(user);
        return session.user;
    },

    // Logout
    logout() {
        localStorage.removeItem(AUTH_KEY);
    },

    // Update user profile
    async updateProfile(updates) {
        const session = getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === session.user.id);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Update user
        users[userIndex] = { ...users[userIndex], ...updates };
        saveUsers(users);

        // Update session
        createSession(users[userIndex]);
        
        return users[userIndex];
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        const session = getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        const users = getUsers();
        const user = users.find(u => u.id === session.user.id);
        
        if (!user) {
            throw new Error('User not found');
        }

        const currentHashed = await hashPassword(currentPassword);
        if (user.password !== currentHashed) {
            throw new Error('Current password is incorrect');
        }

        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }

        user.password = await hashPassword(newPassword);
        saveUsers(users);

        return true;
    },

    // Delete account
    async deleteAccount(password) {
        const session = getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        const users = getUsers();
        const user = users.find(u => u.id === session.user.id);
        
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new Error('Incorrect password');
        }

        // Remove user
        const filteredUsers = users.filter(u => u.id !== session.user.id);
        saveUsers(filteredUsers);

        // Logout
        this.logout();

        return true;
    }
};

// Export for easy importing
export default authService;
