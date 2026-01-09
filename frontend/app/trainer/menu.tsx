import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Dimensions
} from "react-native";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function TrainerMenu() {
    const { logout } = useAuth();

    const menuItems = [
        { name: "My Profile", icon: "person", action: () => router.push("/trainer/profile") },
        { name: "My Clients", icon: "people", action: () => router.push("/trainer/clients" as any) },
        { name: "My Sessions", icon: "fitness", action: () => router.push("/trainer/sessions" as any) },
        { name: "Schedule", icon: "calendar", action: () => router.push("/trainer/schedule" as any) },
        { name: "Settings", icon: "settings", action: () => { } },
        { name: "Logout", icon: "log-out", action: logout },
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            onRequestClose={() => router.back()}
        >
            <TouchableOpacity
                style={styles.overlay}
                onPress={() => router.back()}
            >
                <View style={styles.menuContainer} onStartShouldSetResponder={() => true}>
                    <Stack.Screen
                        options={{
                            headerTitle: () => <Logo size={24} />,
                            headerStyle: { backgroundColor: "#000" },
                            headerTintColor: "#fff",
                            headerTitleAlign: "left",
                            headerShadowVisible: false,
                        }}
                    />

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Menu</Text>
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuItems}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={item.action}
                            >
                                <Ionicons name={item.icon as any} size={24} color="#fff" />
                                <Text style={styles.menuItemText}>{item.name}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#666" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "flex-end",
    },
    menuContainer: {
        backgroundColor: "#111",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.7,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    closeButton: {
        padding: 5,
    },
    menuItems: {
        padding: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: "#fff",
        marginLeft: 15,
    },
});