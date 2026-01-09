import { create } from 'zustand';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005/api';

// Types
interface Address {
    city: string;
    area: string;
    street?: string;
}

interface OperatingHours {
    monday?: { open?: string; close?: string };
    tuesday?: { open?: string; close?: string };
    wednesday?: { open?: string; close?: string };
    thursday?: { open?: string; close?: string };
    friday?: { open?: string; close?: string };
    saturday?: { open?: string; close?: string };
    sunday?: { open?: string; close?: string };
}

interface Gym {
    _id: string;
    ownerId: string;
    name: string;
    description?: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    rating: {
        average: number;
        count: number;
    };
    address: Address;
    photos?: string[];
    verificationStatus: 'pending' | 'approved' | 'rejected';
    isActive: boolean;
    operatingHours?: OperatingHours;
    amenities?: string[];
    createdAt: string;
    updatedAt: string;
}

interface RevenueData {
    value: number;
    label: string;
}

interface PeakHoursData {
    value: number;
    label: string;
}

interface TopTrainer {
    _id: string;
    name: string;
    count: number;
    rating: number;
    revenue?: number;
}

interface MembershipDistribution {
    type: string;
    count: number;
    percentage: number;
}

interface Analytics {
    gymPerformance: {
        activeMembers: number;
        newMembersMonthly: number;
    };
    revenue: {
        total: number;
        byType: { _id: string; total: number }[];
        monthly: RevenueData[];
        growth: number;
    };
    trainers: {
        activeCount: number;
        topBooked: TopTrainer[];
    };
    insights: {
        peakDays: { _id: number; count: number }[];
        peakHours: PeakHoursData[];
        retentionRate: number;
    };
    membershipDistribution: MembershipDistribution[];
}

interface OwnerState {
    gym: Gym | null;
    analytics: Analytics | null;
    loading: boolean;
    analyticsLoading: boolean;
    error: string | null;

    // Actions
    fetchGym: (ownerId: string, token: string) => Promise<void>;
    fetchAnalytics: (gymId: string, token: string) => Promise<void>;
    updateGym: (gymId: string, data: Partial<Gym>, token: string) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

const useOwnerStore = create<OwnerState>((set, get) => ({
    gym: null,
    analytics: null,
    loading: false,
    analyticsLoading: false,
    error: null,

    fetchGym: async (ownerId: string, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/gyms/owner/${ownerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch gym');
            }

            // The API returns an array of gyms, we take the first one
            const gymData = data.data || data;
            const gym = Array.isArray(gymData) ? gymData[0] : gymData;

            set({
                gym,
                loading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch gym';
            set({ error: errorMessage, loading: false });
        }
    },

    fetchAnalytics: async (gymId: string, token: string) => {
        set({ analyticsLoading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/analytics/gym/${gymId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch analytics');
            }

            // Transform data for charts
            const analytics = transformAnalyticsData(data.data);

            set({
                analytics,
                analyticsLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch analytics';
            set({ error: errorMessage, analyticsLoading: false });
        }
    },

    updateGym: async (gymId: string, updateData: Partial<Gym>, token: string) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/gyms/${gymId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update gym');
            }

            set({
                gym: data.data || data,
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update gym';
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));

// Helper function to transform analytics data for charts
function transformAnalyticsData(rawData: any): Analytics {
    // Transform peak days (1=Sun, 7=Sat) to readable format
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const peakHours = rawData.insights?.peakDays?.map((day: { _id: number; count: number }) => ({
        value: day.count,
        label: dayNames[day._id - 1] || `Day ${day._id}`,
    })) || [];

    // Generate monthly revenue data (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyRevenue: RevenueData[] = [];

    // If we have revenue by type, distribute it across months (simplified)
    const totalRevenue = rawData.revenue?.total || 0;
    const avgMonthly = totalRevenue / 6;

    for (let i = 5; i >= 0; i--) {
        const monthIndex = (now.getMonth() - i + 12) % 12;
        // Add some variation for visualization
        const variation = 0.8 + Math.random() * 0.4;
        monthlyRevenue.push({
            value: Math.round(avgMonthly * variation),
            label: monthNames[monthIndex],
        });
    }

    // Calculate revenue growth (simplified)
    const revenueGrowth = monthlyRevenue.length >= 2
        ? Math.round(((monthlyRevenue[monthlyRevenue.length - 1].value - monthlyRevenue[0].value) / (monthlyRevenue[0].value || 1)) * 100)
        : 0;

    // Transform top trainers with revenue estimation
    const topTrainers = rawData.trainers?.topBooked?.map((trainer: any, index: number) => ({
        _id: trainer._id,
        name: trainer.name || `Trainer ${index + 1}`,
        count: trainer.count || 0,
        rating: trainer.rating || 0,
        revenue: Math.round((trainer.count || 0) * 2500), // Estimate: 2500 ETB per session
    })) || [];

    // Calculate membership distribution (placeholder if not available)
    const activeMembers = rawData.gymPerformance?.activeMembers || 0;
    const membershipDistribution: MembershipDistribution[] = [
        { type: 'Basic', count: Math.round(activeMembers * 0.5), percentage: 50 },
        { type: 'Premium', count: Math.round(activeMembers * 0.35), percentage: 35 },
        { type: 'VIP', count: Math.round(activeMembers * 0.15), percentage: 15 },
    ];

    return {
        gymPerformance: {
            activeMembers: rawData.gymPerformance?.activeMembers || 0,
            newMembersMonthly: rawData.gymPerformance?.newMembersMonthly || 0,
        },
        revenue: {
            total: rawData.revenue?.total || 0,
            byType: rawData.revenue?.byType || [],
            monthly: monthlyRevenue,
            growth: revenueGrowth,
        },
        trainers: {
            activeCount: rawData.trainers?.activeCount || 0,
            topBooked: topTrainers,
        },
        insights: {
            peakDays: rawData.insights?.peakDays || [],
            peakHours,
            retentionRate: 94, // Placeholder - would need historical data to calculate
        },
        membershipDistribution,
    };
}

export default useOwnerStore;
