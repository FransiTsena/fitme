import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

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

interface Gym {
    _id: string;
    name: string;
    address: {
        city: string;
        area: string;
    };
}

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export default function SignupScreen() {
    const [role, setRole] = useState("User");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [agreed, setAgreed] = useState(false);

    // Trainer-specific fields
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
    const [bio, setBio] = useState("");
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [selectedGym, setSelectedGym] = useState<string>("");
    const [gymsLoading, setGymsLoading] = useState(false);

    const { signup, loading, error, clearError } = useAuth();

    // Fetch gyms when trainer role is selected
    useEffect(() => {
        if (role === "Trainer") {
            fetchGyms();
        }
    }, [role]);

    const fetchGyms = async () => {
        setGymsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/gyms`);
            console.log("Fetching gyms from:", `${API_BASE_URL}/gyms`);
            const data = await response.json();
            if (response.ok) {
                setGyms(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching gyms:", err);
        } finally {
            setGymsLoading(false);
        }
    };

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

    const handleSignup = async () => {
        // Basic validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (!agreed) {
            Alert.alert("Error", "You must agree to the Terms of Service and Privacy Policy");
            return;
        }

        // Trainer-specific validation
        if (role === "Trainer") {
            if (selectedSpecs.length === 0) {
                Alert.alert("Error", "Please select at least one specialization");
                return;
            }
            if (!bio.trim() || bio.trim().length < 20) {
                Alert.alert("Error", "Please write a bio about yourself (at least 20 characters)");
                return;
            }
            if (!selectedGym) {
                Alert.alert("Error", "Please select a gym to work at");
                return;
            }
        }

        try {
            const signupData: any = {
                email,
                password,
                name,
                phone,
                registrationRole: role.toLowerCase(),
            };

            // Add trainer-specific fields
            if (role === "Trainer") {
                signupData.specialization = selectedSpecs;
                signupData.bio = bio.trim();
                signupData.gymId = selectedGym;
            }

            const result = await signup(signupData);

            if (result.success) {
                const userRole = role.toLowerCase();

                if (userRole === 'owner') {
                    Alert.alert(
                        "Account Created Successfully",
                        "Your account has been created! As a gym owner, you need to verify your gym details to complete the registration process.",
                        [{ text: "OK", onPress: () => router.replace("/login") }]
                    );
                } else if (userRole === 'trainer') {
                    Alert.alert(
                        "Welcome, Trainer!",
                        "Your trainer account has been created successfully. You can now log in and start managing your sessions.",
                        [{ text: "OK", onPress: () => router.replace("/login") }]
                    );
                } else {
                    Alert.alert(
                        "Success",
                        "Account created successfully! You can now access the application.",
                        [{ text: "OK", onPress: () => router.replace("/login") }]
                    );
                }
            } else {
                Alert.alert("Signup Failed", result.error);
            }
        } catch (err) {
            console.error("Signup error:", err);
            Alert.alert("Error", "An unexpected error occurred");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={28} />,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Join FitMe</Text>
                    <Text style={styles.subtitle}>
                        Start your fitness journey today
                    </Text>
                </View>

                <View style={styles.card}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>I am a</Text>

                    <View style={styles.roleRow}>
                        {['User', 'Owner', 'Trainer'].map((item) => (
                            <TouchableOpacity
                                key={item}
                                onPress={() => setRole(item)}
                                style={[styles.roleBtn, role === item && styles.activeRole]}
                            >
                                <Text
                                    style={[styles.roleText, role === item && { color: '#000' }]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Abebe Bekele"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={name}
                            onChangeText={(text) => { setName(text); if (error) clearError(); }}
                        />
                    </View>

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="abebe@example.com"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={email}
                            onChangeText={(text) => { setEmail(text); if (error) clearError(); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Phone number</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="+251912345678"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={phone}
                            onChangeText={(text) => { setPhone(text); if (error) clearError(); }}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Create password"
                            placeholderTextColor="#666"
                            secureTextEntry={!passwordVisible}
                            style={styles.input}
                            value={password}
                            onChangeText={(text) => { setPassword(text); if (error) clearError(); }}
                        />
                        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                            <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Confirm your password"
                            placeholderTextColor="#666"
                            secureTextEntry={!confirmPasswordVisible}
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); if (error) clearError(); }}
                        />
                        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={styles.eyeIcon}>
                            <Ionicons name={confirmPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Trainer-specific fields */}
                    {role === "Trainer" && (
                        <>
                            <View style={styles.trainerSection}>
                                <View style={styles.trainerHeader}>
                                    <Ionicons name="fitness" size={20} color="#ff8c2b" />
                                    <Text style={styles.trainerSectionTitle}>Trainer Profile</Text>
                                </View>

                                {/* Select Gym */}
                                <Text style={styles.label}>Select Your Gym <Text style={styles.required}>*</Text></Text>
                                {gymsLoading ? (
                                    <ActivityIndicator color="#ff8c2b" style={{ marginBottom: 16 }} />
                                ) : gyms.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gymScrollView}>
                                        {gyms.map((gym) => (
                                            <TouchableOpacity
                                                key={gym._id}
                                                style={[styles.gymCard, selectedGym === gym._id && styles.gymCardSelected]}
                                                onPress={() => setSelectedGym(gym._id)}
                                            >
                                                <Text style={[styles.gymName, selectedGym === gym._id && styles.gymNameSelected]}>
                                                    {gym.name}
                                                </Text>
                                                <Text style={[styles.gymLocation, selectedGym === gym._id && styles.gymLocationSelected]}>
                                                    {gym.address?.area}, {gym.address?.city}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <Text style={styles.noGymsText}>No gyms available. Please try again later.</Text>
                                )}

                                {/* Specializations */}
                                <Text style={styles.label}>Your Specializations <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.helperText}>Select up to 5 areas you specialize in</Text>
                                <View style={styles.specsGrid}>
                                    {SPECIALIZATIONS.map((spec) => (
                                        <TouchableOpacity
                                            key={spec}
                                            style={[styles.specChip, selectedSpecs.includes(spec) && styles.specChipSelected]}
                                            onPress={() => toggleSpecialization(spec)}
                                        >
                                            <Text style={[styles.specChipText, selectedSpecs.includes(spec) && styles.specChipTextSelected]}>
                                                {spec}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.selectedCount}>{selectedSpecs.length}/5 selected</Text>

                                {/* Bio */}
                                <Text style={styles.label}>About You <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.helperText}>Tell clients about your experience (min 20 chars)</Text>
                                <TextInput
                                    style={styles.bioInput}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="I am a certified personal trainer with experience in..."
                                    placeholderTextColor="#666"
                                    value={bio}
                                    onChangeText={setBio}
                                    textAlignVertical="top"
                                />
                                <Text style={styles.charCount}>{bio.length} characters</Text>
                            </View>
                        </>
                    )}

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity onPress={() => setAgreed(!agreed)} style={styles.checkbox}>
                            <Ionicons
                                name={agreed ? "checkbox" : "square-outline"}
                                size={24}
                                color={agreed ? "#ff8c2b" : "#666"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.createBtn, loading && styles.createBtnDisabled]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text style={styles.createBtnText}>
                            {loading ? "Creating..." : "Create Account"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#000",
        padding: 24,
    },
    headerContainer: {
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        color: "#aaa",
        textAlign: "center",
        marginBottom: 30,
        fontSize: 16,
    },
    card: {
        backgroundColor: "#111",
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "#333",
    },
    label: {
        color: "#fff",
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "600",
    },
    required: {
        color: "#ff8c2b",
    },
    helperText: {
        color: "#888",
        fontSize: 12,
        marginBottom: 8,
    },
    roleRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    roleBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#333",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "#000",
    },
    activeRole: {
        backgroundColor: "#ff8c2b",
        borderColor: "#ff8c2b",
    },
    roleText: {
        color: "#aaa",
        fontWeight: "600",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#080808",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        height: "100%",
    },
    eyeIcon: {
        padding: 4,
    },
    // Trainer section styles
    trainerSection: {
        marginTop: 8,
        marginBottom: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    trainerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    trainerSectionTitle: {
        color: "#ff8c2b",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 8,
    },
    gymScrollView: {
        marginBottom: 16,
    },
    gymCard: {
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 12,
        padding: 12,
        marginRight: 10,
        minWidth: 150,
    },
    gymCardSelected: {
        backgroundColor: "#ff8c2b",
        borderColor: "#ff8c2b",
    },
    gymName: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    gymNameSelected: {
        color: "#000",
    },
    gymLocation: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    gymLocationSelected: {
        color: "#333",
    },
    noGymsText: {
        color: "#666",
        fontSize: 14,
        marginBottom: 16,
    },
    specsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    specChip: {
        paddingHorizontal: 12,
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
        fontSize: 12,
        color: "#aaa",
    },
    specChipTextSelected: {
        color: "#000",
        fontWeight: "600",
    },
    selectedCount: {
        fontSize: 11,
        color: "#666",
        textAlign: "right",
        marginBottom: 16,
    },
    bioInput: {
        backgroundColor: "#000",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
        padding: 12,
        color: "#fff",
        fontSize: 14,
        minHeight: 80,
        marginBottom: 4,
    },
    charCount: {
        fontSize: 11,
        color: "#666",
        textAlign: "right",
        marginBottom: 16,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    checkbox: {
        marginRight: 10,
    },
    checkboxText: {
        color: "#666",
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    linkText: {
        color: "#ff8c2b",
        fontWeight: "bold",
    },
    createBtn: {
        backgroundColor: "#ff8c2b",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#ff8c2b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createBtnDisabled: {
        opacity: 0.7,
    },
    createBtnText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    footerText: {
        color: "#aaa",
        fontSize: 14,
    },
    loginLink: {
        color: "#ff8c2b",
        fontWeight: "bold",
        fontSize: 14,
    },
    errorContainer: {
        backgroundColor: "#ff444420",
        borderColor: "#ff4444",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: "#ff6666",
        textAlign: "center",
        fontSize: 14,
    },
});
