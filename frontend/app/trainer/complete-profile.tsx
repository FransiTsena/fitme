import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
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
    "Swimming",
    "Nutrition",
    "Rehabilitation",
    "Senior Fitness",
    "Youth Fitness",
    "Group Classes",
    "Personal Training",
];

export default function CompleteProfileScreen() {
    const { user, token } = useAuth();
    const { profile, updateProfile, fetchTrainerProfile } = useTrainerStore();
    
    const [bio, setBio] = useState("");
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setBio(profile.bio || "");
            setSelectedSpecs(profile.specialization || []);
        }
    }, [profile]);

    const toggleSpecialization = (spec: string) => {
        if (selectedSpecs.includes(spec)) {
            setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
        } else {
            if (selectedSpecs.length >= 5) {
                Alert.alert("Limit Reached", "You can select up to 5 specializations");
                return;
            }
            setSelectedSpecs([...selectedSpecs, spec]);
        }
    };

    const handleSave = async () => {
        if (selectedSpecs.length === 0) {
            Alert.alert("Required", "Please select at least one specialization");
            return;
        }

        if (!bio.trim()) {
            Alert.alert("Required", "Please write a short bio about yourself");
            return;
        }

        if (bio.trim().length < 20) {
            Alert.alert("Too Short", "Your bio should be at least 20 characters");
            return;
        }

        setSaving(true);
        try {
            const result = await updateProfile({
                specialization: selectedSpecs,
                bio: bio.trim(),
            }, token!);

            if (result.success) {
                // Refresh profile and navigate to home
                await fetchTrainerProfile(user!.id, token!);
                Alert.alert(
                    "Profile Complete!",
                    "Your trainer profile has been set up successfully.",
                    [{ text: "OK", onPress: () => router.replace("/trainer/home" as any) }]
                );
            } else {
                Alert.alert("Error", result.error || "Failed to save profile");
            }
        } catch {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
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
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="fitness" size={48} color="#ff8c2b" />
                    </View>
                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtitle}>
                        Set up your trainer profile to start accepting clients
                    </Text>
                </View>

                {/* Gym Info */}
                {profile?.gymId && (
                    <View style={styles.gymCard}>
                        <Ionicons name="business" size={24} color="#ff8c2b" />
                        <View style={styles.gymInfo}>
                            <Text style={styles.gymName}>
                                {typeof profile.gymId === 'object' ? profile.gymId.name : 'Your Gym'}
                            </Text>
                            <Text style={styles.gymLocation}>
                                {typeof profile.gymId === 'object' && profile.gymId.address
                                    ? `${profile.gymId.address.area}, ${profile.gymId.address.city}`
                                    : 'Location'
                                }
                            </Text>
                        </View>
                    </View>
                )}

                {/* Specializations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Your Specializations <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                        Select up to 5 areas you specialize in
                    </Text>
                    <View style={styles.specsGrid}>
                        {SPECIALIZATIONS.map((spec) => (
                            <TouchableOpacity
                                key={spec}
                                style={[
                                    styles.specChip,
                                    selectedSpecs.includes(spec) && styles.specChipSelected
                                ]}
                                onPress={() => toggleSpecialization(spec)}
                            >
                                <Text style={[
                                    styles.specChipText,
                                    selectedSpecs.includes(spec) && styles.specChipTextSelected
                                ]}>
                                    {spec}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.selectedCount}>
                        {selectedSpecs.length}/5 selected
                    </Text>
                </View>

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        About You <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                        Tell clients about your experience and training style
                    </Text>
                    <TextInput
                        style={styles.bioInput}
                        multiline
                        numberOfLines={5}
                        placeholder="I am a certified personal trainer with 5 years of experience..."
                        placeholderTextColor="#666"
                        value={bio}
                        onChangeText={setBio}
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>
                        {bio.length} characters (min 20)
                    </Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.saveButtonText}>Complete Profile</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#000" />
                        </>
                    )}
                </TouchableOpacity>

                {/* Skip for now */}
                <TouchableOpacity 
                    style={styles.skipButton}
                    onPress={() => router.replace("/trainer/home" as any)}
                >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ff8c2b20",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    gymCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#333",
    },
    gymInfo: {
        marginLeft: 12,
        flex: 1,
    },
    gymName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    gymLocation: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#888",
        marginBottom: 12,
    },
    required: {
        color: "#ff8c2b",
    },
    specsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    specChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#111",
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
        marginTop: 8,
        textAlign: "right",
    },
    bioInput: {
        backgroundColor: "#111",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
        padding: 16,
        color: "#fff",
        fontSize: 14,
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        color: "#666",
        marginTop: 8,
        textAlign: "right",
    },
    saveButton: {
        backgroundColor: "#ff8c2b",
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    skipButton: {
        paddingVertical: 16,
        alignItems: "center",
    },
    skipButtonText: {
        color: "#666",
        fontSize: 14,
    },
});
