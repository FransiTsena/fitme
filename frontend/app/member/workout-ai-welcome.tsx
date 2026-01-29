
import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkoutAIWelcomeScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null,
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                                <View style={styles.badge} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/member/menu")}>
                                <Ionicons name="menu-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.content}>
                {/* Background Image / Color Block */}
                <ImageBackground
                    source={require('@/assets/images/ai-welcome-bg.png')}
                    style={styles.orangeBackground}
                    resizeMode="cover"
                >
                    {/* Dark overlay for readability */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 140, 43, 0.3)' }]} />

                    {/* Centered Logo/Icon */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <View style={{ transform: [{ rotate: '-45deg' }] }}>
                                <Ionicons name="barbell" size={50} color="#ff8c2b" />
                            </View>
                        </View>
                    </View>

                    {/* Text Content */}
                    <Text style={styles.welcomeTitle}>Welcome To</Text>
                    <Text style={styles.brandTitle}>FitMe.ai</Text>

                    <Text style={styles.subtitle}>
                        Your personal fitness AI Assistant 🤖
                    </Text>

                    {/* Get Started Button */}
                    <TouchableOpacity style={styles.getStartedBtn} onPress={() => router.push("/member/workout-ai-generation")}>
                        <Text style={styles.getStartedText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </ImageBackground>
            </View>

            <UserBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff8c2b',
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    orangeBackground: {
        flex: 1,
        backgroundColor: '#ff8c2b', // Main orange color
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logoCircle: {
        width: 100,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 50, // Circle
        alignItems: 'center',
        justifyContent: 'center',
        // Create the arch shape if possible, but circle is a good placeholder
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    brandTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 50,
        opacity: 0.9,
    },
    getStartedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff9d4d', // Slightly lighter orange for button visibility
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        gap: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    getStartedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
