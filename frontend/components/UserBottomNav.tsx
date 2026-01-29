import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function UserBottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    // Helper to check active state
    const isActive = (path: string) => pathname === path || pathname.startsWith(path);

    return (
        <View style={styles.bottomNav}>
            {/* Explore / Compass (Active) */}
            <TouchableOpacity onPress={() => router.push("/explore")}>
                <Ionicons
                    name={isActive("/explore") ? "compass" : "compass-outline"}
                    size={28}
                    color={isActive("/explore") ? "#ff8c2b" : "#666"}
                />
            </TouchableOpacity>

            {/* Workouts / Dumbbell */}
            <TouchableOpacity onPress={() => router.push("/member/user-workout")}>
                <Ionicons
                    name={isActive("/member/user-workout") || isActive("/member/workout-customization") || isActive("/member/workout-ai-welcome") || isActive("/member/workout-manual-plan") ? "barbell" : "barbell-outline"}
                    size={28}
                    color={isActive("/member/user-workout") || isActive("/member/workout-customization") || isActive("/member/workout-ai-welcome") || isActive("/member/workout-manual-plan") ? "#ff8c2b" : "#666"}
                />
            </TouchableOpacity>

            {/* Home */}
            <TouchableOpacity onPress={() => router.push("/member/user-home")} >
                <Ionicons name="home-outline" size={28} color={isActive("/member/user-home") ? "#ff8c2b" : "#666"} />
            </TouchableOpacity>

            {/* Schedule / Calendar */}
            <TouchableOpacity onPress={() => router.push("/member/schedules")}>
                <Ionicons name={isActive("/member/schedules") ? "calendar" : "calendar-outline"} size={28} color={isActive("/member/schedules") ? "#ff8c2b" : "#666"} />
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity onPress={() => router.push("/member/profile")}>
                <Ionicons
                    name={isActive("/member/profile") ? "person" : "person-outline"}
                    size={28}
                    color={isActive("/member/profile") ? "#ff8c2b" : "#666"}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingTop: 16,
        paddingBottom: 30, // Safe area for iPhone home bar
        borderTopWidth: 1,
        borderTopColor: '#333',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
