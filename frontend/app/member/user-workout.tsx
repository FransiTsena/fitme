
import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function UserWorkoutScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchPlans();
        }
    }, [token]);

    const fetchPlans = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/workout-plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPlans(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                                <View style={styles.badge} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/member/menu")}>
                                <Ionicons name="menu-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Work-Out</Text>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#fff" />
                    <TextInput
                        placeholder="Search plan..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                    />
                </View>

                <TouchableOpacity
                    style={styles.customizeBtnWrapper}
                    onPress={() => router.push("/member/workout-ai-welcome")}
                >
                    <LinearGradient
                        colors={['#ff8c2b', '#ff6b00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.customizeBtn}
                    >
                        <Text style={styles.customizeBtnText}>AI Plan Generator</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.workoutsHeader}>
                    <Text style={styles.sectionTitle}>Your Workout Plans</Text>
                </View>

                <View style={styles.cardsContainer}>
                    {loading ? (
                        <ActivityIndicator color="#ff8c2b" style={{ marginTop: 20 }} />
                    ) : plans.length > 0 ? (
                        plans.map((plan) => (
                            <WorkoutCard
                                key={plan._id}
                                title={plan.name}
                                reps={`${plan.days.length} Days`}
                                sets={plan.description || "Custom Plan"}
                                onPress={() => router.push({ pathname: "/member/workout-plan-detail", params: { id: plan._id } })}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="barbell-outline" size={60} color="#333" />
                            <Text style={styles.emptyText}>You haven't created any plans yet.</Text>
                            <TouchableOpacity onPress={() => router.push("/member/workout-ai-welcome")}>
                                <Text style={styles.linkText}>Get started with AI</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            <UserBottomNav />
        </View>
    );
}

function WorkoutCard({ title, reps, sets, onPress }: { title: string, reps: string, sets: string, onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardDetail}>{reps} • {sets}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ff8c2b" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
    badge: { position: 'absolute', top: 0, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff8c2b' },
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 10, marginBottom: 15 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15 },
    searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16 },
    customizeBtnWrapper: { marginBottom: 30 },
    customizeBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    customizeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    workoutsHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    cardsContainer: { gap: 15 },
    card: { backgroundColor: '#111', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#222' },
    cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    cardDetail: { fontSize: 14, color: '#888' },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#666', fontSize: 16, marginTop: 15 },
    linkText: { color: '#ff8c2b', fontSize: 16, fontWeight: 'bold', marginTop: 10 }
});
