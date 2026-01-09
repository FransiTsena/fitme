import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function OwnerMenuModal() {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.dismissAll();
        router.replace("/");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Transparent backdrop to close menu */}
            <Pressable style={styles.backdrop} onPress={() => router.back()} />

            {/* Menu Content (Right Side) */}
            <View style={styles.menuContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Menu</Text>
                        <Text style={styles.subtitle}>Gym owner settings and options</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={24} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/owner/profile')}>
                    <Ionicons name="person-outline" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>My Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/owner/members-list-owner')}>
                    <Ionicons name="people-outline" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Members</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/owner/trainers-list-owner')}>
                    <Ionicons name="barbell-outline" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Trainers</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/owner/owner-gym-registration')}>
                    <Ionicons name="business-outline" size={24} color="#fff" />
                    <Text style={styles.menuItemText}>Gym Registration</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align to right
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    menuContent: {
        width: '80%',
        backgroundColor: '#111',
        height: '100%',
        padding: 24,
        paddingTop: 60, // Space for status bar
        borderLeftWidth: 1,
        borderLeftColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoutText: {
        color: '#ff4444', // Red for logout
        fontSize: 18,
        fontWeight: '600',
    },
    menuItemText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
    }
});
