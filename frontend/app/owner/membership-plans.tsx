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
    Modal,
    Platform,
    RefreshControl,
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

interface MembershipPlan {
    _id: string;
    gymId: string;
    title: string;
    description?: string;
    durationInDays: number;
    price: number;
    isActive: boolean;
    createdAt: string;
}

export default function MembershipPlansScreen() {
    const { user, token } = useAuth();
    const { gym, fetchGym } = useOwnerStore();
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationInDays: '',
        price: '',
    });

    useEffect(() => {
        if (user?.id && token && !gym) {
            fetchGym(user.id, token);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, token, gym]);

    useEffect(() => {
        if (gym?._id && token) {
            fetchPlans();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token]);

    const fetchPlans = async () => {
        if (!gym?._id) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/membership/gym/${gym._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setPlans(data.plans || []);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPlans();
        setRefreshing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gym?._id, token]);

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            title: '',
            description: '',
            durationInDays: '',
            price: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (plan: MembershipPlan) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title,
            description: plan.description || '',
            durationInDays: plan.durationInDays.toString(),
            price: plan.price.toString(),
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.durationInDays || !formData.price) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            const url = editingPlan
                ? `${API_BASE_URL}/membership/${editingPlan._id}`
                : `${API_BASE_URL}/membership`;

            const body = editingPlan
                ? {
                    title: formData.title,
                    description: formData.description,
                    durationInDays: parseInt(formData.durationInDays),
                    price: parseInt(formData.price),
                }
                : {
                    gymId: gym?._id,
                    ownerId: user?.id,
                    title: formData.title,
                    description: formData.description,
                    durationInDays: parseInt(formData.durationInDays),
                    price: parseInt(formData.price),
                };

            const response = await fetch(url, {
                method: editingPlan ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setModalVisible(false);
                fetchPlans();
                Alert.alert('Success', editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
            } else {
                Alert.alert('Error', data.error || 'Failed to save plan');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    const togglePlanStatus = async (plan: MembershipPlan) => {
        try {
            const response = await fetch(`${API_BASE_URL}/membership/${plan._id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !plan.isActive }),
            });

            if (response.ok) {
                fetchPlans();
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to update plan status');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update plan status');
        }
    };

    const getDurationLabel = (days: number) => {
        if (days === 1) return '1 Day';
        if (days === 7) return '1 Week';
        if (days === 30 || days === 31) return '1 Month';
        if (days === 90) return '3 Months';
        if (days === 180) return '6 Months';
        if (days === 365) return '1 Year';
        return `${days} Days`;
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
                    <Text style={styles.pageTitle}>Membership Plans</Text>
                    <TouchableOpacity onPress={openCreateModal}>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtn}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addBtnText}>Add Plan</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Info Text */}
                <Text style={styles.infoText}>
                    Create membership plans for your gym. Members can purchase these plans to get access to your gym.
                </Text>

                {/* Loading State */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff8c2b" />
                    </View>
                )}

                {/* Empty State */}
                {!loading && plans.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="pricetag-outline" size={64} color="#333" />
                        <Text style={styles.emptyTitle}>No Plans Yet</Text>
                        <Text style={styles.emptyText}>
                            Create your first membership plan to start accepting members
                        </Text>
                        <TouchableOpacity onPress={openCreateModal} style={styles.emptyButton}>
                            <LinearGradient
                                colors={['#ff8c2b', '#ff5500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.emptyButtonGradient}
                            >
                                <Text style={styles.emptyButtonText}>Create Plan</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Plans List */}
                {!loading && plans.map((plan) => (
                    <View key={plan._id} style={styles.planCard}>
                        <View style={styles.planHeader}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    <View style={[
                                        styles.statusBadge, 
                                        { backgroundColor: plan.isActive ? '#0f3a1e' : '#3a0f0f' }
                                    ]}>
                                        <Text style={[
                                            styles.statusText, 
                                            { color: plan.isActive ? '#00cc44' : '#ff4444' }
                                        ]}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.planDuration}>{getDurationLabel(plan.durationInDays)}</Text>
                            </View>
                            <Text style={styles.planPrice}>{plan.price} ETB</Text>
                        </View>
                        
                        {plan.description && (
                            <Text style={styles.planDescription}>{plan.description}</Text>
                        )}

                        <View style={styles.planActions}>
                            <TouchableOpacity 
                                style={styles.editButton}
                                onPress={() => openEditModal(plan)}
                            >
                                <Ionicons name="pencil" size={16} color="#ff8c2b" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.toggleButton,
                                    { backgroundColor: plan.isActive ? '#3a0f0f' : '#0f3a1e' }
                                ]}
                                onPress={() => togglePlanStatus(plan)}
                            >
                                <Ionicons 
                                    name={plan.isActive ? "pause" : "play"} 
                                    size={16} 
                                    color={plan.isActive ? "#ff4444" : "#00cc44"} 
                                />
                                <Text style={[
                                    styles.toggleButtonText,
                                    { color: plan.isActive ? '#ff4444' : '#00cc44' }
                                ]}>
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Create/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingPlan ? 'Edit Plan' : 'Create Plan'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Plan Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                placeholder="e.g., Basic Monthly"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Describe what this plan includes..."
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                            />

                            <Text style={styles.inputLabel}>Duration (Days) *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.durationInDays}
                                onChangeText={(text) => setFormData({ ...formData, durationInDays: text })}
                                placeholder="e.g., 30"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                            />

                            <View style={styles.durationPresets}>
                                {[
                                    { label: '1 Week', days: '7' },
                                    { label: '1 Month', days: '30' },
                                    { label: '3 Months', days: '90' },
                                    { label: '1 Year', days: '365' },
                                ].map((preset) => (
                                    <TouchableOpacity
                                        key={preset.days}
                                        style={[
                                            styles.presetChip,
                                            formData.durationInDays === preset.days && styles.presetChipActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, durationInDays: preset.days })}
                                    >
                                        <Text style={[
                                            styles.presetChipText,
                                            formData.durationInDays === preset.days && styles.presetChipTextActive
                                        ]}>
                                            {preset.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Price (ETB) *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                placeholder="e.g., 500"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} disabled={saving}>
                                <LinearGradient
                                    colors={['#ff8c2b', '#ff5500']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.saveButton}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingPlan ? 'Update' : 'Create'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/owner/home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner/trainers-list-owner")}>
                    <Ionicons name="barbell-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="disc" size={24} color="#ff8c2b" />
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
        marginBottom: 12,
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
    infoText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    loadingContainer: {
        paddingVertical: 60,
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
    planCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    planTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    planDuration: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    planPrice: {
        color: '#ff8c2b',
        fontSize: 20,
        fontWeight: 'bold',
    },
    planDescription: {
        color: '#888',
        fontSize: 13,
        marginTop: 12,
        lineHeight: 18,
    },
    statusBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    planActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#221a11',
        paddingVertical: 10,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#ff8c2b',
        fontWeight: '600',
        fontSize: 14,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
    },
    toggleButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    modalBody: {
        padding: 20,
    },
    inputLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 14,
        color: '#fff',
        fontSize: 15,
        marginBottom: 16,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    durationPresets: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
        marginTop: -8,
    },
    presetChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#1a1a1a',
    },
    presetChipActive: {
        backgroundColor: '#ff8c2b',
    },
    presetChipText: {
        color: '#888',
        fontSize: 12,
    },
    presetChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
    },
    cancelButtonText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 15,
    },
    saveButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        minWidth: 120,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
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
