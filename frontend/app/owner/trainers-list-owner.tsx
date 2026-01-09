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

export default function TrainersListOwnerScreen() {
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
                    <Text style={styles.pageTitle}>All Trainers (5)</Text>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtn}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addBtnText}>Hire</Text>
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
                        <Text style={styles.filterText}>Available</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>Busy</Text>
                    </TouchableOpacity>
                </View>

                {/* List Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Trainers</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="filter" size={12} color="#ff8c2b" />
                        <Text style={styles.filterLink}>Filter by date</Text>
                    </TouchableOpacity>
                </View>

                {/* Trainers List */}
                {[
                    { name: "Mesenbet Tadesse", specialty: "Yoga & Pilates", clients: 45, rating: 4.9, status: "Available", statusColor: "#0f3a1e", statusText: "#00cc44" },
                    { name: "Mesenbet Tadesse", specialty: "Yoga & Pilates", clients: 45, rating: 4.9, status: "Available", statusColor: "#0f3a1e", statusText: "#00cc44" },
                    { name: "Mesenbet Tadesse", specialty: "Yoga & Pilates", clients: 45, rating: 4.9, status: "Busy", statusColor: "#3a0f0f", statusText: "#ff4444" },
                    { name: "Mesenbet Tadesse", specialty: "Yoga & Pilates", clients: 45, rating: 4.9, status: "Available", statusColor: "#0f3a1e", statusText: "#00cc44" },
                ].map((trainer, i) => (
                    <View key={i} style={styles.trainerCard}>
                        <View style={styles.listAvatar}>
                            <Ionicons name="person" size={24} color="#ff8c2b" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.trainerName}>{trainer.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: trainer.statusColor }]}>
                                    <Text style={[styles.statusText, { color: trainer.statusText }]}>{trainer.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.specialty}>{trainer.specialty}</Text>
                            <Text style={styles.clientsCount}>{trainer.clients} clients</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                                <View style={styles.premiumBadge}>
                                    <Text style={styles.premiumText}>Premium</Text>
                                </View>
                                <Text style={styles.dotSeparator}>•</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={12} color="#ff8c2b" />
                                    <Text style={styles.ratingText}>{trainer.rating}</Text>
                                </View>
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
                <TouchableOpacity onPress={() => router.push("/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/trainers-list-owner")}>
                    <Ionicons name="barbell" size={24} color="#ff8c2b" />
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
    trainerCard: {
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
        elevation: 8,
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
    trainerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    specialty: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 2,
    },
    clientsCount: {
        color: '#888',
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    premiumBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    premiumText: {
        color: '#ff8c2b',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dotSeparator: {
        color: '#fff',
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
