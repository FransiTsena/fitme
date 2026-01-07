import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    city?: string;
    area?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;

    // Auth actions
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        fatherName?: string;
        registrationRole: string;
        city?: string;
        area?: string;
    }) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    clearError: () => void;
}

// API base URL - configurable for different environments
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005/api';

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            login: async (email, password) => {
                set({ loading: true, error: null });

                try {
                    const response = await fetch(`${API_BASE_URL}/users/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Login failed');
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                    });

                    return { success: true };
                } catch (error: any) {
                    // Handle network errors specifically
                    if (error.message.includes('Network')) {
                        const errorMessage = 'Network error: Unable to connect to the server. Please check your connection and the server status.';
                        set({ error: errorMessage, loading: false });
                        return { success: false, error: errorMessage };
                    }

                    const errorMessage = error.message || 'Login failed';
                    set({ error: errorMessage, loading: false });
                    return { success: false, error: errorMessage };
                }
            },

            signup: async (userData) => {
                set({ loading: true, error: null });

                try {
                    const response = await fetch(`${API_BASE_URL}/users/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Signup failed');
                    }

                    set({
                        user: data.user,
                        token: data.token || null, // Signup might not return a token immediately due to email verification requirements
                        isAuthenticated: !!data.token, // Only set isAuthenticated to true if a token is provided
                        loading: false,
                    });

                    return { success: true };
                } catch (error: any) {
                    // Handle network errors specifically
                    if (error.message.includes('Network')) {
                        const errorMessage = 'Network error: Unable to connect to the server. Please check your connection and the server status.';
                        set({ error: errorMessage, loading: false });
                        return { success: false, error: errorMessage };
                    }

                    const errorMessage = error.message || 'Signup failed';
                    set({ error: errorMessage, loading: false });
                    return { success: false, error: errorMessage };
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            fetchUser: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    const response = await fetch(`${API_BASE_URL}/users/me`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch user');
                    }

                    set({
                        user: data.user,
                        isAuthenticated: true,
                    });
                } catch (error: any) {
                    // Handle network errors specifically
                    if (error.message.includes('Network')) {
                        console.log('Network error when fetching user:', error.message);
                        // Don't clear auth state on network error, just return
                        return;
                    }

                    // If fetching user fails for other reasons, clear auth state
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                }
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for mobile compatibility
        }
    )
);

export default useAuthStore;