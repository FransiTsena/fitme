import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function MembershipPlansScreen() {
    const [plans, setPlans] = useState([
        {
            id: 1,
            name: "Basic",
            price: "1,800 ETB/mon",
            members: 180,
            features: ["Gym Access", "Locker", "Shower"]
        },
        {
            id: 2,
            name: "Premium",
            price: "2,800 ETB/mon",
            members: 80,
            features: ["Gym Access", "Locker", "Sauna", "Classes"]
        },
        {
            id: 3,
            name: "VIP",
            price: "3,800 ETB/mon",
            members: 60,
            features: ["All Premium", "Personal Trainer", "Nutrition"]
        }
    ]);

    const handleLongPress = (id: number, name: string) => {
        Alert.alert(
            "Remove Plan",
            `Are you sure you want to remove the ${name} plan?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        setPlans(prev => prev.filter(plan => plan.id !== id));
                    }
                }
            ]
        );
    };

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

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
                {/* Header Section */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Membership Plans ({plans.length})</Text>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.createBtn}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.createBtnText}>Create</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Plans List */}
                {plans.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={styles.planCard}
                        onLongPress={() => handleLongPress(plan.id, plan.name)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <View style={styles.memberBadge}>
                                <Text style={styles.memberCount}>{plan.members} Members</Text>
                            </View>
                        </View>

                        <Text style={styles.priceText}>{plan.price}</Text>

                        <View style={styles.featuresRow}>
                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.featureChip}>
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/member/user-home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/member/user-workout")}>
                    <Ionicons name="barbell-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="disc" size={24} color="#ff8c2b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/explore")}>
                    <Ionicons name="compass-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/member/profile")}>
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
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    planCard: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    memberCount: {
        color: '#ff8c2b',
        fontSize: 12,
    },
    priceText: {
        color: '#ff8c2b',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    featureChip: {
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    featureText: {
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
