import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// Mock Data Interfaces
interface Workout {
    id: string;
    title: string;
    reps: string; // e.g., "18"
    sets: string; // e.g., "4"
    repsUnit: string; // e.g., "rp"
    setsUnit: string; // e.g., "s"
    image: any;
}

const INITIAL_SELECTED: Workout[] = [
    { id: '1', title: 'Back Workout', reps: '18', sets: '4', repsUnit: 'rp', setsUnit: 's', image: require('@/assets/images/gym-1.png') },
    { id: '2', title: 'Back Workout', reps: '18', sets: '4', repsUnit: 'rp', setsUnit: 's', image: require('@/assets/images/gym-1.png') },
];

const INITIAL_AVAILABLE: Workout[] = [
    { id: '3', title: 'Chest Workout', reps: '12', sets: '3', repsUnit: 'rp', setsUnit: 's', image: require('@/assets/images/gym-1.png') },
    { id: '4', title: 'Leg Workout', reps: '15', sets: '4', repsUnit: 'rp', setsUnit: 's', image: require('@/assets/images/gym-1.png') },
];

export default function DayPlanCustomizationScreen() {
    const { day } = useLocalSearchParams();

    // Day State
    const [dayTitle, setDayTitle] = useState(typeof day === 'string' ? day : 'DAY 1');
    const [daySubtitle, setDaySubtitle] = useState("Let's build your personalized workout plan");
    const [dayHours, setDayHours] = useState('3');
    const [dayHoursUnit, setDayHoursUnit] = useState('hr');

    const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>(INITIAL_SELECTED);
    const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>(INITIAL_AVAILABLE);

    // Modal State
    const [isDayModalVisible, setDayModalVisible] = useState(false);
    const [isWorkoutModalVisible, setWorkoutModalVisible] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

    // Temp State for Modals
    const [tempDayTitle, setTempDayTitle] = useState('');
    const [tempDayDesc, setTempDayDesc] = useState('');
    const [tempDayHours, setTempDayHours] = useState('');

    const [tempWorkoutTitle, setTempWorkoutTitle] = useState('');
    const [tempWorkoutSets, setTempWorkoutSets] = useState('');
    const [tempWorkoutReps, setTempWorkoutReps] = useState('');

    const handleAddWorkout = (workout: Workout) => {
        setAvailableWorkouts(prev => prev.filter(w => w.id !== workout.id));
        setSelectedWorkouts(prev => [...prev, workout]);
    };

    const handleRemoveWorkout = (workout: Workout) => {
        setSelectedWorkouts(prev => prev.filter(w => w.id !== workout.id));
        setAvailableWorkouts(prev => [...prev, workout]);
    };

    // Day Modal Handlers
    const openDayModal = () => {
        setTempDayTitle(dayTitle);
        setTempDayDesc(daySubtitle);
        setTempDayHours(dayHours);
        setDayModalVisible(true);
    };

    const saveDayModal = () => {
        setDayTitle(tempDayTitle);
        setDaySubtitle(tempDayDesc);
        setDayHours(tempDayHours);
        setDayModalVisible(false);
    };

    // Workout Modal Handlers
    const openWorkoutModal = (workout: Workout) => {
        setEditingWorkout(workout);
        setTempWorkoutTitle(workout.title);
        setTempWorkoutSets(workout.sets);
        setTempWorkoutReps(workout.reps);
        setWorkoutModalVisible(true);
    };

    const saveWorkoutModal = () => {
        if (!editingWorkout) return;

        const updateList = (list: Workout[]) => list.map(w =>
            w.id === editingWorkout.id
                ? { ...w, title: tempWorkoutTitle, sets: tempWorkoutSets, reps: tempWorkoutReps }
                : w
        );

        setSelectedWorkouts(prev => updateList(prev));
        setAvailableWorkouts(prev => updateList(prev));
        setWorkoutModalVisible(false);
        setEditingWorkout(null);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                    {/* Header Top: Back + Dynamic Title + Edit Icon */}
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.pageTitle}>{dayTitle}</Text>
                        <TouchableOpacity style={styles.titleEditBtn} onPress={openDayModal}>
                            <Ionicons name="pencil" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subTitle} numberOfLines={2}>{daySubtitle}</Text>

                    {/* Time Dropdown (Mock) */}
                    <TouchableOpacity style={styles.timeDropdown}>
                        <Text style={styles.timeText}>{dayHours} {dayHoursUnit}</Text>
                        <Ionicons name="chevron-down" size={16} color="#ccc" />
                        <Ionicons name="chevron-up" size={16} color="#ccc" style={{ marginLeft: -10 }} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Selected Workouts Section */}
                    {selectedWorkouts.length > 0 && (
                        <View style={styles.selectedSection}>
                            {selectedWorkouts.map((workout) => (
                                <SwipeableWorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    isAdded={true}
                                    onSwipe={() => handleRemoveWorkout(workout)}
                                    onEdit={() => openWorkoutModal(workout)}
                                />
                            ))}
                        </View>
                    )}

                    {/* Save Plan Button */}
                    <TouchableOpacity style={styles.saveBtnWrapper}>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff6b00']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveBtn}
                        >
                            <Text style={styles.saveBtnText}>Save Plan</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider Line */}
                    <View style={styles.divider} />

                    {/* All Workouts Section */}
                    <View style={styles.workoutsHeader}>
                        <Text style={styles.sectionTitle}>All Workouts</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#fff" />
                        <TextInput
                            placeholder="chest workout"
                            placeholderTextColor="#ccc"
                            style={styles.searchInput}
                            defaultValue="chest workout"
                        />
                        <TouchableOpacity>
                            <Ionicons name="pencil" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Available Workouts List */}
                    <View style={styles.availableSection}>
                        {availableWorkouts.map((workout) => (
                            <SwipeableWorkoutCard
                                key={workout.id}
                                workout={workout}
                                isAdded={false}
                                onSwipe={() => handleAddWorkout(workout)}
                                onEdit={() => openWorkoutModal(workout)}
                            />
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <UserBottomNav />

                {/* Day Edit Modal */}
                <Modal
                    visible={isDayModalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setDayModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setDayModalVisible(false)} style={styles.modalBackBtn}>
                                    <Ionicons name="arrow-undo" size={20} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Edit</Text>
                            </View>

                            <Text style={styles.inputLabel}>Title</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="information-circle-outline" size={20} color="#888" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.modalInput}
                                    value={tempDayTitle}
                                    onChangeText={setTempDayTitle}
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <Text style={styles.inputLabel}>Description</Text>
                            <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#888" style={{ marginRight: 8, marginTop: 2 }} />
                                <TextInput
                                    style={[styles.modalInput, { height: '100%', textAlignVertical: 'top' }]}
                                    value={tempDayDesc}
                                    onChangeText={setTempDayDesc}
                                    multiline
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <Text style={styles.inputLabel}>Hours</Text>
                            <View style={[styles.inputContainer, { width: 100 }]}>
                                <TextInput
                                    style={[styles.modalInput, { textAlign: 'center' }]}
                                    value={tempDayHours}
                                    onChangeText={setTempDayHours}
                                    keyboardType="numeric"
                                    placeholderTextColor="#666"
                                />
                                <Text style={styles.unitText}>hr</Text>
                            </View>

                            <TouchableOpacity style={styles.modalSaveBtnWrapper} onPress={saveDayModal}>
                                <LinearGradient
                                    colors={['#ff8c2b', '#ff6b00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.modalSaveBtn}
                                >
                                    <Text style={styles.saveBtnText}>Save</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveDayModal}>
                                <Text style={styles.modalSaveLink}>Don't Forget To <Text style={{ color: '#ff8c2b', fontWeight: 'bold' }}>Save</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Workout Edit Modal */}
                <Modal
                    visible={isWorkoutModalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setWorkoutModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setWorkoutModalVisible(false)} style={styles.modalBackBtn}>
                                    <Ionicons name="arrow-undo" size={20} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Edit</Text>
                            </View>

                            <Text style={styles.inputLabel}>Title</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="information-circle-outline" size={20} color="#888" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.modalInput}
                                    value={tempWorkoutTitle}
                                    onChangeText={setTempWorkoutTitle}
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                <View>
                                    <Text style={styles.inputLabel}>Sets</Text>
                                    <View style={[styles.inputContainer, { width: 100 }]}>
                                        <TextInput
                                            style={[styles.modalInput, { textAlign: 'center' }]}
                                            value={tempWorkoutSets}
                                            onChangeText={setTempWorkoutSets}
                                            keyboardType="numeric"
                                            placeholderTextColor="#666"
                                        />
                                        <Text style={[styles.unitText, { color: '#ff8c2b' }]}>s</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={styles.inputLabel}>Reps</Text>
                                    <View style={[styles.inputContainer, { width: 100 }]}>
                                        <TextInput
                                            style={[styles.modalInput, { textAlign: 'center' }]}
                                            value={tempWorkoutReps}
                                            onChangeText={setTempWorkoutReps}
                                            keyboardType="numeric"
                                            placeholderTextColor="#666"
                                        />
                                        <Text style={[styles.unitText, { color: '#ff8c2b' }]}>rp</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.modalSaveBtnWrapper} onPress={saveWorkoutModal}>
                                <LinearGradient
                                    colors={['#ff8c2b', '#ff6b00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.modalSaveBtn}
                                >
                                    <Text style={styles.saveBtnText}>Save Plan</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveWorkoutModal}>
                                <Text style={styles.modalSaveLink}>Don't Forget To <Text style={{ color: '#ff8c2b', fontWeight: 'bold' }}>Save</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </GestureHandlerRootView>
    );
}

