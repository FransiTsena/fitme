import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function WorkoutAIGenerationScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [goal, setGoal] = useState('Muscle Gain');
    const [level, setLevel] = useState('Beginner');
    const [daysPerWeek, setDaysPerWeek] = useState(3);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/workout-plans/auto-generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ goal, level, daysPerWeek }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "Your personalized plan has been generated!");
                router.replace('/member/user-workout');
            } else {
                throw new Error(data.error || "Failed to generate");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: () => <Logo size={24} />,
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#fff'
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedText type="subtitle" style={styles.title}>Customize Your AI Plan</ThemedText>

                <View style={styles.section}>
                    <ThemedText style={styles.label}>What is your goal?</ThemedText>
                    <View style={styles.chipContainer}>
                        {['Muscle Gain', 'Weight Loss', 'Endurance', 'General Fitness'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.chip, goal === g && styles.activeChip]}
                                onPress={() => setGoal(g)}
                            >
                                <ThemedText style={[styles.chipText, goal === g && styles.activeChipText]}>{g}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.label}>What is your experience level?</ThemedText>
                    <View style={styles.chipContainer}>
                        {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                            <TouchableOpacity
                                key={l}
                                style={[styles.chip, level === l && styles.activeChip]}
                                onPress={() => setLevel(l)}
                            >
                                <ThemedText style={[styles.chipText, level === l && styles.activeChipText]}>{l}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.label}>How many days per week?</ThemedText>
                    <View style={styles.chipContainer}>
                        {[2, 3, 4, 5, 6].map((d) => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.chip, daysPerWeek === d && styles.activeChip]}
                                onPress={() => setDaysPerWeek(d)}
                            >
                                <ThemedText style={[styles.chipText, daysPerWeek === d && styles.activeChipText]}>{d} Days</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.generateBtn}
                    onPress={handleGenerate}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#ff8c2b', '#ff6b00']}
                        style={styles.gradient}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <View style={styles.btnContent}>
                                <ThemedText style={styles.btnText}>Generate Plan</ThemedText>
                                <Ionicons name="flash" size={20} color="#fff" />
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { padding: 20 },
    title: { color: '#fff', fontSize: 24, marginBottom: 30, fontWeight: 'bold' },
    section: { marginBottom: 25 },
    label: { color: '#aaa', marginBottom: 15, fontSize: 16 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#111'
    },
    activeChip: { borderColor: '#ff8c2b', backgroundColor: '#ff8c2b22' },
    chipText: { color: '#fff' },
    activeChipText: { color: '#ff8c2b', fontWeight: 'bold' },
    generateBtn: { marginTop: 20 },
    gradient: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
