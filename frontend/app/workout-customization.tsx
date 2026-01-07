
import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WorkoutCustomizationScreen() {
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
                            <TouchableOpacity>
                                <Ionicons name="menu-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: { backgroundColor: "#000" }, // Match user-workout
                    headerTintColor: "#fff",
                    headerTitleAlign: "left",
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.curvedHeader}>
                {/* Back Button & Title */}
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>Work-Out</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#fff" />
                    <TextInput
                        value="chest workout"
                        style={styles.searchInput}
                        editable={false} // Focusing on UI match for now
                    />
                    <TouchableOpacity>
                        <Ionicons name="pencil" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Filter / Sort Row */}
                <View style={styles.filterRow}>
                    <View style={styles.filterButtons}>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Text style={styles.filterBtnText}>Filter</Text>
                            <Ionicons name="chevron-down" size={14} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Text style={styles.filterBtnText}>Sort</Text>
                            <Ionicons name="chevron-down" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.resultsText}>99 results</Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                {/* AI PLAN Card */}
                <View style={styles.cardContainer}>
                    <View style={[styles.cardBorder, {}]}>
                        <Text style={styles.cardTitle}>AI  PLAN</Text>
                        <Text style={styles.cardDesc}>
                            Elevate your fitness game with a personal fitness ai chatbot
                        </Text>
                        <TouchableOpacity style={styles.buttonWrapper} onPress={() => router.push("/workout-ai-welcome")}>
                            <LinearGradient
                                colors={['#ff8c2b', '#ff6b00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.btnText}>Generate</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* MAKE MY OWN Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.cardBorder}>
                        <Text style={styles.cardTitle}>MAKE MY OWN</Text>
                        <Text style={styles.cardDesc}>
                            Elevate your fitness game with a personal fitness ai chatbot
                        </Text>
                        <TouchableOpacity style={styles.buttonWrapper} onPress={() => router.push("/workout-manual-plan")}>
                            <LinearGradient
                                colors={['#ff8c2b', '#ff6b00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.btnText}>Customize</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

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
    curvedHeader: {
        backgroundColor: '#111',
        paddingHorizontal: 16,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        backgroundColor: '#ff8c2b',
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000', // Darker input bg on the dark header
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 5,
    },
    filterBtnText: {
        color: '#fff',
        fontSize: 14,
    },
    resultsText: {
        color: '#666',
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    cardContainer: {
        marginBottom: 25,
        borderRadius: 30, // Large radius for outer card shape
        overflow: 'hidden',
    },
    cardBorder: {
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#000', // Ensure card bg is black
    },
    cardTitle: {
        fontSize: 28, // Large title
        fontWeight: '900', // Extra bold
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 1,
    },
    cardDesc: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
        fontWeight: '500',
    },
    buttonWrapper: {
        width: '100%',
        shadowColor: "#ff8c2b",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
    },
    gradientBtn: {
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
