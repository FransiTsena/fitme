import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import useTrainerStore, { SessionBooking } from "@/store/trainerStore";
export default function ScheduleScreen() {
    const { token } = useAuth();
    const { 
        bookings, 
        bookingsLoading, 
        fetchBookings,
        updateBookingStatus,
        loading
    } = useTrainerStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState<'all' | 'booked' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        if (token) {
            fetchBookings(token);
        }
    }, [token, fetchBookings]);

    const onRefresh = async () => {
        if (!token) return;
        setRefreshing(true);
        await fetchBookings(token);
        setRefreshing(false);
    };

    // Generate week dates
    const weekDates = useMemo(() => {
        const dates = [];
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [selectedDate]);

    // Filter bookings by selected date
    const filteredBookings = useMemo(() => {
        let result = bookings.filter(b => {
            const bookingDate = new Date(b.scheduledDate);
            return bookingDate.toDateString() === selectedDate.toDateString();
        });

        if (filter !== 'all') {
            result = result.filter(b => b.status === filter);
        }

        return result.sort((a, b) => {
            const timeA = a.timeSlot.split('-')[0];
            const timeB = b.timeSlot.split('-')[0];
            return timeA.localeCompare(timeB);
        });
    }, [bookings, selectedDate, filter]);

    // Get booking counts for each day
    const getBookingCount = (date: Date) => {
        return bookings.filter(b => {
            const bookingDate = new Date(b.scheduledDate);
            return bookingDate.toDateString() === date.toDateString() && b.status === 'booked';
        }).length;
    };

    const handleStatusChange = (booking: SessionBooking, newStatus: 'completed' | 'cancelled') => {
        if (!token) return;

        const action = newStatus === 'completed' ? 'mark as completed' : 'cancel';
        
        Alert.alert(
            `${newStatus === 'completed' ? 'Complete' : 'Cancel'} Session`,
            `Are you sure you want to ${action} this session?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        const result = await updateBookingStatus(booking._id, newStatus, token);
                        if (result.success) {
                            Alert.alert('Success', `Session ${newStatus}!`);
                        }
                    }
                }
            ]
        );
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatTime = (timeSlot: string) => {
        return timeSlot;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'booked': return '#ff8c2b';
            case 'completed': return '#00cc44';
            case 'cancelled': return '#ff4444';
            default: return '#666';
        }
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                }}
            />

            {/* Month Navigator */}
            <View style={styles.monthNavigator}>
                <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.monthInfo}>
                    <Text style={styles.monthText}>
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </Text>
                    <TouchableOpacity 
                        onPress={() => setSelectedDate(new Date())}
                        style={styles.todayButton}
                    >
                        <Text style={styles.todayButtonText}>Today</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Week Calendar */}
            <View style={styles.weekCalendar}>
                {weekDates.map((date, index) => {
                    const bookingCount = getBookingCount(date);
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const today = isToday(date);

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayColumn,
                                isSelected && styles.dayColumnSelected,
                            ]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                                {dayNames[date.getDay()]}
                            </Text>
                            <View style={[
                                styles.dateCircle,
                                isSelected && styles.dateCircleSelected,
                                today && !isSelected && styles.dateCircleToday,
                            ]}>
                                <Text style={[
                                    styles.dateNumber,
                                    isSelected && styles.dateNumberSelected,
                                    today && !isSelected && styles.dateNumberToday,
                                ]}>
                                    {date.getDate()}
                                </Text>
                            </View>
                            {bookingCount > 0 && (
                                <View style={styles.bookingDot}>
                                    <Text style={styles.bookingDotText}>{bookingCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['all', 'booked', 'completed', 'cancelled'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bookings List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff8c2b" />
                }
            >
                {bookingsLoading ? (
                    <ActivityIndicator size="large" color="#ff8c2b" style={{ marginTop: 50 }} />
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <View key={booking._id} style={styles.bookingCard}>
                            <View style={styles.timeColumn}>
                                <Text style={styles.timeText}>{formatTime(booking.timeSlot)}</Text>
                            </View>
                            
                            <View style={[styles.bookingContent, { borderLeftColor: getStatusColor(booking.status) }]}>
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.sessionTitle}>
                                        {typeof booking.sessionId === 'object' ? booking.sessionId.title : 'Training Session'}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '30' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                                            {booking.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.clientRow}>
                                    <View style={styles.clientAvatar}>
                                        <Ionicons name="person" size={16} color="#fff" />
                                    </View>
                                    <Text style={styles.clientName}>
                                        {typeof booking.memberId === 'object' ? booking.memberId.name : 'Client'}
                                    </Text>
                                </View>

                                <View style={styles.sessionMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time-outline" size={14} color="#888" />
                                        <Text style={styles.metaText}>
                                            {typeof booking.sessionId === 'object' ? `${booking.sessionId.durationMinutes} min` : '60 min'}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="cash-outline" size={14} color="#888" />
                                        <Text style={styles.metaText}>
                                            ETB {typeof booking.sessionId === 'object' ? booking.sessionId.price : '0'}
                                        </Text>
                                    </View>
                                </View>

                                {booking.status === 'booked' && (
                                    <View style={styles.bookingActions}>
                                        <TouchableOpacity
                                            style={styles.completeButton}
                                            onPress={() => handleStatusChange(booking, 'completed')}
                                            disabled={loading}
                                        >
                                            <Ionicons name="checkmark-circle" size={16} color="#000" />
                                            <Text style={styles.completeButtonText}>Complete</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => handleStatusChange(booking, 'cancelled')}
                                            disabled={loading}
                                        >
                                            <Ionicons name="close-circle" size={16} color="#ff4444" />
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#333" />
                        <Text style={styles.emptyTitle}>No Sessions</Text>
                        <Text style={styles.emptySubtext}>
                            No {filter !== 'all' ? filter : ''} sessions scheduled for this date
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/clients" as any)}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Clients</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/sessions" as any)}>
                    <Ionicons name="fitness-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar" size={24} color="#ff8c2b" />
                    <Text style={[styles.navText, styles.navTextActive]}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/trainer/profile")}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    monthNavigator: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    navButton: {
        padding: 8,
    },
    monthInfo: {
        alignItems: "center",
    },
    monthText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    todayButton: {
        marginTop: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "#ff8c2b20",
        borderRadius: 12,
    },
    todayButtonText: {
        fontSize: 12,
        color: "#ff8c2b",
        fontWeight: "600",
    },
    weekCalendar: {
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    dayColumn: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        borderRadius: 12,
    },
    dayColumnSelected: {
        backgroundColor: "#ff8c2b20",
    },
    dayName: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    dayNameSelected: {
        color: "#ff8c2b",
    },
    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    dateCircleSelected: {
        backgroundColor: "#ff8c2b",
    },
    dateCircleToday: {
        borderWidth: 2,
        borderColor: "#ff8c2b",
    },
    dateNumber: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    dateNumberSelected: {
        color: "#000",
    },
    dateNumberToday: {
        color: "#ff8c2b",
    },
    bookingDot: {
        backgroundColor: "#ff8c2b",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 6,
    },
    bookingDotText: {
        fontSize: 10,
        color: "#fff",
        fontWeight: "bold",
    },
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#111",
    },
    filterTabActive: {
        backgroundColor: "#ff8c2b",
    },
    filterTabText: {
        fontSize: 13,
        color: "#888",
        fontWeight: "500",
    },
    filterTabTextActive: {
        color: "#000",
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    bookingCard: {
        flexDirection: "row",
        marginBottom: 15,
    },
    timeColumn: {
        width: 70,
        paddingTop: 12,
    },
    timeText: {
        fontSize: 13,
        color: "#888",
        fontWeight: "500",
    },
    bookingContent: {
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 15,
        borderLeftWidth: 4,
    },
    bookingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    clientRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    clientAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#ff8c2b",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    clientName: {
        fontSize: 14,
        color: "#ccc",
    },
    sessionMeta: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: "#888",
    },
    bookingActions: {
        flexDirection: "row",
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: "#222",
        paddingTop: 12,
    },
    completeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00cc44",
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    completeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    cancelButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff444420",
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ff4444",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#666",
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#444",
        marginTop: 8,
        textAlign: "center",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: "center",
    },
    navText: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    navTextActive: {
        color: "#ff8c2b",
    },
});
