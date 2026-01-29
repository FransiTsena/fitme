import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import useTrainerStore from "@/store/trainerStore";

const SPECIALIZATIONS = [
    "Weight Training",
    "Cardio",
    "HIIT",
    "Yoga",
    "Pilates",
    "CrossFit",
    "Boxing",
    "Martial Arts",
    "Nutrition",
    "Personal Training",
];

export default function TrainerProfileScreen() {
    const { user, token, logout } = useAuth();
    const { profile, loading, fetchTrainerProfile, updateProfile } = useTrainerStore();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        specialization: [] as string[],
        bio: '',
    });

    useEffect(() => {
        if (user?.id && token && !profile) {
            fetchTrainerProfile(user.id, token);
        }
    }, [user?.id, token, profile, fetchTrainerProfile]);

    useEffect(() => {
        if (profile) {
            setFormData({
                specialization: profile.specialization || [],
                bio: profile.bio || '',
            });
        }
    }, [profile]);

    const toggleSpecialization = (spec: string) => {
        if (formData.specialization.includes(spec)) {
            setFormData({
                ...formData,
                specialization: formData.specialization.filter(s => s !== spec)
            });
        } else {
            if (formData.specialization.length >= 5) {
                Alert.alert("Limit Reached", "You can select up to 5 specializations");
                return;
            }
            setFormData({
                ...formData,
                specialization: [...formData.specialization, spec]
            });
        }
    };

    const handleSave = async () => {
        if (!token) return;

        if (formData.specialization.length === 0) {
            Alert.alert('Error', 'Please select at least one specialization');
            return;
        }

        if (!formData.bio.trim() || formData.bio.trim().length < 20) {
            Alert.alert('Error', 'Please write a bio (at least 20 characters)');
            return;
        }

        setSaving(true);
        const result = await updateProfile({
            specialization: formData.specialization,
            bio: formData.bio.trim(),
        }, token);
        setSaving(false);

        if (result.success) {
            Alert.alert('Success', 'Profile updated successfully!');
            setIsEditing(false);
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        router.replace("/login");
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        // Reset form to current profile data
        if (profile) {
            setFormData({
                specialization: profile.specialization || [],
                bio: profile.bio || '',
            });
        }
        setIsEditing(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null,
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/trainer/menu")}>
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

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
                {/* Profile Header */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle-outline" size={100} color="#ff8c2b" />
                        <TouchableOpacity style={styles.cameraBtn}>
                            <Ionicons name="camera" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileName}>{user?.name || 'Trainer Name'}</Text>
                    <Text style={styles.trainerBadge}>Fitness Trainer</Text>

                    {/* Gym Info */}
                    {profile?.gymId && (
                        <View style={styles.gymInfo}>
                            <Ionicons name="location" size={16} color="#888" />
                            <Text style={styles.gymName}>
                                {typeof profile.gymId === 'object' ? profile.gymId.name : 'Your Gym'}
                            </Text>
                        </View>
                    )}

                    {/* Rating */}
                    {profile?.rating && (
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={18} color="#ffd700" />
                            <Text style={styles.ratingText}>
                                {profile.rating.average?.toFixed(1) || '0.0'} ({profile.rating.count || 0} reviews)
                            </Text>
                        </View>
                    )}
                </View>

                {/* User Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color="#888" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color="#888" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Trainer Profile Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Trainer Profile</Text>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Ionicons name="pencil" size={20} color="#ff8c2b" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#ff8c2b" style={{ marginTop: 20 }} />
                    ) : isEditing ? (
                        <>
                            {/* Specializations Edit */}
                            <Text style={styles.label}>Specializations</Text>
                            <Text style={styles.helperText}>Select up to 5 areas you specialize in</Text>
                            <View style={styles.specsGrid}>
                                {SPECIALIZATIONS.map((spec) => (
                                    <TouchableOpacity
                                        key={spec}
                                        style={[
                                            styles.specChip,
                                            formData.specialization.includes(spec) && styles.specChipSelected
                                        ]}
                                        onPress={() => toggleSpecialization(spec)}
                                    >
                                        <Text style={[
                                            styles.specChipText,
                                            formData.specialization.includes(spec) && styles.specChipTextSelected
                                        ]}>
                                            {spec}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.selectedCount}>{formData.specialization.length}/5 selected</Text>

                            {/* Bio Edit */}
                            <Text style={styles.label}>About You</Text>
                            <Text style={styles.helperText}>Tell clients about your experience (min 20 chars)</Text>
                            <TextInput
                                style={styles.bioInput}
                                multiline
                                numberOfLines={4}
                                placeholder="I am a certified personal trainer with experience in..."
                                placeholderTextColor="#666"
                                value={formData.bio}
                                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                                textAlignVertical="top"
                            />
                            <Text style={styles.charCount}>{formData.bio.length} characters</Text>
                        </>
                    ) : (
                        <>
                            {/* Specializations Display */}
                            <Text style={styles.label}>Specializations</Text>
                            <View style={styles.specsDisplay}>
                                {profile?.specialization?.length ? (
                                    profile.specialization.map((spec) => (
                                        <View key={spec} style={styles.specBadge}>
                                            <Text style={styles.specBadgeText}>{spec}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>No specializations set</Text>
                                )}
                            </View>

                            {/* Bio Display */}
                            <Text style={[styles.label, { marginTop: 20 }]}>About</Text>
                            <Text style={styles.bioText}>
                                {profile?.bio || 'No bio added yet'}
                            </Text>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            {isEditing ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[styles.buttonContainer, { position: 'absolute', bottom: 85, left: 0, right: 0, paddingBottom: 10 }]}>
                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#ff8c2b' }]} onPress={() => setIsEditing(true)}>
                        <Text style={styles.saveButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}

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
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/sessions" as any)}>
                    <Ionicons name="fitness-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/schedule" as any)}>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person" size={24} color="#ff8c2b" />
                    <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 180,
    },
    profileCard: {
        backgroundColor: "#111",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 20,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 15,
    },
    cameraBtn: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#ff8c2b",
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: "#000",
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    trainerBadge: {
        fontSize: 14,
        color: "#ff8c2b",
        fontWeight: "600",
    },
    gymInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    gymName: {
        color: "#888",
        fontSize: 14,
        marginLeft: 6,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    ratingText: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 6,
    },
    section: {
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#222",
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    infoContent: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        color: "#666",
        fontSize: 12,
    },
    infoValue: {
        color: "#fff",
        fontSize: 15,
        marginTop: 2,
    },
    label: {
        color: "#888",
        fontSize: 14,
        marginBottom: 8,
        fontWeight: "600",
    },
    helperText: {
        color: "#666",
        fontSize: 12,
        marginBottom: 12,
    },
    specsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    specChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "#333",
    },
    specChipSelected: {
        backgroundColor: "#ff8c2b",
        borderColor: "#ff8c2b",
    },
    specChipText: {
        fontSize: 13,
        color: "#aaa",
    },
    specChipTextSelected: {
        color: "#000",
        fontWeight: "600",
    },
    selectedCount: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
        marginTop: 8,
    },
    specsDisplay: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    specBadge: {
        backgroundColor: "#ff8c2b20",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    specBadgeText: {
        color: "#ff8c2b",
        fontSize: 13,
        fontWeight: "500",
    },
    emptyText: {
        color: "#666",
        fontSize: 14,
        fontStyle: "italic",
    },
    bioInput: {
        backgroundColor: "#000",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
        padding: 14,
        color: "#fff",
        fontSize: 14,
        minHeight: 100,
    },
    charCount: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
        marginTop: 6,
    },
    bioText: {
        color: "#ccc",
        fontSize: 14,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        backgroundColor: "#000",
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#ff8c2b",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
    logoutButton: {
        flex: 1,
        backgroundColor: "#222",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ff4444",
    },
    logoutButtonText: {
        color: "#ff4444",
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#333",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
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
