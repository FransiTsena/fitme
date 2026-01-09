import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

// Platform-aware API URL
const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function SchedulesScreen() {
    const { user } = useAuth();
    const [userMemberships, setUserMemberships] = useState<any[]>([]);
    const [gymSessions, setGymSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch user's memberships and related gym sessions
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // First, get user's active memberships
                const membershipsResponse = await fetch(`${API_BASE_URL}/subscriptions/my`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (membershipsResponse.ok) {
                    const membershipsData = await membershipsResponse.json();
                    const activeMemberships = (membershipsData.memberships || membershipsData.data || membershipsData).filter(
                        (membership: any) => membership.status === 'active'
                    );
                    setUserMemberships(activeMemberships);

                    // If user has active memberships, fetch sessions for their gyms
                    if (activeMemberships.length > 0) {
                        const gymIds = activeMemberships.map((membership: any) => membership.gymId._id);

                        // For simplicity, fetch sessions from the first gym the user is subscribed to
                        if (gymIds.length > 0) {
                            const sessionsResponse = await fetch(`${API_BASE_URL}/training-sessions/gym/${gymIds[0]}`, {
                                headers: {
                                    'Authorization': `Bearer ${user?.token}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (sessionsResponse.ok) {
                                const sessionsData = await sessionsResponse.json();
                                setGymSessions(sessionsData.sessions || sessionsData.data || sessionsData || []);
                            }
                        }
                    }
                } else {
                    console.error('Failed to fetch user memberships:', membershipsResponse.status, membershipsResponse.statusText);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchUserData();
        }
    }, [user?.token]);

    const renderSessionItem = ({ item }: { item: any }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <ThemedText type="subtitle">{item.title}</ThemedText>
                <ThemedText type="subtitle">{item.price} birr</ThemedText>
            </View>
            <ThemedText style={styles.sessionDescription}>{item.description}</ThemedText>
            <ThemedText style={styles.sessionDuration}>{item.durationMinutes} minutes</ThemedText>
            <TouchableOpacity
                style={styles.bookButton}
                onPress={() => router.push({ pathname: '/member/book-session', params: { sessionId: item._id } })}
            >
                <ThemedText style={styles.buttonText}>Book Session</ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <ProtectedRoute>
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerLeft: () => null,
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
                    <ThemedText type="subtitle" style={styles.title}>Gym Sessions</ThemedText>

                    {loading ? (
                        <ThemedText type="default">Loading schedules...</ThemedText>
                    ) : userMemberships.length > 0 ? (
                        gymSessions.length > 0 ? (
                            <FlatList
                                data={gymSessions}
                                renderItem={renderSessionItem}
                                keyExtractor={(item) => item._id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContainer}
                            />
                        ) : (
                            <ThemedText type="default">No sessions available at your gym</ThemedText>
                        )
                    ) : (
                        <View style={styles.noMembershipContainer}>
                            <ThemedText type="default">You are not subscribed to any gym yet.</ThemedText>
                            <TouchableOpacity
                                style={styles.subscribeButton}
                                onPress={() => router.push('/member/gym-selection')}
                            >
                                <ThemedText style={styles.buttonText}>Find a Gym</ThemedText>
                            </TouchableOpacity>
                        </View>
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
    listContainer: {
        paddingBottom: 20,
    },
    sessionCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sessionDescription: {
        color: '#888',
        marginBottom: 8,
    },
    sessionDuration: {
        color: '#666',
        marginBottom: 12,
    },
    bookButton: {
        backgroundColor: '#ff8c2b',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    subscribeButton: {
        backgroundColor: '#ff8c2b',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noMembershipContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});