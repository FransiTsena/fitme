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

type FilterType = 'all' | 'active' | 'expired' | 'cancelled';

export default function MembersListOwnerScreen() {
    const { user, token } = useAuth();
    const { gym, members, membersLoading, fetchGym, fetchMembers } = useOwnerStore();
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
            fetchMembers(gym._id, token, { status: filter === 'all' ? undefined : filter });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token, filter]);

    const handleSearch = useCallback(() => {
        if (gym?._id && token) {
            fetchMembers(gym._id, token, { status: filter === 'all' ? undefined : filter, search: searchQuery });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token, filter, searchQuery]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (gym?._id && token) {
            await fetchMembers(gym._id, token, { status: filter === 'all' ? undefined : filter, search: searchQuery });
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return { bg: '#0f3a1e', text: '#00cc44' };
            case 'expired':
                return { bg: '#3a3a0f', text: '#cccc00' };
            case 'cancelled':
                return { bg: '#3a0f0f', text: '#ff4444' };
            default:
                return { bg: '#222', text: '#888' };
        }
    };

    const getPlanStyle = (plan: string) => {
        const lowerPlan = plan.toLowerCase();
        if (lowerPlan.includes('premium') || lowerPlan.includes('vip')) {
            return { bg: '#332211', text: '#ff8c2b' };
        }
        return { bg: '#221a11', text: '#aa7755' };
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
                    <Text style={styles.pageTitle}>All Members ({members.length})</Text>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtn}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addBtnText}>Add</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 8 }} />
                    <TextInput
                        placeholder="Search member..."
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
                    {(['all', 'active', 'expired', 'cancelled'] as FilterType[]).map((f) => (
                        <TouchableOpacity key={f} onPress={() => setFilter(f)}>
                            {filter === f ? (
                                <LinearGradient
                                    colors={['#ff8c2b', '#ff5500']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.filterChipActive}
                                >
                                    <Text style={styles.filterTextActive}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.filterChip}>
                                    <Text style={styles.filterText}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* List Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Members</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="filter" size={12} color="#ff8c2b" />
                        <Text style={styles.filterLink}>Filter by date</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading State */}
                {membersLoading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff8c2b" />
                    </View>
                )}

                {/* Empty State */}
                {!membersLoading && members.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#333" />
                        <Text style={styles.emptyTitle}>No Members Found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try a different search term' : 'Members who purchase memberships will appear here'}
                        </Text>
                    </View>
                )}

                {/* Members List */}
                {!membersLoading && members.map((member) => {
                    const statusStyle = getStatusStyle(member.status);
                    const planStyle = getPlanStyle(member.plan);
                    
                    return (
                        <TouchableOpacity key={member._id} style={styles.memberCard} activeOpacity={0.7}>
                            <View style={styles.listAvatar}>
                                <Ionicons name="person" size={24} color="#ff8c2b" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.memberEmail}>{member.email}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                                    <View style={[styles.planBadge, { backgroundColor: planStyle.bg }]}>
                                        <Text style={[styles.planText, { color: planStyle.text }]}>{member.plan}</Text>
                                    </View>
                                    <Text style={styles.joinDate}>• Joined {formatDate(member.joinedAt)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/owner/owner-home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="people" size={24} color="#ff8c2b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/trainers-list-owner")}>
                    <Ionicons name="barbell-outline" size={24} color="#666" />
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
    memberCard: {
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
    memberName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    memberEmail: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#0f3a1e',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statusText: {
        color: '#00cc44',
        fontSize: 11,
        fontWeight: '600',
    },
    planBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    planText: {
        fontSize: 11,
        fontWeight: '600',
    },
    joinDate: {
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
