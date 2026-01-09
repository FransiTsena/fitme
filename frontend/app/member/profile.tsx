import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function MemberProfileScreen() {
    const { user, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        fatherName: user?.fatherName || '',
        city: user?.city || '',
        area: user?.area || '',
    });

    const handleSave = async () => {
        Alert.alert('Feature Coming Soon', 'Profile updates will be available in the next release.');
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
                            <TouchableOpacity onPress={() => router.push("/member/menu")}>
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
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle-outline" size={100} color="#ff8c2b" />
                        <TouchableOpacity style={styles.cameraBtn}>
                            <Ionicons name="camera" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileName}>{user?.name || 'Member Name'}</Text>
                    <Text style={styles.memberBadge}>FitMe Member</Text>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>

                        {isEditing ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Father's Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.fatherName}
                                        onChangeText={(text) => setFormData({ ...formData, fatherName: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>City</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.city}
                                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Area</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.area}
                                        onChangeText={(text) => setFormData({ ...formData, area: text })}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Father's Name</Text>
                                    <Text style={styles.infoValue}>{user?.fatherName || 'N/A'}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Location</Text>
                                    <Text style={styles.infoValue}>{user?.city ? `${user?.area}, ${user?.city}` : 'N/A'}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                {isEditing ? (
                    <>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}
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
        paddingTop: 40,
    },
    profileCard: {
        backgroundColor: "#111",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 20,
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
    memberBadge: {
        fontSize: 14,
        color: "#ff8c2b",
        marginBottom: 25,
    },
    infoSection: {
        width: "100%",
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    infoLabel: {
        color: "#888",
        fontSize: 14,
    },
    infoValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        color: "#888",
        fontSize: 14,
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#080808",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 8,
        padding: 12,
        color: "#fff",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 20,
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#ff8c2b",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    editButtonText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#00cc44",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#333",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});