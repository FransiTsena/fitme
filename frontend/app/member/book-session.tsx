import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

export default function BookSessionScreen() {
    const { user } = useAuth();
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch session details from API
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/training-sessions/${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSession(data.session || data.data || data);
                } else {
                    console.error('Failed to fetch session:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchSession();
        }
    }, [user?.token, sessionId]);

    const handleBookSession = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/bookings/book`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    date: new Date().toISOString(),
                    timeSlot: '10:00-11:00' // Default time slot for demo
                }),
            });

            if (response.ok) {
                const result = await response.json();
                Alert.alert('Success', 'Session booked successfully!', [
                    { text: 'OK', onPress: () => router.push('/member/schedules') }
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to book session');
            }
        } catch (error) {
            console.error('Error booking session:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    return (
        <ProtectedRoute>
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                                <TouchableOpacity>
                                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons name="menu-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ),
                        headerStyle: { backgroundColor: "#000" },
                        headerTintColor: "#fff",
                        headerTitleAlign: "left",
                        headerShadowVisible: false,
                    }}
                />

                <View style={styles.container}>
                    <ThemedText type="subtitle" style={styles.title}>Session Details</ThemedText>

                    {loading ? (
                        <ThemedText type="default">Loading session...</ThemedText>
                    ) : session ? (
                        <View style={styles.sessionDetails}>
                            <ThemedText type="subtitle" style={styles.sessionTitle}>{session.title}</ThemedText>
                            <ThemedText style={styles.sessionDescription}>{session.description}</ThemedText>
                            <ThemedText style={styles.sessionInfo}>Duration: {session.durationMinutes} minutes</ThemedText>
                            <ThemedText style={styles.sessionInfo}>Price: {session.price} birr</ThemedText>

                            <TouchableOpacity
                                style={styles.bookButton}
                                onPress={handleBookSession}
                            >
                                <ThemedText style={styles.buttonText}>Book This Session</ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ThemedText type="default">Session not found</ThemedText>
                    )}
                </View>

                <UserBottomNav />
            </View>
        </ProtectedRoute>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 20,
    },
    title: {
        marginBottom: 20,
        color: '#fff',
    },
    sessionDetails: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    sessionTitle: {
        fontSize: 18,
        marginBottom: 10,
        color: '#fff',
    },
    sessionDescription: {
        color: '#888',
        marginBottom: 15,
    },
    sessionInfo: {
        color: '#fff',
        marginBottom: 10,
    },
    bookButton: {
        backgroundColor: '#ff8c2b',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});