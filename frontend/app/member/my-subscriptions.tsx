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

interface Subscription {
    _id: string;
    planId: {
        _id: string;
        title: string;
        price: number;
        durationInDays: number;
        description?: string;
    };
    gymId: {
        _id: string;
        name: string;
        address?: {
            city?: string;
            area?: string;
        };
    };
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string;
    createdAt: string;
}

export default function MySubscriptionsScreen() {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/my`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.memberships || data.data || []);
            } else {
                console.error('Failed to fetch subscriptions:', response.status);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchSubscriptions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSubscriptions();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#00cc44';
            case 'expired': return '#ff4444';
            case 'cancelled': return '#888';
            default: return '#888';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const pastSubscriptions = subscriptions.filter(s => s.status !== 'active');

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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ff8c2b"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Subscriptions</Text>
                    <TouchableOpacity onPress={() => router.push('/member/gym-selection')}>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addButton}
                        >
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text style={styles.addButtonText}>New</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff8c2b" />
                        <Text style={styles.loadingText}>Loading subscriptions...</Text>
                    </View>
                ) : subscriptions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="card-outline" size={64} color="#444" />
                        <Text style={styles.emptyTitle}>No Subscriptions</Text>
                        <Text style={styles.emptyText}>
                            You haven&apos;t subscribed to any gym yet.
                        </Text>
                        <TouchableOpacity
                            style={styles.findGymButton}
                            onPress={() => router.push('/member/gym-selection')}
                        >
                            <LinearGradient
                                colors={['#ff8c2b', '#ff5500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.findGymGradient}
                            >
                                <Ionicons name="search" size={18} color="#fff" />
                                <Text style={styles.findGymText}>Find a Gym</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Active Subscriptions */}
                        {activeSubscriptions.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Active ({activeSubscriptions.length})
                                </Text>
                                {activeSubscriptions.map((sub) => (
                                    <View key={sub._id} style={styles.subscriptionCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.gymInfo}>
                                                <View style={styles.gymIcon}>
                                                    <Ionicons name="fitness" size={24} color="#ff8c2b" />
                                                </View>
                                                <View>
                                                    <Text style={styles.gymName}>
                                                        {sub.gymId?.name || 'Unknown Gym'}
                                                    </Text>
                                                    <Text style={styles.gymLocation}>
                                                        {sub.gymId?.address?.area}, {sub.gymId?.address?.city}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sub.status) + '20' }]}>
                                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(sub.status) }]} />
                                                <Text style={[styles.statusText, { color: getStatusColor(sub.status) }]}>
                                                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.planInfo}>
                                            <Text style={styles.planName}>{sub.planId?.title || 'Plan'}</Text>
                                            <Text style={styles.planPrice}>{sub.planId?.price} ETB</Text>
                                        </View>

                                        <View style={styles.dateInfo}>
                                            <View style={styles.dateRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#888" />
                                                <Text style={styles.dateText}>
                                                    {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                                </Text>
                                            </View>
                                            <View style={styles.daysRemaining}>
                                                <Text style={styles.daysNumber}>{getDaysRemaining(sub.endDate)}</Text>
                                                <Text style={styles.daysLabel}>days left</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.viewGymButton}
                                            onPress={() => router.push({
                                                pathname: '/member/gym-details',
                                                params: { id: sub.gymId?._id }
                                            })}
                                        >
                                            <Text style={styles.viewGymText}>View Gym</Text>
                                            <Ionicons name="chevron-forward" size={16} color="#ff8c2b" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Past Subscriptions */}
                        {pastSubscriptions.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Past ({pastSubscriptions.length})
                                </Text>
                                {pastSubscriptions.map((sub) => (
                                    <View key={sub._id} style={[styles.subscriptionCard, styles.inactiveCard]}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.gymInfo}>
                                                <View style={[styles.gymIcon, { backgroundColor: '#222' }]}>
                                                    <Ionicons name="fitness" size={24} color="#666" />
                                                </View>
                                                <View>
                                                    <Text style={[styles.gymName, { color: '#888' }]}>
                                                        {sub.gymId?.name || 'Unknown Gym'}
                                                    </Text>
                                                    <Text style={styles.gymLocation}>
                                                        {sub.gymId?.address?.area}, {sub.gymId?.address?.city}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sub.status) + '20' }]}>
                                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(sub.status) }]} />
                                                <Text style={[styles.statusText, { color: getStatusColor(sub.status) }]}>
                                                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.planInfo}>
                                            <Text style={[styles.planName, { color: '#888' }]}>{sub.planId?.title || 'Plan'}</Text>
                                            <Text style={[styles.planPrice, { color: '#666' }]}>{sub.planId?.price} ETB</Text>
                                        </View>

                                        <View style={styles.dateInfo}>
                                            <View style={styles.dateRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                                <Text style={[styles.dateText, { color: '#666' }]}>
                                                    {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.renewButton}
                                            onPress={() => router.push({
                                                pathname: '/member/gym-plans',
                                                params: { gymId: sub.gymId?._id }
                                            })}
                                        >
                                            <LinearGradient
                                                colors={['#ff8c2b', '#ff5500']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.renewGradient}
                                            >
                                                <Ionicons name="refresh" size={16} color="#fff" />
                                                <Text style={styles.renewText}>Renew</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <UserBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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
        paddingTop: 80,
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
    findGymButton: {
        marginTop: 24,
    },
    findGymGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    findGymText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginBottom: 12,
    },
    subscriptionCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    inactiveCard: {
        opacity: 0.7,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    gymInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    gymIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ff8c2b20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gymName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    gymLocation: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    planInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    planPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff8c2b',
    },
    dateInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        color: '#888',
        fontSize: 13,
    },
    daysRemaining: {
        alignItems: 'center',
    },
    daysNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00cc44',
    },
    daysLabel: {
        fontSize: 11,
        color: '#888',
    },
    viewGymButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
        gap: 4,
    },
    viewGymText: {
        color: '#ff8c2b',
        fontWeight: '600',
    },
    renewButton: {
        marginTop: 12,
    },
    renewGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    renewText: {
        color: '#fff',
        fontWeight: '600',
    },
});
