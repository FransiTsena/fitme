import { Logo } from "@/components/Logo";
import { UserBottomNav } from "@/components/UserBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

// Platform-aware API URL
const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

interface Booking {
    _id: string;
    sessionId: {
        _id: string;
        title: string;
        description?: string;
        durationMinutes: number;
        price: number;
    };
    trainerId: {
        _id: string;
        userId?: {
            name?: string;
        };
    };
    gymId: {
        _id: string;
        name: string;
    };
    scheduledDate: string;
    timeSlot: string;
    status: 'booked' | 'completed' | 'cancelled';
    createdAt: string;
}

export default function MyBookingsScreen() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings || data.data || []);
            } else {
                console.error('Failed to fetch bookings:', response.status);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleCancelBooking = async (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ status: 'cancelled' }),
                            });

                            if (response.ok) {
                                Alert.alert('Success', 'Booking cancelled successfully');
                                fetchBookings();
                            } else {
                                const errorData = await response.json();
                                Alert.alert('Error', errorData.error || 'Failed to cancel booking');
                            }
                        } catch (error) {
                            console.error('Error cancelling booking:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'booked': return '#ff8c2b';
            case 'completed': return '#00cc44';
            case 'cancelled': return '#ff4444';
            default: return '#888';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'booked': return 'time-outline';
            case 'completed': return 'checkmark-circle-outline';
            case 'cancelled': return 'close-circle-outline';
            default: return 'ellipse-outline';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isUpcoming = (booking: Booking) => {
        const bookingDate = new Date(booking.scheduledDate);
        const now = new Date();
        return booking.status === 'booked' && bookingDate >= now;
    };

    const upcomingBookings = bookings.filter(b => isUpcoming(b));
    const pastBookings = bookings.filter(b => !isUpcoming(b));

    const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
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

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                    <TouchableOpacity onPress={() => router.push('/member/schedules')}>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addButton}
                        >
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text style={styles.addButtonText}>Book</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                            Upcoming ({upcomingBookings.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                            Past ({pastBookings.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ff8c2b"
                        />
                    }
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ff8c2b" />
                            <Text style={styles.loadingText}>Loading bookings...</Text>
                        </View>
                    ) : displayedBookings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={activeTab === 'upcoming' ? "calendar-outline" : "time-outline"}
                                size={64}
                                color="#444"
                            />
                            <Text style={styles.emptyTitle}>
                                {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
                            </Text>
                            <Text style={styles.emptyText}>
                                {activeTab === 'upcoming'
                                    ? "You don't have any upcoming training sessions."
                                    : "You haven't completed any sessions yet."
                                }
                            </Text>
                            {activeTab === 'upcoming' && (
                                <TouchableOpacity
                                    style={styles.findSessionButton}
                                    onPress={() => router.push('/member/schedules')}
                                >
                                    <LinearGradient
                                        colors={['#ff8c2b', '#ff5500']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.findSessionGradient}
                                    >
                                        <Ionicons name="search" size={18} color="#fff" />
                                        <Text style={styles.findSessionText}>Find Sessions</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        displayedBookings.map((booking) => (
                            <View key={booking._id} style={styles.bookingCard}>
                                {/* Session Info */}
                                <View style={styles.sessionHeader}>
                                    <View style={styles.sessionIcon}>
                                        <Ionicons name="barbell" size={24} color="#ff8c2b" />
                                    </View>
                                    <View style={styles.sessionInfo}>
                                        <Text style={styles.sessionTitle}>
                                            {booking.sessionId?.title || 'Training Session'}
                                        </Text>
                                        <Text style={styles.gymName}>
                                            {booking.gymId?.name || 'Gym'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(booking.status) + '20' }
                                    ]}>
                                        <Ionicons
                                            name={getStatusIcon(booking.status) as any}
                                            size={14}
                                            color={getStatusColor(booking.status)}
                                        />
                                        <Text style={[
                                            styles.statusText,
                                            { color: getStatusColor(booking.status) }
                                        ]}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Date & Time */}
                                <View style={styles.dateTimeContainer}>
                                    <View style={styles.dateTimeItem}>
                                        <Ionicons name="calendar-outline" size={18} color="#888" />
                                        <Text style={styles.dateTimeText}>
                                            {formatDate(booking.scheduledDate)}
                                        </Text>
                                    </View>
                                    <View style={styles.dateTimeItem}>
                                        <Ionicons name="time-outline" size={18} color="#888" />
                                        <Text style={styles.dateTimeText}>{booking.timeSlot}</Text>
                                    </View>
                                </View>

                                {/* Session Details */}
                                <View style={styles.detailsContainer}>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Duration</Text>
                                        <Text style={styles.detailValue}>
                                            {booking.sessionId?.durationMinutes || 60} min
                                        </Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Price</Text>
                                        <Text style={styles.detailValue}>
                                            {booking.sessionId?.price || 0} ETB
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                {booking.status === 'booked' && activeTab === 'upcoming' && (
                                    <View style={styles.actionsContainer}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => handleCancelBooking(booking._id)}
                                        >
                                            <Ionicons name="close-circle-outline" size={18} color="#ff4444" />
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {booking.status === 'completed' && (
                                    <View style={styles.completedBanner}>
                                        <Ionicons name="checkmark-circle" size={20} color="#00cc44" />
                                        <Text style={styles.completedText}>Session Completed</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            <UserBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        color: '#888',
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    findSessionButton: {
        marginTop: 24,
    },
    findSessionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    findSessionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    bookingCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    sessionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ff8c2b20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    gymName: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateTimeText: {
        color: '#fff',
        fontSize: 14,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        color: '#888',
        fontSize: 12,
    },
    detailValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    actionsContainer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
        alignItems: 'center',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    cancelButtonText: {
        color: '#ff4444',
        fontWeight: '600',
    },
    completedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    completedText: {
        color: '#00cc44',
        fontWeight: '600',
    },
});
