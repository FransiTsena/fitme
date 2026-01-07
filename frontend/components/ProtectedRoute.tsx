import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text } from 'react-native';

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    fallback = null
}) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Use a timeout to ensure navigation system is ready
            const timer = setTimeout(() => {
                router.replace('/login');
            }, 200); // Increased timeout to be more reliable

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        // You can return a loading component here if needed
        // Return null or a loading indicator while checking auth
        return fallback || <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
    }

    if (!isAuthenticated) {
        // Don't render children if not authenticated
        return fallback || null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;