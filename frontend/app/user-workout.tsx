
import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UserWorkoutScreen() {
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
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "left",
                    headerShadowVisible: false,
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Title */}
                <Text style={styles.pageTitle}>Work-Out</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#fff" />
                    <TextInput
                        placeholder="Search member..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                    />
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

                {/* Customize Button */}
                <TouchableOpacity
                    style={styles.customizeBtnWrapper}
                    onPress={() => router.push("/workout-customization")}
                >
                    <LinearGradient
                        colors={['#ff8c2b', '#ff6b00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.customizeBtn}
                    >
                        <Text style={styles.customizeBtnText}>Customize</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Workouts Section */}
                <View style={styles.workoutsHeader}>
                    <Text style={styles.sectionTitle}>All Workouts</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Workout Cards */}
                <View style={styles.cardsContainer}>
                    <WorkoutCard
                        title="Back Workout"
                        reps="30x reps Each"
                        sets="30x reps Each"
                        image={require('@/assets/images/gym-1.png')}
                    />
                    <WorkoutCard
                        title="Back Workout"
                        reps="30x reps Each"
                        sets="30x reps Each"
                        image={require('@/assets/images/gym-1.png')}
                    />
                    <WorkoutCard
                        title="Back Workout"
                        reps="30x reps Each"
                        sets="30x reps Each"
                        image={require('@/assets/images/gym-1.png')}
                    />
                </View>

            </ScrollView>

            <UserBottomNav />
        </View>
    );
}

function WorkoutCard({ title, reps, sets, image }: { title: string, reps: string, sets: string, image: any }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Image source={image} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardDetail}>{reps}</Text>
                    <Text style={styles.cardDetail}>{sets}</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                    <Ionicons name="pencil" size={18} color="#aaa" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for bottom nav
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
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
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
    customizeBtnWrapper: {
        marginBottom: 30,
        shadowColor: "#ff8c2b",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    customizeBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    customizeBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    workoutsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    seeAllText: {
        color: '#ff8c2b',
        fontSize: 14,
        fontWeight: '600',
    },
    cardsContainer: {
        gap: 15,
    },
    card: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#333',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    cardDetail: {
        color: '#888',
        fontSize: 13,
        marginBottom: 2,
    },
    editBtn: {
        padding: 5,
        alignSelf: 'flex-start', // Align to top
    }
});
