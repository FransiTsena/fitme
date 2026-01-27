import { AdCarousel } from "@/components/AdCarousel";
import { GymCard } from "@/components/GymCard";
import { Logo } from "@/components/Logo";
import { UserBottomNav } from "@/components/UserBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get('window');

// Platform-aware API URL
const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

// --- Calendar Logic ---
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function CustomCalendar() {
    // MOCKING TODAY AS JAN 20, 2026 per user request scenario
    const today = new Date(2026, 0, 20);

    const [currentDate, setCurrentDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState(today.getDate());

    // State for interactive planner logic
    const [plannedDays, setPlannedDays] = useState<number[]>([22, 24]);
    const [attendedDays, setAttendedDays] = useState<number[]>([1, 3, 5, 8, 10, 12, 15, 17]); // Some past dates

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const currentDay = today.getDate();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const changeMonth = (increment: number) => {
        setCurrentDate(new Date(year, month + increment, 1));
        setSelectedDate(1);
    };

    // Toggle planning for a day (if it's in the future)
    const handleDayPress = (day: number) => {
        setSelectedDate(day);

        // Check if day is in the future relative to today
        // Note: simplified logic assuming we are only interacting with the current month view correctly relative to real time
        if (isCurrentMonth) {
            if (day > currentDay) {
                setPlannedDays(prev =>
                    prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                );
            }
        } else if (currentDate > today) {
            // Future month
            setPlannedDays(prev =>
                prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
            );
        }
    };

    // Simulate Scanning QR Code -> Marks Today as Attended
    const handleScanQR = () => {
        if (isCurrentMonth) {
            if (!attendedDays.includes(currentDay)) {
                setAttendedDays(prev => [...prev, currentDay]);
                alert("Checked in successfully! Today marked as attended.");
            } else {
                alert("You've already checked in today!");
            }
        } else {
            alert("You can only scan for the current day.");
        }
    };

    const calendarGrid = useMemo(() => {
        const grid = [];
        let dayCounter = 1;
        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    row.push(null);
                } else if (dayCounter > daysInMonth) {
                    row.push(null);
                } else {
                    row.push(dayCounter);
                    dayCounter++;
                }
            }
            grid.push(row);
            if (dayCounter > daysInMonth) break;
        }
        return grid;
    }, [firstDayOfMonth, daysInMonth]);

    const getDayStyle = (day: number | null) => {
        if (!day) return {};

        const isToday = isCurrentMonth && day === currentDay;
        const isFuture = isCurrentMonth ? day > currentDay : new Date(year, month, day) > today;
        const isPast = isCurrentMonth ? day < currentDay : new Date(year, month, day) < today;

        // Priority Logic:
        // 1. Attended (Orange) - Overrides "Today" if checked in
        if (isCurrentMonth && attendedDays.includes(day)) {
            return { backgroundColor: '#ff8c2b', borderRadius: 8 }; // Orange
        }

        // 2. Today (White) - Unless checked in (handled above)
        if (isToday) {
            return { backgroundColor: '#fff', borderRadius: 8 };
        }

        // 3. Planned Future (Green)
        if ((isFuture || (isToday && !attendedDays.includes(day))) && plannedDays.includes(day)) {
            // Note: If today is planned but not attended, technically it's still "Future" action-wise until midnight? 
            // Or maybe we keep it white as "Today" is special. Let's stick to user rules:
            // "Today" is White.
            // "Future" is Green.
            if (isFuture) return { backgroundColor: '#90ee90', borderRadius: 8 };
        }

        // 4. Past Attended (Orange) - Covered by check #1 ideally if array holds all attended dates
        if (isPast && attendedDays.includes(day)) {
            return { backgroundColor: '#ff8c2b', borderRadius: 8 };
        }

        return {}; // Default
    };

    const getTextStyle = (day: number | null): any => {
        if (!day) return {};

        const isToday = isCurrentMonth && day === currentDay;
        const isFuture = isCurrentMonth ? day > currentDay : new Date(year, month, day) > today;
        const isPast = isCurrentMonth ? day < currentDay : new Date(year, month, day) < today;
        const isAttended = isCurrentMonth && attendedDays.includes(day); // Simplified check for current month view

        if (isAttended) return { color: '#fff', fontWeight: 'bold' };
        if (isToday) return { color: '#000', fontWeight: 'bold' };
        if (isFuture && plannedDays.includes(day)) return { color: '#000', fontWeight: 'bold' };

        return { color: '#888' }; // Default
    };

    return (
        <View style={styles.calendarContainer}>
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>{MONTHS[month]} {year}</Text>
                <View style={styles.calendarControls}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <Ionicons name="chevron-back" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Days Header */}
            <View style={styles.daysHeader}>
                {DAYS.map((day) => (
                    <Text key={day} style={styles.dayLabel}>{day}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
                {calendarGrid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.calendarRow}>
                        {row.map((day, colIndex) => (
                            <TouchableOpacity
                                key={colIndex}
                                style={[
                                    styles.dayCell,
                                    day ? getDayStyle(day) : null,
                                    // Selection border
                                    day === selectedDate && day !== null && { borderWidth: 1, borderColor: '#fff' }
                                ]}
                                onPress={() => day && handleDayPress(day)}
                                disabled={!day}
                            >
                                {day && (
                                    <Text style={[
                                        styles.dayText,
                                        { fontSize: 13 },
                                        getTextStyle(day)
                                    ]}>
                                        {day}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.scanBtnContainer} onPress={handleScanQR}>
                <LinearGradient
                    colors={['#00cc44', '#009933']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scanBtn}
                >
                    <Ionicons name="scan-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.scanBtnText}>Scan QR</Text>
                </LinearGradient>
            </TouchableOpacity>

        </View>
    );
}

// --- Main Screen ---
export default function UserHomeScreen() {
    const { user, token } = useAuth();
    const userRole = user?.role;

    // State for gyms
    const [gyms, setGyms] = useState<any[]>([]);
    const [loadingGyms, setLoadingGyms] = useState(true);
    const [useLocation, setUseLocation] = useState(false); // Toggle between all gyms and nearby gyms
    const [locationError, setLocationError] = useState<string | null>(null);

    // Fetch gyms from API
    useEffect(() => {
        const fetchGyms = async () => {
            try {
                let response;

                if (useLocation) {
                    // For now, we'll use dummy coordinates for testing nearby functionality
                    // In a real app, we would get the user's actual location
                    const dummyLat = 9.018336;
                    const dummyLng = 38.74687;

                    response = await fetch(`${API_BASE_URL}/gyms/nearby?latitude=${dummyLat}&longitude=${dummyLng}&maxDistance=10`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                } else {
                    response = await fetch(`${API_BASE_URL}/gyms`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                }

                if (response.ok) {
                    const data = await response.json();
                    setGyms(data.data || data.gyms || []);
                } else {
                    console.error('Failed to fetch gyms:', response.status, response.statusText);
                    setGyms([]);
                }
            } catch (error) {
                console.error('Error fetching gyms:', error);
                setGyms([]);
            } finally {
                setLoadingGyms(false);
            }
        };

        fetchGyms();
    }, [token, useLocation]);

    return (
        <View style={styles.container} testID="user-dashboard">
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
                    headerTitleAlign: "left",
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeHeader}>
                        <View>
                            <Text style={styles.dateText}>Jan 20, 2026</Text>
                            <Text style={styles.welcomeTitle}>Welcome, Member!</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil" size={12} color="#ff8c2b" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle-outline" size={80} color="#ff8c2b" />
                            {/* Status Dot */}
                            <View style={styles.statusDot} />
                        </View>
                        <View>
                            <Text style={styles.userName}>Abebe Bekele</Text>
                            <Text style={styles.userQuote}>Don&apos;t forget to{"\n"}hit your goals</Text>
                        </View>
                    </View>
                </View>

                {/* Ad Banner */}
                <AdCarousel />

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => router.push("/member/my-subscriptions")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#ff8c2b20' }]}>
                            <Ionicons name="card" size={24} color="#ff8c2b" />
                        </View>
                        <Text style={styles.quickActionText}>My Subs</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => router.push("/member/my-bookings")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#00cc4420' }]}>
                            <Ionicons name="calendar" size={24} color="#00cc44" />
                        </View>
                        <Text style={styles.quickActionText}>Bookings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => router.push("/member/schedules")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#4488ff20' }]}>
                            <Ionicons name="barbell" size={24} color="#4488ff" />
                        </View>
                        <Text style={styles.quickActionText}>Sessions</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => router.push("/member/gym-selection")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#aa44ff20' }]}>
                            <Ionicons name="fitness" size={24} color="#aa44ff" />
                        </View>
                        <Text style={styles.quickActionText}>Find Gym</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <Text style={styles.sectionTitle}>Your Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="barbell" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>+13</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="flame-outline" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>30%</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>1.3k</Text>
                        <Text style={styles.statLabel}>Calories</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="calendar-outline" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>+3</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>6</Text>
                        <Text style={styles.statLabel}>Days</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconConfig, { backgroundColor: "#332211" }]}>
                                <Ionicons name="medal-outline" size={20} color="#ff8c2b" />
                            </View>
                            <View style={styles.statBadge}>
                                <Text style={styles.statBadgeText}>+1</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Badges</Text>
                    </View>
                </View>

                {/* Calendar Section */}
                <Text style={styles.sectionTitle}>Your Calendar</Text>
                <CustomCalendar />

                {/* Today's Workout */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today&apos;s Workout</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.workoutCard} onPress={() => router.push("/member/day-plan-customization")}>
                    <ImageBackground
                        source={require('@/assets/images/gym-1.png')}
                        style={styles.workoutBg}
                        imageStyle={{ borderRadius: 20, opacity: 0.6 }}
                    >
                        <View style={styles.workoutOverlay}>
                            <View style={styles.workoutMetaRow}>
                                <Text style={styles.workoutMeta}>3hrs</Text>
                                <Text style={styles.workoutMeta}>312kcal</Text>
                            </View>
                            <View>
                                <Text style={styles.workoutTitle}>Day 1</Text>
                                <Text style={styles.workoutSubtitle}>2 Series Workout</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                {/* Today's Sessions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today&apos;s Sessions</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                        <View style={styles.sessionAvatar}>
                            <Ionicons name="person" size={18} color="#ff8c2b" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.sessionName}>Abebe Bekele</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                            <Text style={styles.sessionRole}>Personal Trainer</Text>
                        </View>
                    </View>
                    <View style={styles.sessionFooter}>
                        <View style={styles.sessionInfo}>
                            <Ionicons name="time-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.sessionInfoText}>Today 4:00 PM</Text>
                        </View>
                        <View style={styles.sessionInfo}>
                            <Ionicons name="location-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.sessionInfoText}>Bole fitness Center</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                        <View style={styles.sessionAvatar}>
                            <Ionicons name="person" size={18} color="#ff8c2b" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.sessionName}>Abebe Bekele</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                            <Text style={styles.sessionRole}>Personal Trainer</Text>
                        </View>
                    </View>
                    <View style={styles.sessionFooter}>
                        <View style={styles.sessionInfo}>
                            <Ionicons name="time-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.sessionInfoText}>Today 4:00 PM</Text>
                        </View>
                        <View style={styles.sessionInfo}>
                            <Ionicons name="location-outline" size={14} color="#ff8c2b" />
                            <Text style={styles.sessionInfoText}>Bole fitness Center</Text>
                        </View>
                    </View>
                </View>

                {/* Nearby Gyms */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{useLocation ? 'Nearby Gyms' : 'All Gyms'}</Text>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TouchableOpacity onPress={() => setUseLocation(!useLocation)}>
                            <Text style={styles.seeAllText}>{useLocation ? 'Show All' : 'Show Nearby'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/explore")}>
                            <Text style={styles.seeAllText}>Explore</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {loadingGyms ? (
                    <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={24} color="#ff8c2b" style={{ marginRight: 10 }} />
                        <Text style={styles.loadingText}>Loading {useLocation ? 'nearby' : 'all'} gyms...</Text>
                    </View>
                ) : gyms.length > 0 ? (
                    gyms.map((gym) => (
                        <TouchableOpacity key={gym._id} onPress={() => router.push({ pathname: '/member/gym-details', params: { id: gym._id } })}>
                            <GymCard
                                name={gym.name || "Unknown Gym"}
                                rating={gym.rating?.average || 0}
                                reviews={gym.rating?.count || 0}
                                distance="N/A"  // Actual distance calculation would require user location
                                price={gym.pricing?.perMonth ? `${gym.pricing.perMonth} birr` : "N/A"}
                            />
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noGymsText}>No gyms found{(useLocation ? ' nearby' : '')}</Text>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <UserBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
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
    contentContainer: {
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: "#111",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 20,
    },
    welcomeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    dateText: {
        color: "#aaa",
        fontSize: 12,
    },
    welcomeTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    editBtnText: {
        color: "#ff8c2b",
        fontSize: 12,
        fontWeight: "bold",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    avatarContainer: {
        position: 'relative',
    },
    statusDot: {
        position: 'absolute',
        bottom: 5,
        right: 8,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#aaa', // Or active/online color
        borderWidth: 2,
        borderColor: '#111',
    },
    userName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 2
    },
    userQuote: {
        color: "#888",
        fontSize: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statIconConfig: {
        padding: 8,
        borderRadius: 10,
    },
    statBadge: {
        backgroundColor: '#332211',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        height: 20,
    },
    statBadgeText: {
        color: '#ff8c2b',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
    },
    // Calendar Styles
    calendarContainer: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    calendarTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    calendarControls: {
        flexDirection: 'row',
        gap: 16,
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: 'bold',
        width: 32, // approx width per day
        textAlign: 'center',
    },
    calendarGrid: {
        gap: 8,
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayCell: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    dayCellSelected: {
        backgroundColor: '#ccc', // Selected day bg (light gray in design)
    },
    dayCellHighlighted: {
        backgroundColor: '#c5500a', // Orangebg for highlighted days
    },
    dayText: {
        color: '#888',
        fontSize: 14,
    },
    dayTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
    scanBtnContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    scanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    scanBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: '#ff8c2b',
        fontSize: 14,
        fontWeight: 'bold',
    },
    workoutCard: {
        height: 180,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
    },
    workoutBg: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
        backgroundColor: '#111', // fallback
    },
    workoutOverlay: {
        gap: 4
    },
    workoutMetaRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 4,
    },
    workoutMeta: {
        color: '#ccc',
        fontSize: 12,
    },
    workoutTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    workoutSubtitle: {
        color: '#ccc',
        fontSize: 14,
    },
    sessionCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 12,
    },
    sessionHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    sessionAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#221a11',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sessionRole: {
        color: '#888',
        fontSize: 12,
    },
    statusBadge: {
        backgroundColor: '#0f3a1e',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: '#00cc44',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sessionFooter: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 6,
    },
    sessionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sessionInfoText: {
        color: '#aaa',
        fontSize: 12,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#ff8c2b',
        fontSize: 16,
    },
    noGymsText: {
        color: '#888',
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
    },
    locationErrorContainer: {
        backgroundColor: '#332211',
        padding: 16,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
    },
    locationErrorText: {
        color: '#ff8c2b',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    useAllGymsText: {
        color: '#ff8c2b',
        fontSize: 14,
        fontWeight: 'bold',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickActionCard: {
        alignItems: 'center',
        flex: 1,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});
