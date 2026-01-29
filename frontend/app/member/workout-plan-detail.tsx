import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { UserBottomNav } from '@/components/UserBottomNav';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function WorkoutPlanDetailScreen() {
    const router = useRouter(); const { id } = useLocalSearchParams();
    const { token } = useAuth();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlan();
    }, [id, token]);

    const fetchPlan = async () => {
        if (!token || !id) return;
        try {
            // We don't have a direct getPlanById yet, but we can filter my plans or add it.
            // For now, let's fetch all and find (or add the endpoint if needed).
            // Actually, I'll add the endpoint in the backend next tool call.
            const response = await fetch(`${API_BASE_URL}/workout-plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const found = data.data.find((p: any) => p._id === id);
                setPlan(found);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator color="#ff8c2b" /></View>;
    if (!plan) return <View style={[styles.container, styles.centered]}><ThemedText>Plan not found</ThemedText></View>;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{
                headerTitle: () => <Logo size={24} />,
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#fff',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="subtitle" style={styles.title}>{plan.name}</ThemedText>
                    <ThemedText style={styles.description}>{plan.description}</ThemedText>
                </View>

                {plan.days.sort((a: any, b: any) => a.dayNumber - b.dayNumber).map((day: any) => (
                    <TouchableOpacity
                        key={day.dayNumber}
                        style={styles.dayCard}
                        onPress={() => router.push({ pathname: '/member/day-plan-customization', params: { planId: plan._id, dayNumber: day.dayNumber } })}
                    >
                        <View style={styles.dayHeader}>
                            <ThemedText style={styles.dayLabel}>DAY {day.dayNumber}</ThemedText>
                            <ThemedText style={styles.dayTitle}>{day.title || 'Workout Day'}</ThemedText>
                            <Ionicons name="chevron-forward" size={20} color="#ff8c2b" />
                        </View>
                        <ThemedText style={styles.exerciseCount}>{day.exercises.length} Exercises</ThemedText>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.addDayBtn}>
                    <Ionicons name="add-circle-outline" size={24} color="#ff8c2b" />
                    <ThemedText style={styles.addDayText}>Add Another Day</ThemedText>
                </TouchableOpacity>
            </ScrollView>

            <UserBottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    header: { marginBottom: 30 },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    description: { color: '#888', marginTop: 5 },
    dayCard: {
        backgroundColor: '#111',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333'
    },
    dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dayLabel: { color: '#ff8c2b', fontWeight: 'bold', fontSize: 12 },
    dayTitle: { color: '#fff', fontSize: 18, flex: 1, marginLeft: 10 },
    exerciseCount: { color: '#666', marginTop: 10, fontSize: 14 },
    addDayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 15,
        gap: 10
    },
    addDayText: { color: '#ff8c2b' }
});
