import { Logo } from "@/components/Logo";
import { Stack } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    View
} from "react-native";

export default function OwnerHomeScreen() {
    return (
        <View style={styles.container} testID="owner-dashboard">
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
                <Text style={styles.headerText}>Gym Owner Dashboard</Text>
                <Text style={styles.subHeaderText}>Welcome to your owner interface</Text>
                <View style={styles.card}>
                    <Text style={styles.cardText}>This is the owner-specific dashboard.</Text>
                    <Text style={styles.cardText}>Here you can manage your gym operations.</Text>
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
    },
    cardText: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 8,
    },
});
