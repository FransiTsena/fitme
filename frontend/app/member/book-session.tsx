import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

// Time slots available for booking
const TIME_SLOTS = [
    '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
    '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'
];

export default function BookSessionScreen() {
    const { user, token } = useAuth();
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    // Generate next 7 days for date selection
    const getAvailableDates = () => {
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const availableDates = getAvailableDates();

    // Fetch session details from API
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/training-sessions/${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSession(data.session || data.data || data);
                } else {
                    console.error('Failed to fetch session:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchSession();
        }
    }, [token, sessionId]);

    const formatDate = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
            day: days[date.getDay()],
            date: date.getDate(),
            month: months[date.getMonth()],
        };
    };

    const handleBookSession = async () => {
        if (!selectedDate || !selectedTimeSlot) {
            Alert.alert('Select Date & Time', 'Please select a date and time slot for your session.');
            return;
        }

        setBooking(true);
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/book`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    date: selectedDate.toISOString(),
                    timeSlot: selectedTimeSlot
                }),
            });

            if (response.ok) {
                await response.json();
                Alert.alert(
                    'Booking Confirmed! 🎉',
                    `Your session has been booked for ${formatDate(selectedDate).month} ${formatDate(selectedDate).date} at ${selectedTimeSlot}.`,
                    [{ text: 'View My Bookings', onPress: () => router.push('/member/my-bookings') }]
                );
            } else {
                const errorData = await response.json();
                Alert.alert('Booking Failed', errorData.error || 'Failed to book session');
            }
        } catch (error) {
            console.error('Error booking session:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setBooking(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
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

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff8c2b" />
                        <Text style={styles.loadingText}>Loading session...</Text>
                    </View>
                ) : session ? (
                    <>
                        {/* Session Info Card */}
                        <View style={styles.sessionCard}>
                            <View style={styles.sessionHeader}>
                                <View style={styles.sessionIcon}>
                                    <Ionicons name="barbell" size={28} color="#ff8c2b" />
                                </View>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionTitle}>{session.title}</Text>
                                    <Text style={styles.sessionPrice}>{session.price} ETB</Text>
                                </View>
                            </View>
                            {session.description && (
                                <Text style={styles.sessionDescription}>{session.description}</Text>
                            )}
                            <View style={styles.sessionMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={18} color="#888" />
                                    <Text style={styles.metaText}>{session.durationMinutes} min</Text>
                                </View>
                            </View>
                        </View>

                        {/* Date Selection */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Date</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.datesContainer}
                            >
                                {availableDates.map((date, index) => {
                                    const formatted = formatDate(date);
                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                                            onPress={() => setSelectedDate(date)}
                                        >
                                            <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                                                {formatted.day}
                                            </Text>
                                            <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                                                {formatted.date}
                                            </Text>
                                            <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                                                {formatted.month}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Time Slot Selection */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Time</Text>
                            <View style={styles.timeSlotsContainer}>
                                {TIME_SLOTS.map((slot, index) => {
                                    const isSelected = selectedTimeSlot === slot;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                                            onPress={() => setSelectedTimeSlot(slot)}
                                        >
                                            <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                                                {slot}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Booking Summary */}
                        {selectedDate && selectedTimeSlot && (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Booking Summary</Text>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Session</Text>
                                    <Text style={styles.summaryValue}>{session.title}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Date</Text>
                                    <Text style={styles.summaryValue}>
                                        {formatDate(selectedDate).month} {formatDate(selectedDate).date}
                                    </Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Time</Text>
                                    <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>{session.price} ETB</Text>
                                </View>
                            </View>
                        )}

                        {/* Book Button */}
                        <TouchableOpacity
                            style={[
                                styles.bookButton,
                                (!selectedDate || !selectedTimeSlot) && styles.bookButtonDisabled
                            ]}
                            onPress={handleBookSession}
                            disabled={booking || !selectedDate || !selectedTimeSlot}
                        >
                            <LinearGradient
                                colors={selectedDate && selectedTimeSlot ? ['#ff8c2b', '#ff5500'] : ['#444', '#333']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.bookButtonGradient}
                            >
                                {booking ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.bookButtonText}>Confirm Booking</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
                        <Text style={styles.errorTitle}>Session Not Found</Text>
                        <Text style={styles.errorText}>
                            This session may no longer be available.
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        color: '#888',
        marginTop: 12,
    },
    sessionCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#222',
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sessionIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#ff8c2b20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    sessionPrice: {
        fontSize: 18,
        color: '#ff8c2b',
        fontWeight: '600',
        marginTop: 4,
    },
    sessionDescription: {
        color: '#888',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    sessionMeta: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#888',
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    datesContainer: {
        paddingVertical: 4,
        gap: 10,
    },
    dateCard: {
        width: 70,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        alignItems: 'center',
        marginRight: 10,
    },
    dateCardSelected: {
        backgroundColor: '#ff8c2b',
        borderColor: '#ff8c2b',
    },
    dateDay: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
    },
    dateNumber: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    dateMonth: {
        color: '#888',
        fontSize: 12,
    },
    dateTextSelected: {
        color: '#fff',
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    timeSlot: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
    },
    timeSlotSelected: {
        backgroundColor: '#ff8c2b',
        borderColor: '#ff8c2b',
    },
    timeSlotText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    timeSlotTextSelected: {
        color: '#fff',
    },
    summaryCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#ff8c2b40',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryLabel: {
        color: '#888',
        fontSize: 14,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    totalLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        color: '#ff8c2b',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bookButton: {
        marginBottom: 20,
    },
    bookButtonDisabled: {
        opacity: 0.6,
    },
    bookButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    errorText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
    },
    backButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#222',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});