import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import useOwnerStore from "@/store/ownerStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

interface Candidate {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    profileImage?: string;
}

export default function InviteTrainerScreen() {
    const { user, token } = useAuth();
    const { gym, fetchGym } = useOwnerStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [searching, setSearching] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (user?.id && token && !gym) {
            fetchGym(user.id, token);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, token, gym]);

    const searchCandidates = useCallback(async () => {
        if (!searchQuery || searchQuery.length < 3) {
            Alert.alert('Info', 'Please enter at least 3 characters to search');
            return;
        }

        setSearching(true);
        setHasSearched(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/trainers/search?q=${encodeURIComponent(searchQuery)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setCandidates(data.candidates || data || []);
            } else {
                Alert.alert('Error', data.error || 'Failed to search');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to search');
        } finally {
            setSearching(false);
        }
    }, [searchQuery, token]);

    const inviteCandidate = async (candidate: Candidate) => {
        if (!gym?._id) {
            Alert.alert('Error', 'No gym found');
            return;
        }

        Alert.alert(
            'Confirm Invitation',
            `Send trainer invitation to ${candidate.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Invite',
                    onPress: async () => {
                        setInviting(candidate._id);

                        try {
                            const response = await fetch(`${API_BASE_URL}/trainers/invite`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    ownerId: user?.id,
                                    gymId: gym._id,
                                    memberId: candidate._id,
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                Alert.alert(
                                    'Success',
                                    `Invitation sent to ${candidate.name}! They will receive an email to accept the invitation.`
                                );
                                // Remove from list
                                setCandidates(candidates.filter(c => c._id !== candidate._id));
                            } else {
                                Alert.alert('Error', data.error || 'Failed to send invitation');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to send invitation');
                        } finally {
                            setInviting(null);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity onPress={() => router.push("/owner/menu")}>
                                <Ionicons name="menu-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Invite Trainer</Text>
                    <Text style={styles.subtitle}>
                        Search for members by name, email, or phone to invite them as trainers at your gym.
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 12 }} />
                    <TextInput
                        placeholder="Search by name, email, or phone..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={searchCandidates}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setCandidates([]); setHasSearched(false); }}>
                            <Ionicons name="close-circle" size={20} color="#666" style={{ marginRight: 12 }} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Button */}
                <TouchableOpacity onPress={searchCandidates} disabled={searching}>
                    <LinearGradient
                        colors={['#ff8c2b', '#ff5500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.searchButton}
                    >
                        {searching ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="search" size={18} color="#fff" />
                                <Text style={styles.searchButtonText}>Search Members</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Results */}
                {hasSearched && !searching && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>
                            {candidates.length > 0 
                                ? `Found ${candidates.length} member${candidates.length > 1 ? 's' : ''}`
                                : 'No members found'
                            }
                        </Text>

                        {candidates.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="person-outline" size={48} color="#333" />
                                <Text style={styles.emptyText}>
                                    No members match your search. Try a different name, email, or phone number.
                                </Text>
                            </View>
                        )}

                        {candidates.map((candidate) => (
                            <View key={candidate._id} style={styles.candidateCard}>
                                <View style={styles.candidateAvatar}>
                                    <Ionicons name="person" size={24} color="#ff8c2b" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.candidateName}>{candidate.name}</Text>
                                    <Text style={styles.candidateEmail}>{candidate.email}</Text>
                                    {candidate.phone && (
                                        <Text style={styles.candidatePhone}>{candidate.phone}</Text>
                                    )}
                                    {candidate.city && (
                                        <View style={styles.locationRow}>
                                            <Ionicons name="location-outline" size={12} color="#666" />
                                            <Text style={styles.candidateCity}>{candidate.city}</Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.inviteButton}
                                    onPress={() => inviteCandidate(candidate)}
                                    disabled={inviting === candidate._id}
                                >
                                    {inviting === candidate._id ? (
                                        <ActivityIndicator size="small" color="#ff8c2b" />
                                    ) : (
                                        <>
                                            <Ionicons name="mail-outline" size={16} color="#ff8c2b" />
                                            <Text style={styles.inviteButtonText}>Invite</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color="#ff8c2b" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.infoTitle}>How it works</Text>
                            <Text style={styles.infoText}>
                                1. Search for existing gym members{'\n'}
                                2. Click Invite to send them an invitation{'\n'}
                                3. They will receive an email with a link{'\n'}
                                4. Once accepted, they become a trainer at your gym
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/owner/owner-home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/trainers-list-owner")}>
                    <Ionicons name="barbell" size={24} color="#ff8c2b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/membership-plans")}>
                    <Ionicons name="disc-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/profile")}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        lineHeight: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 8,
        fontSize: 15,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 24,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    resultsSection: {
        marginBottom: 24,
    },
    resultsTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 20,
    },
    candidateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    candidateAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#221a11',
        justifyContent: 'center',
        alignItems: 'center',
    },
    candidateName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    candidateEmail: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    candidatePhone: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    candidateCity: {
        color: '#666',
        fontSize: 12,
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#221a11',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    inviteButtonText: {
        color: '#ff8c2b',
        fontWeight: '600',
        fontSize: 14,
    },
    infoSection: {
        marginTop: 8,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#ff8c2b',
    },
    infoTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    infoText: {
        color: '#888',
        fontSize: 13,
        lineHeight: 22,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
});
