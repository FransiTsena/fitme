import React, { ReactNode, createContext, useContext, useEffect } from 'react';
import useAuthStore from '@/store/authStore';

interface AuthContextType {
    user: any;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
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
        // Trainer-specific fields
        specialization?: string[];
        bio?: string;
        gymId?: string;
    }) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const {
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
        fetchUser,
        clearError
    } = useAuthStore();

    // Check if user is authenticated on app start
    useEffect(() => {
        if (token && !user) {
            fetchUser();
        }
    }, [token, user, fetchUser]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            error,
            login,
            signup,
            logout,
            fetchUser,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};