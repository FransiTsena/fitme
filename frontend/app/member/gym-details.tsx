import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions
} from "react-native";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get('window');

export default function GymDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [gym, setGym] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGym = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/gyms/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setGym(data.gym || data);
                } else {
                    console.error('Failed to fetch gym:', response.status, response.statusText);
                    Alert.alert('Error', 'Failed to load gym details');
                }
            } catch (error) {
                console.error('Error fetching gym:', error);
                Alert.alert('Error', 'Failed to load gym details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGym();
        }
    }, [id, user?.token]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerStyle: { backgroundColor: "#000" },
                        headerTintColor: "#fff",
                        headerTitleAlign: "left",
                        headerShadowVisible: false,
                    }}
                />
                <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={24} color="#ff8c2b" />
                    <Text style={styles.loadingText}>Loading gym details...</Text>
                </View>
            </View>
        );
    }

    if (!gym) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        headerTitle: () => <Logo size={24} />,
                        headerStyle: { backgroundColor: "#000" },
                        headerTintColor: "#fff",
                        headerTitleAlign: "left",
                        headerShadowVisible: false,
                    }}
                />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Gym not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "left",
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Gym Cover Image */}
                <View style={styles.imageContainer}>
                    {gym.photos && gym.photos.length > 0 ? (
                        <Image source={{ uri: gym.photos[0] }} style={styles.coverImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={40} color="#666" />
                        </View>
                    )}
                    <View style={styles.imageOverlay}>
                        <Text style={styles.gymName}>{gym.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#ff8c2b" />
                            <Text style={styles.ratingText}>
                                {gym.rating?.average ? gym.rating.average.toFixed(1) : 'N/A'} 
                                {' '}({gym.rating?.count || 0})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Gym Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color="#ff8c2b" />
                        <Text style={styles.infoText}>
                            {(gym.address?.street || gym.address?.address) || 'N/A'}, {gym.address?.area || 'N/A'}, {gym.address?.city || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color="#ff8c2b" />
                        <Text style={styles.infoText}>{gym.phone || gym.contactNumber || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#ff8c2b" />
                        <Text style={styles.infoText}>Open now</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.descriptionText}>
                        {gym.description || 'No description available.'}
                    </Text>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesContainer}>
                        {(gym.amenities || gym.amenityList || []).map((amenity: string, index: number) => (
                            <View key={index} style={styles.amenityTag}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        )) || <Text style={styles.noAmenitiesText}>No amenities listed</Text>}
                    </View>
                </View>

                {/* Operating Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Operating Hours</Text>
                    {gym.operatingHours && Object.entries(gym.operatingHours).length > 0 ? (
                        Object.entries(gym.operatingHours).map(([day, hours]: [string, any]) => (
                            <View key={day} style={styles.hourRow}>
                                <Text style={styles.hourDay}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                                <Text style={styles.hourTime}>{hours?.open || 'Closed'} - {hours?.close || 'Closed'}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noHoursText}>Hours not available</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="navigate-outline" size={20} color="#000" />
                        <Text style={styles.actionButtonText}>Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call-outline" size={20} color="#000" />
                        <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="book-outline" size={20} color="#000" />
                        <Text style={styles.actionButtonText}>Book Session</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#ff8c2b',
        fontSize: 16,
        marginTop: 10,
    },
    imageContainer: {
        position: 'relative',
        height: 250,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
    },
    gymName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    ratingText: {
        color: '#fff',
        fontSize: 16,
    },
    infoContainer: {
        backgroundColor: '#111',
        padding: 20,
        gap: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        color: '#fff',
        fontSize: 16,
    },
    section: {
        backgroundColor: '#111',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    descriptionText: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 20,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityTag: {
        backgroundColor: '#333',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    amenityText: {
        color: '#fff',
        fontSize: 12,
    },
    noAmenitiesText: {
        color: '#888',
        fontStyle: 'italic',
    },
    noHoursText: {
        color: '#888',
        fontStyle: 'italic',
        paddingVertical: 10,
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    hourDay: {
        color: '#fff',
        fontSize: 14,
    },
    hourTime: {
        color: '#aaa',
        fontSize: 14,
    },
    actionContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 15,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#ff8c2b',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
});