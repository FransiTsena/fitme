import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import useTrainerStore from "@/store/trainerStore";

export default function TrainerHomeScreen() {
    const { user, token } = useAuth();
    const { 
        profile, 
        bookings, 
        stats,
        loading, 
        fetchTrainerProfile, 
        fetchBookings,
        fetchStats,
        fetchSessions
    } = useTrainerStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const loadData = async () => {
        if (!token || !user?.id) {
            console.log("No token or user.id available:", { token: !!token, userId: user?.id });
            setInitialLoading(false);
            return;
        }
        
        try {
            await Promise.all([
                fetchTrainerProfile(user.id, token),
                fetchBookings(token),
                fetchStats(token),
                fetchSessions(token),
            ]);
        } catch (error) {
            console.error("Error loading trainer data:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, token]);

    // Check if profile is complete (has specialization and bio)
    useEffect(() => {
        if (!initialLoading && profile) {
            const isProfileIncomplete = !profile.specialization?.length || !profile.bio;
            if (isProfileIncomplete) {
                router.replace("/trainer/complete-profile" as any);
            }
        }
    }, [profile, initialLoading]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Get upcoming bookings (today and future)
    const upcomingBookings = bookings
        .filter(b => {
            const bookingDate = new Date(b.scheduledDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return bookingDate >= today && b.status === 'booked';
        })
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 3);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Show loading while fetching initial data
    if (initialLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerLeft: () => null,
                        headerStyle: { backgroundColor: "#000" },
                        headerTintColor: "#fff",
                        headerTitleAlign: "left",
                        headerShadowVisible: false,
                    }}
                />
                <ActivityIndicator size="large" color="#ff8c2b" />
                <Text style={{ color: "#888", marginTop: 16, fontSize: 14 }}>Loading your dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container} testID="trainer-dashboard">
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null,
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/trainer/menu")}>
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8c2b" />
                }
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.nameText}>{user?.name || 'Trainer'}</Text>
                    {profile?.gymId && (
                        <Text style={styles.gymText}>
                            <Ionicons name="location-outline" size={14} color="#888" />
                            {' '}{typeof profile.gymId === 'object' ? profile.gymId.name : 'Your Gym'}
                        </Text>
                    )}
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="calendar" size={24} color="#ff8c2b" />
                        <Text style={styles.statNumber}>{stats?.upcomingBookings || 0}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="people" size={24} color="#00cc44" />
                        <Text style={styles.statNumber}>{stats?.totalClients || 0}</Text>
                        <Text style={styles.statLabel}>Clients</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="fitness" size={24} color="#4a90d9" />
                        <Text style={styles.statNumber}>{stats?.totalSessions || 0}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="star" size={24} color="#ffd700" />
                        <Text style={styles.statNumber}>{stats?.rating?.toFixed(1) || '0.0'}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => router.push("/trainer/sessions" as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ff8c2b20' }]}>
                                <Ionicons name="add-circle" size={28} color="#ff8c2b" />
                            </View>
                            <Text style={styles.actionText}>Create Session</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => router.push("/trainer/schedule" as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#4a90d920' }]}>
                                <Ionicons name="calendar" size={28} color="#4a90d9" />
                            </View>
                            <Text style={styles.actionText}>View Schedule</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => router.push("/trainer/clients" as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#00cc4420' }]}>
                                <Ionicons name="people" size={28} color="#00cc44" />
                            </View>
                            <Text style={styles.actionText}>My Clients</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => router.push("/trainer/profile")}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#9b59b620' }]}>
                                <Ionicons name="person" size={28} color="#9b59b6" />
                            </View>
                            <Text style={styles.actionText}>My Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Upcoming Sessions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                        <TouchableOpacity onPress={() => router.push("/trainer/schedule" as any)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#ff8c2b" style={{ marginTop: 20 }} />
                    ) : upcomingBookings.length > 0 ? (
                        upcomingBookings.map((booking) => (
                            <TouchableOpacity 
                                key={booking._id} 
                                style={styles.bookingCard}
                                onPress={() => router.push("/trainer/schedule" as any)}
                            >
                                <View style={styles.bookingLeft}>
                                    <View style={styles.clientAvatar}>
                                        <Ionicons name="person" size={20} color="#fff" />
                                    </View>
                                    <View style={styles.bookingInfo}>
                                        <Text style={styles.clientName}>
                                            {typeof booking.memberId === 'object' ? booking.memberId.name : 'Client'}
                                        </Text>
                                        <Text style={styles.sessionTitle}>
                                            {typeof booking.sessionId === 'object' ? booking.sessionId.title : 'Training Session'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.bookingRight}>
                                    <Text style={styles.bookingDate}>{formatDate(booking.scheduledDate)}</Text>
                                    <Text style={styles.bookingTime}>{booking.timeSlot}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={48} color="#333" />
                            <Text style={styles.emptyText}>No upcoming sessions</Text>
                            <Text style={styles.emptySubtext}>Your scheduled sessions will appear here</Text>
                        </View>
                    )}
                </View>

                {/* Earnings Card */}
                <View style={styles.section}>
                    <View style={styles.earningsCard}>
                        <View style={styles.earningsLeft}>
                            <Text style={styles.earningsLabel}>Total Earnings</Text>
                            <Text style={styles.earningsAmount}>
                                ETB {stats?.totalEarnings?.toLocaleString() || '0'}
                            </Text>
                            <Text style={styles.earningsSubtext}>
                                {stats?.completedBookings || 0} completed sessions
                            </Text>
                        </View>
                        <View style={styles.earningsIcon}>
                            <Ionicons name="wallet" size={40} color="#00cc44" />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#ff8c2b" />
                    <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/clients" as any)}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Clients</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/sessions" as any)}>
                    <Ionicons name="fitness-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/schedule" as any)}>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/profile")}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    welcomeSection: {
        marginBottom: 25,
    },
    welcomeText: {
        fontSize: 16,
        color: "#888",
    },
    nameText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 4,
    },
    gymText: {
        fontSize: 14,
        color: "#888",
        marginTop: 8,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    statCard: {
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#222",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        color: "#888",
        marginTop: 4,
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 15,
    },
    seeAllText: {
        fontSize: 14,
        color: "#ff8c2b",
        marginBottom: 15,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    actionCard: {
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        width: "48%",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#222",
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    actionText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "500",
    },
    bookingCard: {
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#222",
    },
    bookingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    clientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#ff8c2b",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    bookingInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    sessionTitle: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    bookingRight: {
        alignItems: "flex-end",
    },
    bookingDate: {
        fontSize: 14,
        color: "#ff8c2b",
        fontWeight: "500",
    },
    bookingTime: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        backgroundColor: "#111",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#222",
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: "#444",
        marginTop: 4,
    },
    earningsCard: {
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#00cc4440",
    },
    earningsLeft: {
        flex: 1,
    },
    earningsLabel: {
        fontSize: 14,
        color: "#888",
    },
    earningsAmount: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#00cc44",
        marginTop: 4,
    },
    earningsSubtext: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
    earningsIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#00cc4420",
        justifyContent: "center",
        alignItems: "center",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: "center",
    },
    navText: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    navTextActive: {
        color: "#ff8c2b",
    },
});