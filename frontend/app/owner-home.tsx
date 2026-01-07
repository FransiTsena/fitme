import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function OwnerHomeScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null, // Hide back button for a "home" feel
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/owner-menu")}>
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

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeHeader}>
                        <View>
                            <Text style={styles.dateText}>Jun 22, 2025</Text>
                            <Text style={styles.welcomeTitle}>Welcome back,</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil" size={12} color="#ff8c2b" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.gymProfile}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle-outline" size={80} color="#ff8c2b" />
                            <TouchableOpacity style={styles.cameraBtn}>
                                <Ionicons name="camera" size={8} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.gymName}>Bole Fitness Center</Text>
                            <Text style={styles.gymSince}>Since 2010</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.manageBtn}>
                        <Text style={styles.manageBtnText}>Managing your gym efficiently</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="people" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>+13</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>250</Text>
                        <Text style={styles.statLabel}>Total Members</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="cash-outline" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>30%</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>1.3M ETB</Text>
                        <Text style={styles.statLabel}>Revenue</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="barbell" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>+3</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>6</Text>
                        <Text style={styles.statLabel}>Trainers</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="calendar-outline" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>+13</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>250</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard}>
                        <Ionicons name="person-add-outline" size={24} color="#ff8c2b" />
                        <Text style={styles.actionText}>Add Member</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Ionicons name="qr-code-outline" size={24} color="#ff8c2b" />
                        <Text style={styles.actionText}>Generate QR Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Ionicons name="calendar-outline" size={24} color="#ff8c2b" />
                        <Text style={styles.actionText}>Create Event</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Ionicons name="add-circle-outline" size={24} color="#ff8c2b" />
                        <Text style={styles.actionText}>Create Event</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Members */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Members</Text>
                    <TouchableOpacity onPress={() => router.push("/members-list-owner")}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.listItem}>
                        <View style={styles.listAvatar}>
                            <Ionicons name="person" size={20} color="#ff8c2b" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.memberName}>Abebe Bekele</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                            <Text style={styles.memberEmail}>abebe@email.com</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                                <View style={styles.premiumBadge}>
                                    <Text style={styles.premiumText}>Premium</Text>
                                </View>
                                <Text style={styles.joinDate}>• Joined Today</Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Upcoming Events (Recent Members in design typically implies list, but looks like events below) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>+ Create</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.eventCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.eventName}>New Year Fitness Challenge</Text>
                        <View style={styles.eventTypeBadge}>
                            <Text style={styles.eventTypeText}>Competition</Text>
                        </View>
                    </View>
                    <View style={styles.eventFooter}>
                        <View style={styles.eventMeta}>
                            <Ionicons name="calendar-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.eventMetaText}>Jan 15, 2025</Text>
                        </View>
                        <View style={styles.eventMeta}>
                            <Ionicons name="people-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.eventMetaText}>45 participants</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.eventCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.eventName}>Yoga Workshop</Text>
                        <View style={[styles.eventTypeBadge, { backgroundColor: '#332211' }]}>
                            <Text style={[styles.eventTypeText, { color: '#ff8c2b' }]}>Workshop</Text>
                        </View>
                    </View>
                    <View style={styles.eventFooter}>
                        <View style={styles.eventMeta}>
                            <Ionicons name="calendar-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.eventMetaText}>Jan 20, 2025</Text>
                        </View>
                        <View style={styles.eventMeta}>
                            <Ionicons name="people-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.eventMetaText}>30 participants</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom spacer for tab bar if needed, though we are in a stack now */}
                <View style={{ height: 80 }} />

            </ScrollView>

            {/* Bottom Nav Placeholder - Visual Only */}
            <View style={styles.bottomNav}>
                <TouchableOpacity>
                    <Ionicons name="home" size={24} color="#ff8c2b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/trainers-list-owner")}>
                    <Ionicons name="barbell-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/membership-plans")}>
                    <Ionicons name="disc-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner-profile")}>
                    <Ionicons name="person-outline" size={24} color="#666" />
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
    contentContainer: {
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: "#111",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 20,
    },
    welcomeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    dateText: {
        color: "#aaa",
        fontSize: 12,
    },
    welcomeTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    editBtnText: {
        color: "#ff8c2b",
        fontSize: 12,
        fontWeight: "bold",
    },
    gymProfile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ff8c2b',
        borderRadius: 12,
        padding: 6,
        borderWidth: 2,
        borderColor: '#111', // Match card bg to create a cutout effect
    },
    gymName: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    gymSince: {
        color: "#aaa",
        fontSize: 14,
    },
    manageBtn: {
        backgroundColor: "#221a11",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#332211",
    },
    manageBtnText: {
        color: "#ff8c2b",
        fontSize: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statIconConfig: {
        padding: 8,
        borderRadius: 10,
    },
    statBadge: {
        backgroundColor: '#0f3a1e',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        height: 20,
    },
    statBadgeText: {
        color: '#00cc44',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#111',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
        gap: 10,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        color: '#ff8c2b',
        fontSize: 14,
        fontWeight: 'bold',
    },
    listItem: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 12,
        flexDirection: 'row',
        gap: 12,
    },
    listAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#221a11',
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    memberEmail: {
        color: '#888',
        fontSize: 12,
    },
    statusBadge: {
        backgroundColor: '#0f3a1e',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#00cc44',
        fontSize: 10,
        fontWeight: 'bold',
    },
    premiumBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    premiumText: {
        color: '#ff8c2b',
        fontSize: 10,
    },
    joinDate: {
        color: '#666',
        fontSize: 12,
    },
    eventCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 12,
    },
    eventName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventTypeBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    eventTypeText: {
        color: '#ff8c2b',
        fontSize: 10,
        fontWeight: 'bold',
    },
    eventFooter: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventMetaText: {
        color: '#aaa',
        fontSize: 12,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1a1a1a',
        paddingTop: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
});
