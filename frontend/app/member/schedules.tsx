import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState, useCallback } from 'react';

// Platform-aware API URL
const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function SchedulesScreen() {
    const { user, token } = useAuth();
    const [userMemberships, setUserMemberships] = useState<any[]>([]);
    const [gymSessions, setGymSessions] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'available' | 'booked'>('booked');

    const fetchUserData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // 1. Fetch user's active memberships
            const membershipsResponse = await fetch(`${API_BASE_URL}/subscriptions/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (membershipsResponse.ok) {
                const membershipsData = await membershipsResponse.json();
                const activeMemberships = (membershipsData.memberships || membershipsData.data || membershipsData || []).filter(
                    (membership: any) => membership.status === 'active'
                );
                setUserMemberships(activeMemberships);

                // 2. Fetch available sessions for all gyms the user is a member of
                if (activeMemberships.length > 0) {
                    const gymIds = activeMemberships.map((membership: any) =>
                        typeof membership.gymId === 'string' ? membership.gymId : membership.gymId._id
                    );

                    const allSessionsPromises = gymIds.map(id =>
                        fetch(`${API_BASE_URL}/training-sessions/gym/${id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }).then(res => res.ok ? res.json() : { sessions: [] })
                    );

                    const results = await Promise.all(allSessionsPromises);
                    const combinedSessions = results.flatMap(res => res.sessions || res.data || res || []);
                    const uniqueSessions = Array.from(new Map(combinedSessions.map((s: any) => [s._id, s])).values());
                    setGymSessions(uniqueSessions);
                }
            }

            // 3. Fetch user's actual bookings (their schedule)
            const bookingsResponse = await fetch(`${API_BASE_URL}/bookings/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();
                setMyBookings(bookingsData.bookings || bookingsData.data || []);
            }

        } catch (error) {
            console.error('Error fetching schedule data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData();
    };

    const renderSessionItem = ({ item }: { item: any }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <ThemedText type="subtitle" style={styles.sessionTitleText}>{item.title}</ThemedText>
                <ThemedText type="subtitle" style={styles.sessionPriceText}>{item.price} ETB</ThemedText>
            </View>
            <ThemedText style={styles.sessionDescription}>{item.description}</ThemedText>
            <View style={styles.sessionMeta}>
                <Ionicons name="time-outline" size={16} color="#aaa" />
                <ThemedText style={styles.sessionDuration}>{item.durationMinutes} minutes</ThemedText>
            </View>
            <TouchableOpacity
                style={styles.bookButton}
                onPress={() => router.push({ pathname: '/member/book-session', params: { sessionId: item._id } })}
            >
                <ThemedText style={styles.buttonText}>Book Session</ThemedText>
            </TouchableOpacity>
        </View>
    );

    const renderBookingItem = ({ item }: { item: any }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <View>
                    <ThemedText type="subtitle" style={styles.sessionTitleText}>{item.sessionId?.title || "Training Session"}</ThemedText>
                    <ThemedText style={styles.bookingGymText}>{item.gymId?.name || "Main Gym"}</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'booked' ? '#ff8c2b20' : '#444' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'booked' ? '#ff8c2b' : '#aaa' }]}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.bookingDetails}>
                <View style={styles.bookingDetailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#ff8c2b" />
                    <Text style={styles.bookingDetailText}>{new Date(item.scheduledDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.bookingDetailItem}>
                    <Ionicons name="time-outline" size={16} color="#ff8c2b" />
                    <Text style={styles.bookingDetailText}>{item.timeSlot}</Text>
                </View>
            </View>
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
                                <TouchableOpacity onPress={() => router.push("/member/menu")}>
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
                    <View style={styles.header}>
                        <ThemedText type="subtitle" style={styles.title}>Gym Schedule</ThemedText>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'booked' && styles.activeTab]}
                            onPress={() => setActiveTab('booked')}
                        >
                            <Text style={[styles.tabText, activeTab === 'booked' && styles.activeTabText]}>My Schedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
                            onPress={() => setActiveTab('available')}
                        >
                            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>Find Sessions</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#ff8c2b" />
                            <ThemedText style={{ marginTop: 10 }}>Loading...</ThemedText>
                        </View>
                    ) : activeTab === 'available' ? (
                        userMemberships.length > 0 ? (
                            gymSessions.length > 0 ? (
                                <FlatList
                                    data={gymSessions}
                                    renderItem={renderSessionItem}
                                    keyExtractor={(item) => item._id}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContainer}
                                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8c2b" />}
                                />
                            ) : (
                                <View style={styles.centerContainer}>
                                    <Ionicons name="barbell-outline" size={60} color="#333" />
                                    <ThemedText type="default" style={styles.emptyText}>No available sessions at your gyms at the moment.</ThemedText>
                                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                                        <Text style={styles.refreshButtonText}>Refresh</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        ) : (
                            <View style={styles.noMembershipContainer}>
                                <Ionicons name="card-outline" size={60} color="#333" />
                                <ThemedText type="default" style={styles.emptyText}>You need an active gym membership to see and book sessions.</ThemedText>
                                <TouchableOpacity
                                    style={styles.subscribeButton}
                                    onPress={() => router.push('/member/gym-selection')}
                                >
                                    <ThemedText style={styles.buttonText}>Find a Gym</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        myBookings.length > 0 ? (
                            <FlatList
                                data={myBookings}
                                renderItem={renderBookingItem}
                                keyExtractor={(item) => item._id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContainer}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8c2b" />}
                            />
                        ) : (
                            <View style={styles.centerContainer}>
                                <Ionicons name="calendar-outline" size={60} color="#333" />
                                <ThemedText type="default" style={styles.emptyText}>You haven't booked any sessions yet.</ThemedText>
                                <TouchableOpacity style={styles.refreshButton} onPress={() => setActiveTab('available')}>
                                    <Text style={styles.refreshButtonText}>Find Sessions to Book</Text>
                                </TouchableOpacity>
                            </View>
                        )
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
        paddingTop: 10,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 10,
    },
    title: {
        color: '#fff',
        fontSize: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#ff8c2b',
    },
    tabText: {
        color: '#888',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    sessionCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    bookingCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sessionTitleText: {
        color: '#fff',
        fontSize: 18,
        flex: 1,
    },
    sessionPriceText: {
        color: '#ff8c2b',
        fontSize: 16,
    },
    bookingGymText: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 2,
    },
    sessionDescription: {
        color: '#888',
        marginBottom: 12,
        fontSize: 14,
    },
    sessionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 6,
    },
    sessionDuration: {
        color: '#aaa',
        fontSize: 14,
    },
    bookingDetails: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 5,
    },
    bookingDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookingDetailText: {
        color: '#eee',
        fontSize: 14,
    },
    bookButton: {
        backgroundColor: '#ff8c2b',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    noMembershipContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 25,
        color: '#888',
        lineHeight: 20,
    },
    subscribeButton: {
        backgroundColor: '#ff8c2b',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    refreshButton: {
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    refreshButtonText: {
        color: '#ff8c2b',
        fontWeight: 'bold',
    },
});