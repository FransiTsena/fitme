import { Logo } from "@/components/Logo";
import { UserBottomNav } from "@/components/UserBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function UserProfileScreen() {
    const [activeTab, setActiveTab] = useState("Profile");

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

            <View style={styles.tabsContainer}>
                {["Profile", "Stats", "Settings"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.profileHeaderCard}>
                    <View style={styles.centerContent}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle-outline" size={80} color="#ff8c2b" />
                            <TouchableOpacity style={styles.cameraBtn}>
                                <Ionicons name="camera" size={10} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>Abebe Bekele</Text>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumText}>Premium Member</Text>
                        </View>
                        <Text style={styles.memberSince}>Member since January 2024</Text>
                    </View>
                </View>

                {/* Personal Information */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal information</Text>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil" size={12} color="#ff8c2b" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color="#ff8c2b" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.label}>Full Name</Text>
                            <Text style={styles.value}>Abebe Bekele</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={18} color="#ff8c2b" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>abebe.bekele@email.com</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={18} color="#ff8c2b" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.label}>Phone</Text>
                            <Text style={styles.value}>+251 911 234 567</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color="#ff8c2b" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.label}>Address</Text>
                            <Text style={styles.value}>Bole, Addis Abeba</Text>
                        </View>
                    </View>
                </View>

                {/* Fitness Information */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Fitness Information</Text>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil" size={12} color="#ff8c2b" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.fitnessRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Height</Text>
                            <Text style={styles.value}>175 cm</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Weight</Text>
                            <Text style={styles.value}>72 kg</Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 16 }}>
                        <Text style={styles.label}>Goal</Text>
                        <Text style={styles.value}>Build Muscle</Text>
                    </View>
                </View>

                {/* Membership History */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Membership History</Text>

                    {/* Current Membership */}
                    <View style={styles.membershipCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <View style={styles.planBadge}>
                                <Text style={styles.planText}>Premium</Text>
                            </View>
                            <Text style={styles.priceText}>2.500 ETB/mo</Text>
                        </View>
                        <Text style={styles.gymName}>Bole Fitness Center</Text>
                        <Text style={styles.dateText}>Jan 2024 - Present</Text>
                    </View>

                    {/* Past Membership */}
                    <View style={styles.membershipCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <View style={[styles.planBadge, { backgroundColor: '#332211' }]}>
                                <Text style={styles.planText}>Basic</Text>
                            </View>
                            <Text style={styles.priceText}>1.800 ETB/mo</Text>
                        </View>
                        <Text style={styles.gymName}>Kazanchis Elite Gym</Text>
                        <Text style={styles.dateText}>Sep 2023 - Dec 2023</Text>
                    </View>

                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <UserBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        gap: 20,
    },
    tabBtn: {
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#ff8c2b',
    },
    tabText: {
        color: '#888',
        fontSize: 14,
        fontWeight: 'bold',
    },
    tabTextActive: {
        color: '#ff8c2b',
    },
    contentContainer: {
        padding: 20,
    },
    profileHeaderCard: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    centerContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#ff8c2b',
        borderRadius: 12,
        padding: 4,
        borderWidth: 2,
        borderColor: '#111',
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    premiumBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 6,
    },
    premiumText: {
        color: '#ff8c2b',
        fontSize: 12,
        fontWeight: 'bold',
    },
    memberSince: {
        color: '#888',
        fontSize: 12,
    },
    sectionContainer: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#eee',
        fontSize: 18,
        fontWeight: '500',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editBtnText: {
        color: '#ff8c2b',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },
    infoIcon: {
        width: 20,
        marginTop: 2,
    },
    label: {
        color: '#666',
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    fitnessRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    membershipCard: {
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    planBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    planText: {
        color: '#ff8c2b',
        fontSize: 12,
        fontWeight: 'bold',
    },
    priceText: {
        color: '#ff8c2b',
        fontSize: 14,
    },
    gymName: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    dateText: {
        color: '#888',
        fontSize: 12,
    },
});
