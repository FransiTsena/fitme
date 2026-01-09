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

export default function OwnerGymRegistrationScreen() {
    const [gymName, setGymName] = useState("");
    const [description, setDescription] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [street, setStreet] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const { user, token } = useAuth();

    const handleGymRegistration = async () => {
        if (!gymName || !city || !area) {
            Alert.alert("Error", "Please fill in all required fields (Gym Name, City, and Area)");
            return;
        }

        setLoading(true);

        try {
            // Call the backend API to register the gym
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/gyms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ownerId: user?.id,
                    name: gymName,
                    description: description,
                    location: {
                        type: "Point",
                        coordinates: [0, 0] // Will be updated with actual location if available
                    },
                    address: {
                        city: city,
                        area: area,
                        street: street
                    },
                    phoneNumber: phoneNumber
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register gym');
            }

            Alert.alert(
                "Success",
                "Your gym has been registered successfully! Please wait for approval from the administrators.",
                [{
                    text: "OK",
                    onPress: () => {
                        router.back(); // Go back to the previous screen
                    }
                }]
            );

        } catch (error: any) {
            console.error("Gym registration error:", error);
            Alert.alert("Registration Failed", error.message || "An error occurred while registering your gym");
        } finally {
            setLoading(false);
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
                    headerBackVisible: true,
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Register Your Gym</Text>
                    <Text style={styles.subtitle}>
                        Please provide your gym details for verification
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Gym Name *</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="business-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Enter gym name"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={gymName}
                            onChangeText={setGymName}
                        />
                    </View>

                    <Text style={styles.label}>Description</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <TextInput
                            placeholder="Describe your gym..."
                            placeholderTextColor="#666"
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <Text style={styles.label}>City *</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Enter city"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>

                    <Text style={styles.label}>Area *</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Enter area/locality"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={area}
                            onChangeText={setArea}
                        />
                    </View>

                    <Text style={styles.label}>Street Address</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Enter street address"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={street}
                            onChangeText={setStreet}
                        />
                    </View>

                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="call-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Enter phone number"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={handleGymRegistration}
                        disabled={loading}
                    >
                        <Text style={styles.registerBtnText}>
                            {loading ? "Registering..." : "Register Gym"}
                        </Text>
                    </TouchableOpacity>
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
    textAreaContainer: {
        height: 100,
        alignItems: 'flex-start',
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
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
    },
    registerBtn: {
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
    registerBtnText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
});