import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import useOwnerStore from "@/store/ownerStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

type FilterType = 'all' | 'active' | 'inactive';

export default function TrainersListOwnerScreen() {
    const { user, token } = useAuth();
    const { gym, trainers, trainersLoading, fetchGym, fetchTrainers } = useOwnerStore();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.id && token && !gym) {
            fetchGym(user.id, token);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, token, gym]);

    useEffect(() => {
        if (gym?._id && token) {
            fetchTrainers(gym._id, token, { status: filter === 'all' ? undefined : filter });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token, filter]);

    const handleSearch = useCallback(() => {
        if (gym?._id && token) {
            fetchTrainers(gym._id, token, { status: filter === 'all' ? undefined : filter, search: searchQuery });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token, filter, searchQuery]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (gym?._id && token) {
            await fetchTrainers(gym._id, token, { status: filter === 'all' ? undefined : filter, search: searchQuery });
        }
        setRefreshing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token, filter, searchQuery]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusStyle = (isActive: boolean) => {
        if (isActive) {
            return { bg: '#0f3a1e', text: '#00cc44', label: 'Available' };
        }
        return { bg: '#3a0f0f', text: '#ff4444', label: 'Inactive' };
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
                            <TouchableOpacity onPress={() => router.push("/owner/menu")}>
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

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ff8c2b"
                        colors={['#ff8c2b']}
                    />
                }
            >
                {/* Header Section */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>All Trainers ({trainers.length})</Text>
                    <TouchableOpacity onPress={() => router.push("/owner/invite-trainer")}>
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
                        placeholder="Search trainer..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
                            <Ionicons name="close-circle" size={20} color="#666" style={{ marginRight: 8 }} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                <View style={styles.filterRow}>
                    {(['all', 'active', 'inactive'] as FilterType[]).map((f) => (
                        <TouchableOpacity key={f} onPress={() => setFilter(f)}>
                            {filter === f ? (
                                <LinearGradient
                                    colors={['#ff8c2b', '#ff5500']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.filterChipActive}
                                >
                                    <Text style={styles.filterTextActive}>
                                        {f === 'all' ? 'All' : f === 'active' ? 'Available' : 'Inactive'}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.filterChip}>
                                    <Text style={styles.filterText}>
                                        {f === 'all' ? 'All' : f === 'active' ? 'Available' : 'Inactive'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* List Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trainers</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="filter" size={12} color="#ff8c2b" />
                        <Text style={styles.filterLink}>Filter by rating</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading State */}
                {trainersLoading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff8c2b" />
                    </View>
                )}

                {/* Empty State */}
                {!trainersLoading && trainers.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="barbell-outline" size={64} color="#333" />
                        <Text style={styles.emptyTitle}>No Trainers Found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try a different search term' : 'Invite trainers to join your gym'}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => router.push("/owner/invite-trainer")}
                            style={styles.emptyButton}
                        >
                            <LinearGradient
                                colors={['#ff8c2b', '#ff5500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.emptyButtonGradient}
                            >
                                <Text style={styles.emptyButtonText}>Invite Trainer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Trainers List */}
                {!trainersLoading && trainers.map((trainer) => {
                    const statusStyle = getStatusStyle(trainer.isActive);
                    
                    return (
                        <TouchableOpacity key={trainer._id} style={styles.trainerCard} activeOpacity={0.7}>
                            <View style={styles.listAvatar}>
                                <Ionicons name="person" size={24} color="#ff8c2b" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.trainerName}>{trainer.name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                            {statusStyle.label}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.specialty}>
                                    {trainer.specialization.length > 0 
                                        ? trainer.specialization.slice(0, 2).join(' • ')
                                        : 'No specialization'}
                                </Text>
                                {trainer.bio && (
                                    <Text style={styles.bio} numberOfLines={1}>
                                        {trainer.bio}
                                    </Text>
                                )}

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                                    <View style={styles.premiumBadge}>
                                        <Text style={styles.premiumText}>Trainer</Text>
                                    </View>
                                    <Text style={styles.dotSeparator}>•</Text>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={12} color="#ff8c2b" />
                                        <Text style={styles.ratingText}>
                                            {trainer.rating > 0 ? trainer.rating.toFixed(1) : 'New'}
                                        </Text>
                                    </View>
                                    <Text style={styles.dotSeparator}>•</Text>
                                    <Text style={styles.joinedText}>
                                        Joined {formatDate(trainer.joinedAt)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/owner/home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
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
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 4,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: 15,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    filterChipActive: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
    },
    filterText: {
        color: '#888',
        fontSize: 13,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    filterLink: {
        color: '#ff8c2b',
        fontSize: 12,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    emptyButton: {
        marginTop: 20,
    },
    emptyButtonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    trainerCard: {
        flexDirection: 'row',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    listAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#221a11',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trainerName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    specialty: {
        color: '#ff8c2b',
        fontSize: 13,
        marginTop: 2,
    },
    bio: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    premiumBadge: {
        backgroundColor: '#332211',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    premiumText: {
        color: '#ff8c2b',
        fontSize: 11,
        fontWeight: '600',
    },
    dotSeparator: {
        color: '#444',
        fontSize: 11,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    joinedText: {
        color: '#666',
        fontSize: 11,
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
