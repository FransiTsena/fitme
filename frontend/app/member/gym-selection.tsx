import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';

import { GymCard } from '@/components/GymCard';
import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

// Platform-aware API URL
const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function GymSelectionScreen() {
    const { user } = useAuth();
    const [gyms, setGyms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch gyms from API
    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/gyms`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const gymData = data.data || data.gyms || [];
                    // Filter only approved gyms
                    const approvedGyms = gymData.filter((gym: any) => gym.verificationStatus === 'approved');
                    setGyms(approvedGyms);
                } else {
                    console.error('Failed to fetch gyms:', response.status, response.statusText);
                    setGyms([]);
                }
            } catch (error) {
                console.error('Error fetching gyms:', error);
                setGyms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGyms();
    }, [user?.token]);

    const handleSelectGym = (gymId: string) => {
        // Navigate to gym plans page to select a membership
        router.push({ pathname: '/member/gym-plans', params: { gymId } });
    };

    const renderGymItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handleSelectGym(item._id)}>
            <GymCard
                name={item.name || "Unknown Gym"}
                rating={item.rating?.average || 0}
                reviews={item.rating?.count || 0}
                distance="N/A"
                price={item.pricing?.perMonth ? `${item.pricing.perMonth} birr` : "N/A"}
            />
        </TouchableOpacity>
    );

    return (
        <ProtectedRoute>
            <View style={{ flex: 1, backgroundColor: '#000' }}>
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

                <View style={styles.container}>
                    <ThemedText type="subtitle" style={styles.title}>Available Gyms</ThemedText>

                    {loading ? (
                        <ThemedText type="default">Loading gyms...</ThemedText>
                    ) : gyms.length > 0 ? (
                        <FlatList
                            data={gyms}
                            renderItem={renderGymItem}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                        />
                    ) : (
                        <ThemedText type="default">No gyms available for subscription</ThemedText>
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
});