function SwipeableWorkoutCard({ workout, isAdded, onSwipe, onEdit }: { workout: Workout, isAdded: boolean, onSwipe: () => void, onEdit: () => void }) {
    const renderRightActions = (progress: any, dragX: any) => {
        if (!isAdded) return null;
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });
        return (
            <View style={styles.rightActionContainer}>
                <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
                    <Ionicons name="trash-outline" size={30} color="#fff" />
                </Animated.View>
            </View>
        );
    };

    const renderLeftActions = (progress: any, dragX: any) => {
        if (isAdded) return null;
        const trans = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [-100, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={styles.leftActionContainer}>
                <Animated.View style={[styles.leftAction, { transform: [{ translateX: trans }] }]}>
                    <Ionicons name="add-circle-outline" size={30} color="#fff" />
                </Animated.View>
            </View>
        );
    };

    return (
        <Swipeable
            renderRightActions={isAdded ? renderRightActions : undefined}
            renderLeftActions={!isAdded ? renderLeftActions : undefined}
            onSwipeableOpen={(direction) => {
                if (direction === 'left' && !isAdded) onSwipe();
                if (direction === 'right' && isAdded) onSwipe();
            }}
        >
            <View style={[styles.card, !isAdded && styles.cardAvailable]}>
                <View style={styles.cardContent}>
                    <Image source={workout.image} style={styles.cardImage} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{workout.title}</Text>
                        <Text style={styles.cardDetail}>{workout.reps}x {workout.repsUnit}</Text>
                        <Text style={styles.cardDetail}>{workout.sets}x {workout.setsUnit}</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
                        <Ionicons name="pencil" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Swipeable>
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    titleEditBtn: {
        padding: 5,
    },
    subTitle: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 15,
    },
    timeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        gap: 5
    },
    timeText: {
        color: '#fff',
        marginRight: 5,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 0,
    },
    selectedSection: {
        gap: 15,
        marginBottom: 20,
    },
    saveBtnWrapper: {
        marginVertical: 10,
        shadowColor: "#ff8c2b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    saveBtn: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 20,
    },
    workoutsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    availableSection: {
        gap: 15,
    },
    card: {
        backgroundColor: '#1c1c1e',
        borderRadius: 30,
        padding: 12,
        marginBottom: 10,
    },
    cardAvailable: {
        backgroundColor: '#0a0a0a',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardImage: {
        width: 70,
        height: 70,
        borderRadius: 16,
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
        marginBottom: 4,
    },
    cardDetail: {
        color: '#888',
        fontSize: 13,
        marginBottom: 2,
    },
    editBtn: {
        padding: 5,
        alignSelf: 'flex-start'
    },
    rightActionContainer: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
    },
    rightAction: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftActionContainer: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#22c55e',
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        marginBottom: 10,
    },
    leftAction: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)', // Darker overlay for focus
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#1c1c1e',
        borderRadius: 24,
        padding: 24,
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalBackBtn: {
        backgroundColor: '#ff8c2b',
        width: 32,
        height: 32,
        borderRadius: 10, // Matching the square-ish rounded look
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    inputLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 20,
    },
    modalInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    unitText: {
        color: '#ff8c2b',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    modalSaveBtnWrapper: {
        marginTop: 10,
        marginBottom: 16,
        shadowColor: "#ff8c2b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    modalSaveBtn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalSaveLink: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
    },
});
