import { Logo } from '@/components/Logo';
import { UserBottomNav } from '@/components/UserBottomNav';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

interface BackendExercise {
    _id: string;
    name: string;
    bodyPart: string;
    category: string;
}

interface PlanExercise {
    exerciseId: string | BackendExercise;
    sets: number;
    reps: number;
    order: number;
}

export default function DayPlanCustomizationScreen() {
    const router = useRouter();
    const { planId, dayNumber } = useLocalSearchParams();
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<any>(null);
    const [availableExercises, setAvailableExercises] = useState<BackendExercise[]>([]);

    // Day State
    const [dayTitle, setDayTitle] = useState('');
    const [selectedWorkouts, setSelectedWorkouts] = useState<PlanExercise[]>([]);

    // Modal State
    const [isDayModalVisible, setDayModalVisible] = useState(false);
    const [isWorkoutModalVisible, setWorkoutModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Temp State for Modals
    const [tempDayTitle, setTempDayTitle] = useState('');
    const [tempWorkoutSets, setTempWorkoutSets] = useState('');
    const [tempWorkoutReps, setTempWorkoutReps] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (token && planId) {
            fetchData();
        }
    }, [token, planId, dayNumber]);

    const fetchData = async () => {
        try {
            const planRes = await fetch(`${API_BASE_URL}/workout-plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const planData = await planRes.json();
            const foundPlan = planData.data.find((p: any) => p._id === planId);
            setPlan(foundPlan);

            if (foundPlan) {
                const day = foundPlan.days.find((d: any) => d.dayNumber === Number(dayNumber));
                if (day) {
                    setDayTitle(day.title || `Day ${dayNumber}`);
                    setSelectedWorkouts(day.exercises);
                }
            }

            const libRes = await fetch(`${API_BASE_URL}/exercises`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const libData = await libRes.json();
            setAvailableExercises(libData.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const updatedDays = plan.days.map((d: any) => {
                if (d.dayNumber === Number(dayNumber)) {
                    const cleanExercises = selectedWorkouts.map(e => ({
                        ...e,
                        exerciseId: typeof e.exerciseId === 'string' ? e.exerciseId : (e.exerciseId as BackendExercise)._id
                    }));
                    return { ...d, title: dayTitle, exercises: cleanExercises };
                }
                return d;
            });

            const response = await fetch(`${API_BASE_URL}/workout-plans/${planId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ days: updatedDays }),
            });

            const data = await response.json();
            if (data.success) {
                router.back();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddExercise = (exercise: BackendExercise) => {
        const newExercise: PlanExercise = {
            exerciseId: exercise,
            sets: 3,
            reps: 10,
            order: selectedWorkouts.length + 1
        };
        setSelectedWorkouts([...selectedWorkouts, newExercise]);
    };

    const openEditModal = (index: number) => {
        setEditingIndex(index);
        setTempWorkoutSets(selectedWorkouts[index].sets.toString());
        setTempWorkoutReps(selectedWorkouts[index].reps.toString());
        setWorkoutModalVisible(true);
    };

    const saveEditModal = () => {
        if (editingIndex === null) return;
        const newer = [...selectedWorkouts];
        newer[editingIndex] = {
            ...newer[editingIndex],
            sets: Number(tempWorkoutSets),
            reps: Number(tempWorkoutReps)
        };
        setSelectedWorkouts(newer);
        setWorkoutModalVisible(false);
    };

    const filteredExercises = availableExercises.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator color="#ff8c2b" /></View>;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Screen options={{
                    headerTitle: () => <Logo size={24} />,
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>
                    )
                }} />

                <View style={styles.curvedHeader}>
                    <View style={styles.headerTop}>
                        <Text style={styles.pageTitle}>{dayTitle}</Text>
                        <TouchableOpacity style={styles.titleEditBtn} onPress={() => { setTempDayTitle(dayTitle); setDayModalVisible(true); }}>
                            <Ionicons name="pencil" size={20} color="#ff8c2b" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subTitle}>Customize your workout for this day</Text>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Current Exercises</Text>
                    <View style={styles.selectedSection}>
                        {selectedWorkouts.length === 0 && <Text style={{ color: '#888', textAlign: 'center', marginVertical: 20 }}>No exercises added yet.</Text>}
                        {selectedWorkouts.map((workout, index) => {
                            const ex = typeof workout.exerciseId === 'string'
                                ? availableExercises.find(e => e._id === workout.exerciseId)
                                : workout.exerciseId as BackendExercise;

                            return (
                                <View key={index} style={styles.card}>
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.cardTitle}>{ex?.name || 'Exercise'}</Text>
                                            <Text style={styles.cardDetail}>{workout.sets} Sets x {workout.reps} Reps</Text>
                                            <Text style={styles.cardDetail}>{ex?.bodyPart} | {ex?.category}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 15 }}>
                                            <TouchableOpacity onPress={() => openEditModal(index)}>
                                                <Ionicons name="create-outline" size={26} color="#ff8c2b" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => {
                                                const n = [...selectedWorkouts];
                                                n.splice(index, 1);
                                                setSelectedWorkouts(n);
                                            }}>
                                                <Ionicons name="trash-outline" size={26} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.saveBtnWrapper} onPress={handleSave}>
                        <LinearGradient colors={['#ff8c2b', '#ff6b00']} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Save Day Plan</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Add From Library</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            placeholder="Search library..."
                            placeholderTextColor="#666"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View style={styles.availableSection}>
                        {filteredExercises.map((ex) => (
                            <TouchableOpacity key={ex._id} style={[styles.card, styles.cardAvailable]} onPress={() => handleAddExercise(ex)}>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle}>{ex.name}</Text>
                                        <Text style={styles.cardDetail}>{ex.bodyPart} | {ex.category}</Text>
                                    </View>
                                    <Ionicons name="add-circle" size={30} color="#ff8c2b" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Day Edit Modal */}
                <Modal visible={isDayModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Day Title</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.modalInput} value={tempDayTitle} onChangeText={setTempDayTitle} autoFocus />
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => setDayModalVisible(false)}>
                                    <View style={[styles.modalSaveBtn, { backgroundColor: '#333' }]}><Text style={styles.saveBtnText}>Cancel</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => { setDayTitle(tempDayTitle); setDayModalVisible(false); }}>
                                    <LinearGradient colors={['#ff8c2b', '#ff6b00']} style={styles.modalSaveBtn}>
                                        <Text style={styles.saveBtnText}>Apply</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Workout Edit Modal */}
                <Modal visible={isWorkoutModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Exercise</Text>
                            <Text style={styles.inputLabel}>Sets</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.modalInput} value={tempWorkoutSets} onChangeText={setTempWorkoutSets} keyboardType="numeric" />
                            </View>
                            <Text style={styles.inputLabel}>Reps</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.modalInput} value={tempWorkoutReps} onChangeText={setTempWorkoutReps} keyboardType="numeric" />
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => setWorkoutModalVisible(false)}>
                                    <View style={[styles.modalSaveBtn, { backgroundColor: '#333' }]}><Text style={styles.saveBtnText}>Cancel</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1 }} onPress={saveEditModal}>
                                    <LinearGradient colors={['#ff8c2b', '#ff6b00']} style={styles.modalSaveBtn}>
                                        <Text style={styles.saveBtnText}>Save</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <UserBottomNav />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    curvedHeader: { backgroundColor: '#111', padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 10 },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginRight: 10 },
    titleEditBtn: { padding: 5 },
    subTitle: { color: '#888', marginTop: 5 },
    content: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ff8c2b', marginVertical: 15 },
    selectedSection: { marginBottom: 10 },
    card: { backgroundColor: '#1a1a1a', borderRadius: 15, padding: 15, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#ff8c2b' },
    cardAvailable: { borderLeftWidth: 0, opacity: 0.9 },
    cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    cardDetail: { fontSize: 13, color: '#888', marginTop: 2 },
    saveBtnWrapper: { marginVertical: 10 },
    saveBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 },
    searchInput: { flex: 1, height: 50, color: '#fff', marginLeft: 10 },
    availableSection: { marginBottom: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#111', width: '85%', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
    inputLabel: { color: '#888', marginBottom: 5, marginTop: 10 },
    inputContainer: { backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 15 },
    modalInput: { height: 50, color: '#fff', fontSize: 16 },
    modalSaveBtn: { paddingVertical: 15, borderRadius: 10, alignItems: 'center' }
});
