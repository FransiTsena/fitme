import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Image,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import useTrainerStore from "@/store/trainerStore";

export default function ClientsScreen() {
    const { token } = useAuth();
    const { bookings, bookingsLoading, fetchBookings } = useTrainerStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        if (token) {
            fetchBookings(token);
        }
    }, [token, fetchBookings]);

    const onRefresh = async () => {
        if (!token) return;
        setRefreshing(true);
        await fetchBookings(token);
        setRefreshing(false);
    };

    // Extract unique clients from bookings
    const clients = useMemo(() => {
        const clientMap = new Map<string, {
            id: string;
            name: string;
            email: string;
            phone?: string;
            profileImage?: string;
            totalSessions: number;
            completedSessions: number;
            upcomingSessions: number;
            lastSession?: string;
        }>();

        bookings.forEach((booking) => {
            const member = booking.memberId;
            if (typeof member !== 'object') return;

            const memberId = member._id;
            const existing = clientMap.get(memberId);
            
            const isCompleted = booking.status === 'completed';
            const isUpcoming = booking.status === 'booked' && new Date(booking.scheduledDate) >= new Date();

            if (existing) {
                existing.totalSessions += 1;
                if (isCompleted) existing.completedSessions += 1;
                if (isUpcoming) existing.upcomingSessions += 1;
                
                const bookingDate = new Date(booking.scheduledDate);
                if (!existing.lastSession || bookingDate > new Date(existing.lastSession)) {
                    existing.lastSession = booking.scheduledDate;
                }
            } else {
                clientMap.set(memberId, {
                    id: memberId,
                    name: member.name,
                    email: member.email,
                    phone: member.phone,
                    profileImage: member.profileImage,
                    totalSessions: 1,
                    completedSessions: isCompleted ? 1 : 0,
                    upcomingSessions: isUpcoming ? 1 : 0,
                    lastSession: booking.scheduledDate,
                });
            }
        });

        return Array.from(clientMap.values());
    }, [bookings]);

    // Filter clients
    const filteredClients = useMemo(() => {
        switch (filter) {
            case 'active':
                return clients.filter(c => c.upcomingSessions > 0);
            case 'completed':
                return clients.filter(c => c.upcomingSessions === 0 && c.completedSessions > 0);
            default:
                return clients;
        }
    }, [clients, filter]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Clients</Text>
                <Text style={styles.headerSubtitle}>{clients.length} total clients</Text>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All ({clients.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
                        Active ({clients.filter(c => c.upcomingSessions > 0).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                        Past ({clients.filter(c => c.upcomingSessions === 0 && c.completedSessions > 0).length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8c2b" />
                }
            >
                {bookingsLoading ? (
                    <ActivityIndicator size="large" color="#ff8c2b" style={{ marginTop: 50 }} />
                ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <View key={client.id} style={styles.clientCard}>
                            <View style={styles.clientHeader}>
                                <View style={styles.avatarContainer}>
                                    {client.profileImage ? (
                                        <Image 
                                            source={{ uri: client.profileImage }} 
                                            style={styles.avatar}
                                        />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
                                        </View>
                                    )}
                                    {client.upcomingSessions > 0 && (
                                        <View style={styles.activeDot} />
                                    )}
                                </View>
                                <View style={styles.clientInfo}>
                                    <Text style={styles.clientName}>{client.name}</Text>
                                    <Text style={styles.clientEmail}>{client.email}</Text>
                                    {client.phone && (
                                        <Text style={styles.clientPhone}>{client.phone}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{client.totalSessions}</Text>
                                    <Text style={styles.statLabel}>Total</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#00cc44' }]}>{client.completedSessions}</Text>
                                    <Text style={styles.statLabel}>Completed</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#ff8c2b' }]}>{client.upcomingSessions}</Text>
                                    <Text style={styles.statLabel}>Upcoming</Text>
                                </View>
                            </View>

                            {client.lastSession && (
                                <View style={styles.lastSessionRow}>
                                    <Ionicons name="calendar-outline" size={14} color="#666" />
                                    <Text style={styles.lastSessionText}>
                                        Last session: {formatDate(client.lastSession)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.clientActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Message</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.scheduleButton]}
                                    onPress={() => router.push("/trainer/schedule" as any)}
                                >
                                    <Ionicons name="calendar" size={18} color="#000" />
                                    <Text style={[styles.actionButtonText, { color: '#000' }]}>View Sessions</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color="#333" />
                        <Text style={styles.emptyTitle}>No Clients Found</Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'all' 
                                ? "You haven't had any bookings yet. Share your sessions to get started!"
                                : filter === 'active'
                                    ? "No clients with upcoming sessions"
                                    : "No clients with past sessions only"
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="people" size={24} color="#ff8c2b" />
                    <Text style={[styles.navText, styles.navTextActive]}>Clients</Text>
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
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingBottom: 15,
        gap: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "#222",
    },
    filterButtonActive: {
        backgroundColor: "#ff8c2b20",
        borderColor: "#ff8c2b",
    },
    filterText: {
        fontSize: 13,
        color: "#888",
        fontWeight: "500",
    },
    filterTextActive: {
        color: "#ff8c2b",
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 100,
    },
    clientCard: {
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#222",
    },
    clientHeader: {
        flexDirection: "row",
        marginBottom: 16,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 15,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#ff8c2b",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    activeDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#00cc44",
        borderWidth: 2,
        borderColor: "#111",
    },
    clientInfo: {
        flex: 1,
        justifyContent: "center",
    },
    clientName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    clientEmail: {
        fontSize: 14,
        color: "#888",
        marginTop: 2,
    },
    clientPhone: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    statsRow: {
        flexDirection: "row",
        backgroundColor: "#080808",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#222",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    statLabel: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    lastSessionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    lastSessionText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 6,
    },
    clientActions: {
        flexDirection: "row",
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#333",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    scheduleButton: {
        backgroundColor: "#ff8c2b",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#666",
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#444",
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 40,
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
