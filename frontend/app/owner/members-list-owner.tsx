import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function MembersListOwnerScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null,
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
                {/* Header Section */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>All Members (5)</Text>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtn}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addBtnText}>Add</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 8 }} />
                    <TextInput
                        placeholder="Search member..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filterRow}>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.filterChipActive}
                        >
                            <Text style={styles.filterTextActive}>All</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>Inactive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>Premium</Text>
                    </TouchableOpacity>
                </View>

                {/* Slider (Decorative per design) */}
                <View style={styles.sliderContainer}>
                    <LinearGradient
                        colors={['#ff5555', '#ffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sliderKnob} // Using gradient circle as knob/indicator
                    />
                    <View style={styles.sliderTrack} />
                </View>

                {/* List Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Members</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="filter" size={12} color="#ff8c2b" />
                        <Text style={styles.filterLink}>Filter by date</Text>
                    </TouchableOpacity>
                </View>

                {/* Members List */}
                {[
                    { name: "Abebe Bekele", email: "abebe@email.com", status: "Active", plan: "Premium", planColor: "#332211", planText: "#ff8c2b" },
                    { name: "Abebe Bekele", email: "abebe@email.com", status: "Active", plan: "Basic", planColor: "#221a11", planText: "#aa7755" },
                    { name: "Abebe Bekele", email: "abebe@email.com", status: "Inactive", plan: "Premium", planColor: "#332211", planText: "#ff8c2b", statusColor: "#3a0f0f", statusTextCol: "#ff4444" },
                    { name: "Abebe Bekele", email: "abebe@email.com", status: "Active", plan: "Premium", planColor: "#332211", planText: "#ff8c2b" },
                ].map((member, i) => (
                    <View key={i} style={styles.memberCard}>
                        <View style={styles.listAvatar}>
                            <Ionicons name="person" size={24} color="#ff8c2b" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <View style={[styles.statusBadge, member.status === 'Inactive' && { backgroundColor: member.statusColor }]}>
                                    <Text style={[styles.statusText, member.status === 'Inactive' && { color: member.statusTextCol }]}>{member.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                                <View style={[styles.planBadge, { backgroundColor: member.planColor }]}>
                                    <Text style={[styles.planText, { color: member.planText }]}>{member.plan}</Text>
                                </View>
                                <Text style={styles.joinDate}>• Joined Today</Text>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/owner/home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="people" size={24} color="#ff8c2b" />
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
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 14,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    filterChipActive: {
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    filterChip: {
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    filterText: {
        color: '#888',
        fontWeight: '600',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        height: 20,
    },
    sliderTrack: {
        flex: 1,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
    },
    sliderKnob: {
        width: 24,
        height: 12, // Rectangular rounded look from design
        borderRadius: 6,
        marginRight: -12, // Overlap visual trick
        zIndex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    filterLink: {
        color: '#ff8c2b',
        fontSize: 12,
        fontWeight: 'bold',
    },
    memberCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 14,
        // Shadow props
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 8, // for Android
        borderWidth: 1,
        borderColor: '#1a1a1a',
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
        borderRadius: 4,
    },
    statusText: {
        color: '#00cc44',
        fontSize: 10,
        fontWeight: 'bold',
    },
    planBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    planText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    joinDate: {
        color: '#ccc',
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
