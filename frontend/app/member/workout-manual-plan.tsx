
import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WorkoutManualPlanScreen() {
    const [days, setDays] = React.useState(['DAY 1', 'DAY 2']);

    const handleAddDay = () => {
        setDays([...days, `DAY ${days.length + 1}`]);
    };

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
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Dynamic Day Cards */}
                {days.map((day, index) => (
                    <View key={index} style={styles.cardContainer}>
                        <View style={styles.cardBorder}>
                            <Text style={styles.cardTitle}>{day}</Text>
                            <Text style={styles.cardDesc}>
                                Elevate your fitness game with a personal fitness ai chatbot
                            </Text>

                            {/* Stats Row */}
                            <View style={styles.cardStatsRow}>
                                <View style={styles.statItem}>
                                    <Ionicons name="time-outline" size={18} color="#ff8c2b" />
                                    <Text style={styles.statText}>3hr</Text>
                                </View>
                                <View style={styles.exerciseBadge}>
                                    <Text style={styles.exerciseText}>4 exercises</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.buttonWrapper}
                                onPress={() => router.push({
                                    pathname: "/member/day-plan-customization",
                                    params: { day }
                                })}
                            >
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
                ))}

                {/* ADD Button */}
                <View style={styles.addButtonContainer}>
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddDay}>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff6b00']}
                            style={styles.addBtnGradient}
                        >
                            <Text style={styles.addBtnText}>ADD</Text>
                        </LinearGradient>
                    </TouchableOpacity>
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
        backgroundColor: '#000',
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
        borderRadius: 30,
        overflow: 'hidden',
    },
    cardBorder: {
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#000',
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: '900',
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
    addButtonContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    addBtn: {
        shadowColor: "#ff8c2b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    addBtnGradient: {
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 8,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cardStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    exerciseBadge: {
        backgroundColor: 'rgba(23, 89, 23, 0.4)', // Dark green transparent bg
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(46, 139, 87, 0.5)',
    },
    exerciseText: {
        color: '#4ade80', // Light green text
        fontSize: 14,
        fontWeight: '500',
    }
});
