import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function GymPlansScreen() {
    const { user, token } = useAuth();
    const { gymId } = useLocalSearchParams<{ gymId: string }>();
    const [gym, setGym] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch gym and its plans from API
    useEffect(() => {
        const fetchGymAndPlans = async () => {
            try {
                // Fetch gym details
                const gymResponse = await fetch(`${API_BASE_URL}/gyms/${gymId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (gymResponse.ok) {
                    const gymData = await gymResponse.json();
                    setGym(gymData.data || gymData.gym || gymData);
                } else {
                    console.error('Failed to fetch gym:', gymResponse.status, gymResponse.statusText);
                }

                // Fetch gym plans
                const plansResponse = await fetch(`${API_BASE_URL}/memberships/gym/${gymId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (plansResponse.ok) {
                    const plansData = await plansResponse.json();
                    setPlans(plansData.plans || []);
                } else {
                    console.error('Failed to fetch plans:', plansResponse.status, plansResponse.statusText);
                    setPlans([]);
                }
            } catch (error) {
                console.error('Error fetching gym or plans:', error);
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        if (gymId) {
            fetchGymAndPlans();
        }
    }, [token, gymId]);

    const handleSubscribe = async (planId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId }),
            });

            if (response.ok) {
                await response.json();
                Alert.alert('Success', 'Successfully subscribed to the gym!', [
                    { text: 'OK', onPress: () => router.push('/member/user-home') }
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to subscribe to gym');
            }
        } catch (error) {
            console.error('Error subscribing to gym:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    const renderPlanItem = ({ item }: { item: any }) => (
        <View style={styles.planCard}>
            <View style={styles.planHeader}>
                <ThemedText type="subtitle">{item.title}</ThemedText>
                <ThemedText type="subtitle">{item.price} birr</ThemedText>
            </View>
            <ThemedText style={styles.planDescription}>{item.description}</ThemedText>
            <ThemedText style={styles.planDuration}>{item.durationInDays} days</ThemedText>
            <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => handleSubscribe(item._id)}
            >
                <ThemedText style={styles.buttonText}>Subscribe</ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <ProtectedRoute>
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        ),
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

                <View style={styles.container}>
                    <ThemedText type="subtitle" style={styles.title}>
                        {gym?.name || 'Gym'} Plans
                    </ThemedText>

                    {loading ? (
                        <ThemedText type="default">Loading plans...</ThemedText>
                    ) : plans.length > 0 ? (
                        <FlatList
                            data={plans}
                            renderItem={renderPlanItem}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                        />
                    ) : (
                        <ThemedText type="default">No plans available for this gym</ThemedText>
                    )}
                </View>

                <UserBottomNav />
            </View>
        </ProtectedRoute>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 20,
    },
    title: {
        marginBottom: 20,
        color: '#fff',
    },
    listContainer: {
        paddingBottom: 20,
    },
    planCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planDescription: {
        color: '#888',
        marginBottom: 8,
    },
    planDuration: {
        color: '#666',
        marginBottom: 12,
    },
    subscribeButton: {
        backgroundColor: '#ff8c2b',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});