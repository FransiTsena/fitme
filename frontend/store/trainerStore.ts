import { Platform } from 'react-native';
import { create } from 'zustand';

// API base URL - platform aware for emulators
const DEFAULT_API_BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3005/api',
    ios: 'http://127.0.0.1:3005/api',
    default: 'http://127.0.0.1:3005/api',
});
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

// Types
export interface TrainingSession {
    _id: string;
    trainerId: string;
    gymId: string;
    title: string;
    description?: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SessionBooking {
    _id: string;
    sessionId: {
        _id: string;
        title: string;
        durationMinutes: number;
        price: number;
    };
    trainerId: string;
    memberId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        profileImage?: string;
    };
    gymId: string;
    scheduledDate: string;
    timeSlot: string;
    status: 'booked' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface TrainerProfile {
    _id: string;
    userId: string;
    gymId: {
        _id: string;
        name: string;
        address: {
            city: string;
            area: string;
        };
    };
    specialization: string[];
    bio?: string;
    rating: {
        average: number;
        count: number;
    };
    isActive: boolean;
    promotedAt: string;
}

export interface TrainerStats {
    totalSessions: number;
    totalClients: number;
    upcomingBookings: number;
    completedBookings: number;
    totalEarnings: number;
    rating: number;
}

interface TrainerState {
    profile: TrainerProfile | null;
    sessions: TrainingSession[];
    bookings: SessionBooking[];
    stats: TrainerStats | null;
    loading: boolean;
    sessionsLoading: boolean;
    bookingsLoading: boolean;
    error: string | null;

    // Actions
    fetchTrainerProfile: (userId: string, token: string) => Promise<void>;
    fetchSessions: (token: string) => Promise<void>;
    fetchBookings: (token: string) => Promise<void>;
    fetchStats: (token: string) => Promise<void>;
    createSession: (sessionData: Partial<TrainingSession>, token: string) => Promise<{ success: boolean; error?: string }>;
    updateSession: (sessionId: string, data: Partial<TrainingSession>, token: string) => Promise<{ success: boolean; error?: string }>;
    toggleSessionStatus: (sessionId: string, isActive: boolean, token: string) => Promise<{ success: boolean; error?: string }>;
    updateBookingStatus: (bookingId: string, status: string, token: string) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (data: Partial<TrainerProfile>, token: string) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

const useTrainerStore = create<TrainerState>((set, get) => ({
    profile: null,
    sessions: [],
    bookings: [],
    stats: null,
    loading: false,
    sessionsLoading: false,
    bookingsLoading: false,
    error: null,

    fetchTrainerProfile: async (userId: string, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/trainers/profile/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch trainer profile');
            }

            set({
                profile: data.profile,
                loading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch trainer profile';
            set({ error: errorMessage, loading: false });
        }
    },

    fetchSessions: async (token: string) => {
        set({ sessionsLoading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/training-sessions/my-sessions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch sessions');
            }

            set({
                sessions: data.sessions || [],
                sessionsLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch sessions';
            set({ error: errorMessage, sessionsLoading: false });
        }
    },

    fetchBookings: async (token: string) => {
        set({ bookingsLoading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/trainer`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch bookings');
            }

            set({
                bookings: data.bookings || [],
                bookingsLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch bookings';
            set({ error: errorMessage, bookingsLoading: false });
        }
    },

    fetchStats: async (token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/trainers/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch stats');
            }

            set({
                stats: data.stats,
                loading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch stats';
            set({ error: errorMessage, loading: false });
        }
    },

    createSession: async (sessionData: Partial<TrainingSession>, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/training-sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(sessionData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create session');
            }

            // Add new session to the list
            const { sessions } = get();
            set({
                sessions: [...sessions, data.session],
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to create session';
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    updateSession: async (sessionId: string, updateData: Partial<TrainingSession>, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/training-sessions/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update session');
            }

            // Update session in the list
            const { sessions } = get();
            set({
                sessions: sessions.map(s => s._id === sessionId ? data.session : s),
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update session';
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    toggleSessionStatus: async (sessionId: string, isActive: boolean, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/training-sessions/${sessionId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update session status');
            }

            // Update session in the list
            const { sessions } = get();
            set({
                sessions: sessions.map(s => s._id === sessionId ? data.session : s),
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update session status';
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    updateBookingStatus: async (bookingId: string, status: string, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update booking status');
            }

            // Update booking in the list
            const { bookings } = get();
            set({
                bookings: bookings.map(b => b._id === bookingId ? { ...b, status: status as SessionBooking['status'] } : b),
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update booking status';
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    updateProfile: async (data: Partial<TrainerProfile>, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/trainers/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to update profile');
            }

            set({
                profile: responseData.profile,
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update profile';
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));

export default useTrainerStore;
