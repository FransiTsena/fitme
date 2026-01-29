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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import useOwnerStore from "@/store/ownerStore";

export default function OwnerHomeScreen() {
    const { user, token } = useAuth();
    const {
        gym,
        analytics,
        fetchGym,
        fetchAnalytics
    } = useOwnerStore();

    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const loadData = async () => {
        if (!token || !user?.id) {
            console.log("No token or user.id available:", { token: !!token, userId: user?.id });
            setInitialLoading(false);
            return;
        }

        try {
            await fetchGym(user.id, token);
        } catch (error) {
            console.error("Error loading gym data:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    // Fetch analytics when gym is loaded
    useEffect(() => {
        if (gym?._id && token) {
            fetchAnalytics(gym._id, token);
        }
    }, [gym?._id, token, fetchAnalytics]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, token]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
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

    // If no gym registered, show registration prompt
    if (!gym) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerLeft: () => null,
                        headerRight: () => (
                            <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                                <TouchableOpacity onPress={() => router.push("/owner/menu")}>
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
                <View style={styles.noGymContainer}>
                    <Ionicons name="business-outline" size={80} color="#333" />
                    <Text style={styles.noGymTitle}>No Gym Registered</Text>
                    <Text style={styles.noGymText}>
                        Register your gym to start managing memberships, trainers, and track your business analytics.
                    </Text>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push("/owner/owner-gym-registration")}
                    >
                        <Ionicons name="add-circle" size={20} color="#000" />
                        <Text style={styles.registerButtonText}>Register Your Gym</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']} testID="owner-dashboard">
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null,
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/owner/menu")}>
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
                {/* Gym Header */}
                <View style={styles.gymHeader}>
                    <View style={styles.gymInfo}>
                        <Text style={styles.gymName}>{gym.name}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={14} color="#888" />
                            <Text style={styles.locationText}>
                                {gym.address?.area}, {gym.address?.city}
                            </Text>
                        </View>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        gym.verificationStatus === 'approved' ? styles.approvedBadge :
                            gym.verificationStatus === 'pending' ? styles.pendingBadge : styles.rejectedBadge
                    ]}>
                        <Text style={styles.statusText}>
                            {gym.verificationStatus === 'approved' ? 'Verified' :
                                gym.verificationStatus === 'pending' ? 'Pending' : 'Rejected'}
                        </Text>
                    </View>
                </View>

                {/* Stats Overview */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#4a90d920' }]}>
                            <Ionicons name="people" size={24} color="#4a90d9" />
                        </View>
                        <Text style={styles.statNumber}>
                            {analytics?.gymPerformance?.activeMembers || 0}
                        </Text>
                        <Text style={styles.statLabel}>Active Members</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#00cc4420' }]}>
                            <Ionicons name="trending-up" size={24} color="#00cc44" />
                        </View>
                        <Text style={styles.statNumber}>
                            +{analytics?.gymPerformance?.newMembersMonthly || 0}
                        </Text>
                        <Text style={styles.statLabel}>New This Month</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#ff8c2b20' }]}>
                            <Ionicons name="fitness" size={24} color="#ff8c2b" />
                        </View>
                        <Text style={styles.statNumber}>
                            {analytics?.trainers?.activeCount || 0}
                        </Text>
                        <Text style={styles.statLabel}>Trainers</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#ffd70020' }]}>
                            <Ionicons name="star" size={24} color="#ffd700" />
                        </View>
                        <Text style={styles.statNumber}>
                            {gym.rating?.average?.toFixed(1) || '0.0'}
                        </Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>

                {/* Revenue Card */}
                <View style={styles.revenueCard}>
                    <View style={styles.revenueHeader}>
                        <Text style={styles.sectionTitle}>Revenue</Text>
                        <View style={styles.revenueBadge}>
                            <Ionicons
                                name={(analytics?.revenue?.growth ?? 0) >= 0 ? "trending-up" : "trending-down"}
                                size={14}
                                color={(analytics?.revenue?.growth ?? 0) >= 0 ? "#00cc44" : "#ff4444"}
                            />
                            <Text style={[
                                styles.revenueGrowth,
                                { color: (analytics?.revenue?.growth ?? 0) >= 0 ? "#00cc44" : "#ff4444" }
                            ]}>
                                {analytics?.revenue?.growth || 0}%
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.revenueAmount}>
                        ETB {(analytics?.revenue?.total || 0).toLocaleString()}
                    </Text>
                    <Text style={styles.revenueSubtext}>Total earnings this month</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push("/owner/members-list-owner")}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#4a90d920' }]}>
                                <Ionicons name="people" size={28} color="#4a90d9" />
                            </View>
                            <Text style={styles.actionText}>Members</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push("/owner/trainers-list-owner")}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ff8c2b20' }]}>
                                <Ionicons name="fitness" size={28} color="#ff8c2b" />
                            </View>
                            <Text style={styles.actionText}>Trainers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push("/owner/membership-plans")}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#00cc4420' }]}>
                                <Ionicons name="card" size={28} color="#00cc44" />
                            </View>
                            <Text style={styles.actionText}>Plans</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push("/owner/analytics" as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#9b59b620' }]}>
                                <Ionicons name="analytics" size={28} color="#9b59b6" />
                            </View>
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Top Trainers */}
                {analytics?.trainers?.topBooked && analytics.trainers.topBooked.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Trainers</Text>
                            <TouchableOpacity onPress={() => router.push("/owner/trainers-list-owner")}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {analytics.trainers.topBooked.slice(0, 3).map((trainer, index) => (
                            <View key={trainer._id || index} style={styles.trainerCard}>
                                <View style={styles.trainerRank}>
                                    <Text style={styles.rankText}>#{index + 1}</Text>
                                </View>
                                <View style={styles.trainerInfo}>
                                    <Text style={styles.trainerName}>{trainer.name}</Text>
                                    <Text style={styles.trainerStats}>
                                        {trainer.count} sessions • ⭐ {trainer.rating?.toFixed(1) || 'N/A'}
                                    </Text>
                                </View>
                                <Text style={styles.trainerRevenue}>
                                    ETB {(trainer.revenue || 0).toLocaleString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Gym Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gym Settings</Text>
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => router.push("/owner/profile")}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="business" size={20} color="#ff8c2b" />
                            <Text style={styles.settingText}>Edit Gym Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => router.push("/owner/operating-hours" as any)}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="time" size={20} color="#4a90d9" />
                            <Text style={styles.settingText}>Operating Hours</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => router.push("/owner/amenities" as any)}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="barbell" size={20} color="#00cc44" />
                            <Text style={styles.settingText}>Amenities & Equipment</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#ff8c2b" />
                    <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/owner/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Members</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/owner/trainers-list-owner")}>
                    <Ionicons name="fitness-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Trainers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/owner/analytics" as any)}>
                    <Ionicons name="analytics-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/owner/profile")}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
    // No Gym State
    noGymContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    noGymTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 20,
        marginBottom: 10,
    },
    noGymText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 30,
    },
    registerButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff8c2b",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    registerButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    // Gym Header
    gymHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    gymInfo: {
        flex: 1,
    },
    gymName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: "#888",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    approvedBadge: {
        backgroundColor: "#00cc4420",
    },
    pendingBadge: {
        backgroundColor: "#ff8c2b20",
    },
    rejectedBadge: {
        backgroundColor: "#ff444420",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    // Stats Grid
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#222",
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
    },
    // Revenue Card
    revenueCard: {
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#222",
    },
    revenueHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    revenueBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    revenueGrowth: {
        fontSize: 12,
        fontWeight: "600",
    },
    revenueAmount: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ff8c2b",
        marginBottom: 4,
    },
    revenueSubtext: {
        fontSize: 13,
        color: "#666",
    },
    // Sections
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: "#ff8c2b",
        fontWeight: "500",
    },
    // Quick Actions
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#222",
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    // Trainer Cards
    trainerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#222",
    },
    trainerRank: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#ff8c2b20",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    rankText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#ff8c2b",
    },
    trainerInfo: {
        flex: 1,
    },
    trainerName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 2,
    },
    trainerStats: {
        fontSize: 12,
        color: "#888",
    },
    trainerRevenue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00cc44",
    },
    // Settings
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#222",
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    settingText: {
        fontSize: 15,
        color: "#fff",
    },
    // Bottom Nav
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
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
