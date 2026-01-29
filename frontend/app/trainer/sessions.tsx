import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    Switch,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import useTrainerStore, { TrainingSession } from "@/store/trainerStore";

export default function SessionsScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const {
        sessions,
        sessionsLoading,
        loading,
        fetchSessions,
        createSession,
        updateSession,
        toggleSessionStatus,
        error,
        clearError
    } = useTrainerStore();

    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: '',
        price: '',
    });

    useEffect(() => {
        if (token) {
            fetchSessions(token);
        }
    }, [token, fetchSessions]);

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
            clearError();
        }
    }, [error, clearError]);

    const onRefresh = async () => {
        if (!token) return;
        setRefreshing(true);
        await fetchSessions(token);
        setRefreshing(false);
    };

    const openCreateModal = () => {
        setEditingSession(null);
        setFormData({
            title: '',
            description: '',
            durationMinutes: '',
            price: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (session: TrainingSession) => {
        setEditingSession(session);
        setFormData({
            title: session.title,
            description: session.description || '',
            durationMinutes: session.durationMinutes.toString(),
            price: session.price.toString(),
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!token) return;

        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a session title');
            return;
        }

        if (!formData.durationMinutes || parseInt(formData.durationMinutes) <= 0) {
            Alert.alert('Error', 'Please enter a valid duration');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        const sessionData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            durationMinutes: parseInt(formData.durationMinutes),
            price: parseFloat(formData.price),
        };

        let result;
        if (editingSession) {
            result = await updateSession(editingSession._id, sessionData, token);
        } else {
            result = await createSession(sessionData, token);
        }

        if (result.success) {
            setModalVisible(false);
            Alert.alert('Success', editingSession ? 'Session updated!' : 'Session created!');
        }
    };

    const handleToggleStatus = async (session: TrainingSession) => {
        if (!token) return;

        Alert.alert(
            session.isActive ? 'Deactivate Session' : 'Activate Session',
            session.isActive
                ? 'This will hide the session from members. Continue?'
                : 'This will make the session available to members. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        const result = await toggleSessionStatus(session._id, !session.isActive, token);
                        if (result.success) {
                            Alert.alert('Success', `Session ${!session.isActive ? 'activated' : 'deactivated'}!`);
                        }
                    }
                }
            ]
        );
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={openCreateModal} style={{ paddingRight: 15 }}>
                            <Ionicons name="add-circle" size={28} color="#ff8c2b" />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Sessions</Text>
                <Text style={styles.headerSubtitle}>Manage your training sessions</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8c2b" />
                }
            >
                {sessionsLoading ? (
                    <ActivityIndicator size="large" color="#ff8c2b" style={{ marginTop: 50 }} />
                ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                        <View key={session._id} style={[styles.sessionCard, !session.isActive && styles.sessionCardInactive]}>
                            <View style={styles.sessionHeader}>
                                <View style={styles.sessionTitleContainer}>
                                    <Text style={styles.sessionTitle}>{session.title}</Text>
                                    <View style={[styles.statusBadge, session.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                                        <Text style={styles.statusText}>{session.isActive ? 'Active' : 'Inactive'}</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={session.isActive}
                                    onValueChange={() => handleToggleStatus(session)}
                                    trackColor={{ false: '#333', true: '#ff8c2b40' }}
                                    thumbColor={session.isActive ? '#ff8c2b' : '#666'}
                                />
                            </View>

                            {session.description && (
                                <Text style={styles.sessionDescription}>{session.description}</Text>
                            )}

                            <View style={styles.sessionDetails}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="time-outline" size={18} color="#888" />
                                    <Text style={styles.detailText}>{formatDuration(session.durationMinutes)}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="cash-outline" size={18} color="#888" />
                                    <Text style={styles.detailText}>ETB {session.price.toLocaleString()}</Text>
                                </View>
                            </View>

                            <View style={styles.sessionActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => openEditModal(session)}
                                >
                                    <Ionicons name="pencil" size={16} color="#fff" />
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="fitness-outline" size={64} color="#333" />
                        <Text style={styles.emptyTitle}>No Sessions Yet</Text>
                        <Text style={styles.emptySubtext}>Create your first training session to start accepting bookings</Text>
                        <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
                            <Ionicons name="add" size={20} color="#000" />
                            <Text style={styles.createButtonText}>Create Session</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Create/Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingSession ? 'Edit Session' : 'Create Session'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Session Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                    placeholder="e.g., Personal Training, HIIT Workout"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Describe what the session includes..."
                                    placeholderTextColor="#666"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.inputLabel}>Duration (minutes) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.durationMinutes}
                                        onChangeText={(text) => setFormData({ ...formData, durationMinutes: text })}
                                        placeholder="60"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Price (ETB) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.price}
                                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                                        placeholder="500"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelModalButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {editingSession ? 'Update' : 'Create'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/trainer-home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/clients" as any)}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Clients</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="fitness" size={24} color="#ff8c2b" />
                    <Text style={[styles.navText, styles.navTextActive]}>Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/schedule" as any)}>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/profile")}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 100,
    },
    sessionCard: {
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#222",
    },
    sessionCardInactive: {
        opacity: 0.6,
    },
    sessionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    sessionTitleContainer: {
        flex: 1,
        marginRight: 10,
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    activeBadge: {
        backgroundColor: "#00cc4430",
    },
    inactiveBadge: {
        backgroundColor: "#ff444430",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    sessionDescription: {
        fontSize: 14,
        color: "#888",
        marginBottom: 15,
        lineHeight: 20,
    },
    sessionDetails: {
        flexDirection: "row",
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 24,
    },
    detailText: {
        fontSize: 14,
        color: "#ccc",
        marginLeft: 6,
    },
    sessionActions: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#222",
        paddingTop: 15,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 6,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#666",
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#444",
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff8c2b",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
    },
    createButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#111",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "85%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    modalContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: "#888",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#080808",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 12,
        padding: 14,
        color: "#fff",
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    rowInputs: {
        flexDirection: "row",
    },
    modalFooter: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    cancelModalButton: {
        flex: 1,
        backgroundColor: "#333",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelModalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#ff8c2b",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: "center",
    },
    navText: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    navTextActive: {
        color: "#ff8c2b",
    },
});
