import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    View
} from "react-native";

export default function TrainerHomeScreen() {
    const router = useRouter();
    return (
        <View style={styles.container} testID="trainer-dashboard">
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "left",
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.contentContainer}>
                <Text style={styles.headerText}>Trainer Dashboard</Text>
                <Text style={styles.subHeaderText}>Welcome to your trainer interface</Text>
                <View style={styles.card}>
                    <Text style={styles.cardText}>This is the trainer-specific dashboard.</Text>
                    <Text style={styles.cardText}>Here you can manage your training sessions and clients.</Text>
                </View>

                <View style={styles.featureCard}>
                    <Ionicons name="calendar-outline" size={24} color="#ff8c2b" />
                    <Text style={styles.featureText}>Manage Sessions</Text>
                </View>

                <View style={styles.featureCard}>
                    <Ionicons name="people-outline" size={24} color="#ff8c2b" />
                    <Text style={styles.featureText}>Client Management</Text>
                </View>

                <View style={styles.featureCard}>
                    <Ionicons name="barbell-outline" size={24} color="#ff8c2b" />
                    <Text style={styles.featureText}>Workout Plans</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ff8c2b",
        marginBottom: 10,
        textAlign: "center",
    },
    subHeaderText: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 30,
        textAlign: "center",
    },
    card: {
        backgroundColor: "#111",
        padding: 20,
        borderRadius: 10,
        width: "90%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 20,
    },
    cardText: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 8,
    },
    featureCard: {
        backgroundColor: "#111",
        padding: 15,
        borderRadius: 10,
        width: "90%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 10,
        flexDirection: "row",
        gap: 10,
    },
    featureText: {
        color: "#fff",
        fontSize: 16,
    },
});