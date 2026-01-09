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

export default function LoginScreen() {
    const authContext = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { login, loading, error, clearError, fetchUser } = authContext;

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        try {
            const result = await login(email, password);
            if (result.success) {
                // Wait for fetchUser to complete, then navigate based on user role
                await fetchUser();

                // Wait for the context to update by polling for user data
                const waitForUserData = (timeout = 3000) => {
                    return new Promise<void>((resolve) => {
                        const startTime = Date.now();
                        const checkUser = () => {
                            if (authContext.user?.role) {
                                resolve();
                            } else if (Date.now() - startTime < timeout) {
                                setTimeout(checkUser, 100);
                            } else {
                                resolve(); // Resolve anyway after timeout
                            }
                        };
                        checkUser();
                    });
                };

                await waitForUserData();

                // Access the user data from the auth context after it's updated
                const userRole = authContext.user?.role;
                const documentStatus = authContext.user?.documentStatus;

                console.log('DEBUG: User role after login:', userRole);
                console.log('DEBUG: Document status after login:', documentStatus);

                if (userRole === 'owner') {
                    // For owners, check if documents are pending approval
                    if (documentStatus === 'pending' || documentStatus === 'not_submitted') {
                        // Owner needs to submit documents or is pending approval
                        // Navigate to owner home which should guide them to submit documents
                        console.log('Navigating owner to owner-home (pending)');
                        router.replace('/owner-home');
                    } else if (documentStatus === 'approved') {
                        // Approved owner - can access full owner features
                        console.log('Navigating owner to owner-home (approved)');
                        router.replace('/owner-home');
                    } else if (documentStatus === 'rejected') {
                        // Rejected owner - may need to resubmit documents
                        console.log('Navigating owner to owner-home (rejected)');
                        router.replace('/owner-home');
                    } else {
                        // Default case for owner
                        console.log('Navigating owner to owner-home (default)');
                        router.replace('/owner-home');
                    }
                } else if (userRole === 'trainer') {
                    // Trainers go to their respective home screen
                    console.log('Navigating trainer to user-home');
                    router.replace('/user-home');
                } else {
                    // Members and other roles go to regular user home
                    console.log('Navigating member to user-home');
                    router.replace('/user-home');
                }
            } else {
                Alert.alert("Login Failed", result.error);
            }
        } catch (err) {
            console.error("Login error:", err);
            Alert.alert("Error", "An unexpected error occurred");
        }
    };

    // Clear error when user starts typing
    const onEmailChange = (text: string) => {
        setEmail(text);
        if (error) clearError();
    };

    const onPasswordChange = (text: string) => {
        setPassword(text);
        if (error) clearError();
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
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to continue your fitness journey
                    </Text>
                </View>

                <View style={styles.card}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

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
                            onChangeText={onEmailChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
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
                            placeholder="Enter your password"
                            placeholderTextColor="#666"
                            secureTextEntry={!passwordVisible}
                            style={styles.input}
                            value={password}
                            onChangeText={onPasswordChange}
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

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => router.push("/forgot-password")}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginBtnText}>
                            {loading ? "Signing In..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/signup")}>
                            <Text style={styles.signupLink}>Sign Up</Text>
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
        marginBottom: 30,
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
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#ff8c2b",
        fontSize: 14,
    },
    loginBtn: {
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
    loginBtnText: {
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
    signupLink: {
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