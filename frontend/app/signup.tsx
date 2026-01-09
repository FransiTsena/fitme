import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function SignupScreen() {
    const [role, setRole] = useState("Owner");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const { signup, loading, error, clearError } = useAuth();

    const handleSignup = async () => {
        // Validation
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

        try {
            const result = await signup({
                email,
                password,
                name,
                phone,
                registrationRole: role.toLowerCase(),
            });

            if (result.success) {
                // Navigate based on user role after successful signup
                const userRole = role.toLowerCase();

                if (userRole === 'owner') {
                    // For owners, show different success message and navigate to gym registration
                    Alert.alert(
                        "Account Created Successfully",
                        "Your account has been created successfully! As a gym owner, you need to verify your gym details to complete the registration process. You will be placed in a pending approval state until verification is complete.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    // Use Promise.resolve().then() to ensure navigation happens after state update
                                    Promise.resolve().then(() => {
                                        // For owners, navigate to gym registration page after login
                                        router.replace("/login");
                                    });
                                }
                            }
                        ]
                    );
                } else {
                    // For trainers and members, show success message and navigate to home
                    Alert.alert(
                        "Success",
                        "Account created successfully! You can now access the application.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    // Use Promise.resolve().then() to ensure navigation happens after state update
                                    Promise.resolve().then(() => {
                                        router.replace("/login");
                                    });
                                }
                            }
                        ]
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
            <ScrollView contentContainerStyle={styles.container}>
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
                        <Ionicons
                            name="person-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Abebe Bekele"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (error) clearError();
                            }}
                        />
                    </View>

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="abebe@example.com"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) clearError();
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Phone number</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="call-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="+251912345678"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                if (error) clearError();
                            }}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Create password"
                            placeholderTextColor="#666"
                            secureTextEntry={!passwordVisible}
                            style={styles.input}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (error) clearError();
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!passwordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Confirm your password"
                            placeholderTextColor="#666"
                            secureTextEntry={!confirmPasswordVisible}
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (error) clearError();
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={confirmPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            onPress={() => setAgreed(!agreed)}
                            style={styles.checkbox}
                        >
                            <Ionicons
                                name={agreed ? "checkbox" : "square-outline"}
                                size={24}
                                color={agreed ? "#ff8c2b" : "#666"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.checkboxText}>
                            I agree to the{" "}
                            <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.createBtn}
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
        justifyContent: "center",
    },
    headerContainer: {
        alignItems: "center",
    },
    logoContainer: {
        marginBottom: 20,
        alignSelf: "flex-start",
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
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center", // Align items to the top to handle multi-line text if needed
        marginTop: 8,
        marginBottom: 24,
    },
    checkbox: {
        marginRight: 10,
    },
    checkboxText: {
        color: "#666",
        fontSize: 14,
        flex: 1, // Allow text to wrap
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
