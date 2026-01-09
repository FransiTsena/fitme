import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { useAuth } from "@/context/AuthContext";
import useOwnerStore from "@/store/ownerStore";

const screenWidth = Dimensions.get("window").width;

export default function OwnerProfileScreen() {
    const [activeTab, setActiveTab] = useState("Profile");
    const { user, token } = useAuth();
    const { gym, analytics, loading, analyticsLoading, error, fetchGym, fetchAnalytics, updateGym, clearError } = useOwnerStore();

    // Form state for editing
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        area: '',
        description: '',
    });

    // Fetch gym data on mount
    useEffect(() => {
        if (user?.id && token) {
            fetchGym(user.id, token);
        }
    }, [user?.id, token]);

    // Fetch analytics when gym is loaded
    useEffect(() => {
        if (gym?._id && token) {
            fetchAnalytics(gym._id, token);
        }
    }, [gym?._id, token]);

    // Update form when gym data loads
    useEffect(() => {
        if (gym) {
            setFormData({
                name: gym.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: gym.address?.street || '',
                area: gym.address?.area || '',
                description: gym.description || '',
            });
        }
    }, [gym, user]);

    // Handle errors
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
        }
    }, [error]);

    // Save changes handler
    const handleSaveChanges = async () => {
        if (!gym?._id || !token) return;

        const updateData = {
            name: formData.name,
            description: formData.description,
            address: {
                city: gym.address?.city || '',
                area: formData.area,
                street: formData.address,
            },
        };

        const result = await updateGym(gym._id, updateData, token);
        if (result.success) {
            Alert.alert('Success', 'Profile updated successfully');
        }
    };

    // Chart data from analytics or defaults
    const revenueData = analytics?.revenue?.monthly || [
        { value: 0, label: 'Jul' },
        { value: 0, label: 'Aug' },
        { value: 0, label: 'Sep' },
        { value: 0, label: 'Oct' },
        { value: 0, label: 'Nov' },
        { value: 0, label: 'Dec' },
    ];

    const peakHoursData = analytics?.insights?.peakHours?.length ? analytics.insights.peakHours : [
        { value: 0, label: 'Mon' },
        { value: 0, label: 'Tue' },
        { value: 0, label: 'Wed' },
        { value: 0, label: 'Thu' },
        { value: 0, label: 'Fri' },
        { value: 0, label: 'Sat' },
        { value: 0, label: 'Sun' },
    ];

    // Format member since date
    const memberSince = gym?.createdAt 
        ? new Date(gym.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A';

    // Membership distribution from analytics
    const membershipDistribution = analytics?.membershipDistribution || [
        { type: 'Basic', count: 0, percentage: 0 },
        { type: 'Premium', count: 0, percentage: 0 },
        { type: 'VIP', count: 0, percentage: 0 },
    ];

    // Top trainers from analytics
    const topTrainers = analytics?.trainers?.topBooked || [];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Stack.Screen
                options={{
                    headerTitle: () => <Logo size={24} />,
                    headerLeft: () => null,
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/owner-menu")}>
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

            <View style={styles.tabsContainer}>
                {["Profile", "Stats", "Settings"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff8c2b" />
                        <Text style={styles.loadingText}>Loading profile...</Text>
                    </View>
                ) : (
                <>
                {/* Profile Header */}
                <View style={styles.profileHeaderCard}>
                    <View style={styles.avatarRow}>
                        <View>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person-circle-outline" size={80} color="#ff8c2b" />
                                <TouchableOpacity style={styles.cameraBtn}>
                                    <Ionicons name="camera" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.gymNameLarge}>{gym?.name || 'Your Gym'}</Text>
                            <Text style={styles.memberSince}>Member since {memberSince}</Text>
                            <View style={[styles.activeBadge, !gym?.isActive && styles.inactiveBadge]}>
                                <Text style={[styles.activeText, !gym?.isActive && styles.inactiveText]}>
                                    {gym?.isActive ? 'Active' : gym?.verificationStatus || 'Pending'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Gym Name</Text>
                        <TextInput 
                            style={styles.input} 
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Enter gym name"
                            placeholderTextColor="#666"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Email</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="mail-outline" size={16} color="#888" />
                                    <TextInput 
                                        style={styles.inputInner} 
                                        value={formData.email}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                        editable={false}
                                        placeholder="Email"
                                        placeholderTextColor="#666"
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.label}>Phone number</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="call-outline" size={16} color="#888" />
                                    <TextInput 
                                        style={styles.inputInner} 
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                        placeholder="Phone"
                                        placeholderTextColor="#666"
                                    />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="location-outline" size={16} color="#888" />
                            <TextInput 
                                style={styles.inputInner} 
                                value={formData.address}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                placeholder="Street address"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <Text style={styles.label}>Sub-City</Text>
                        <TouchableOpacity style={styles.dropdown}>
                            <Text style={{ color: formData.area ? '#fff' : '#666' }}>
                                {formData.area || 'Select sub-city'}
                            </Text>
                            <Ionicons name="caret-down-outline" size={16} color="#888" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            placeholder="Describe your gym..."
                            placeholderTextColor="#666"
                        />
                    </View>

                    <TouchableOpacity onPress={handleSaveChanges} disabled={loading}>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Business Analytics (Charts) */}
                <View style={styles.sectionContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="stats-chart" size={18} color="#ff8c2b" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Business Analytics</Text>
                        {analyticsLoading && <ActivityIndicator size="small" color="#ff8c2b" style={{ marginLeft: 10 }} />}
                    </View>

                    <View style={styles.analyticsRow}>
                        <View style={styles.analyticsCard}>
                            <View style={styles.analyticsHeader}>
                                <View style={styles.analyticsIconBg}><Ionicons name="trending-up" size={18} color="#00cc44" /></View>
                                <View>
                                    <Text style={styles.analyticsLabel}>Revenue Growth</Text>
                                    <Text style={styles.analyticsValue_Green}>
                                        {analytics?.revenue?.growth !== undefined ? `${analytics.revenue.growth > 0 ? '+' : ''}${analytics.revenue.growth}%` : '--'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.analyticsSub}>Last 6 months</Text>
                        </View>

                        <View style={styles.analyticsCard}>
                            <View style={styles.analyticsHeader}>
                                <View style={[styles.analyticsIconBg, { backgroundColor: '#332211' }]}><Ionicons name="people" size={18} color="#ff8c2b" /></View>
                                <View>
                                    <Text style={styles.analyticsLabel}>Retention Rate</Text>
                                    <Text style={styles.analyticsValue_Green}>
                                        {analytics?.insights?.retentionRate !== undefined ? `${analytics.insights.retentionRate}%` : '--'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.analyticsSub}>Member retention</Text>
                        </View>
                    </View>

                    {/* Monthly Revenue Line Chart */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Monthly Revenue (ETB)</Text>
                        <View style={{ marginTop: 20 }}>
                            <LineChart
                                data={revenueData}
                                width={screenWidth - 120}
                                color="#ff8c2b"
                                thickness={3}
                                dataPointsColor="#ff8c2b"
                                startFillColor="rgba(255, 140, 43, 0.3)"
                                endFillColor="rgba(255, 140, 43, 0.01)"
                                startOpacity={0.4}
                                endOpacity={0.1}
                                initialSpacing={20}
                                noOfSections={4}
                                yAxisTextStyle={{ color: '#888', fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: '#888', fontSize: 10 }}
                                rulesColor="#333"
                                rulesType="dashed"
                                hideDataPoints={false}
                                curved
                                areaChart
                                height={200}
                            />
                        </View>
                    </View>

                    {/* Peak Hours Bar Chart */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Peak Hours</Text>
                        <View style={{ marginTop: 20 }}>
                            <BarChart
                                data={peakHoursData}
                                width={screenWidth - 120}
                                barWidth={24}
                                spacing={14}
                                roundedTop
                                roundedBottom
                                frontColor="#ff8c2b"
                                xAxisLabelTextStyle={{ color: '#888', fontSize: 9, width: 50, textAlign: 'center', marginLeft: -20 }}
                                yAxisTextStyle={{ color: '#888', fontSize: 10 }}
                                noOfSections={4}
                                rulesColor="#333"
                                rulesType="dashed"
                                height={180}
                                labelWidth={40}
                                dashGap={10}
                            />
                        </View>
                    </View>
                </View>

                {/* Membership Distribution */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Membership Distribution</Text>
                    {membershipDistribution.map((membership, index) => (
                        <View key={index} style={styles.distRow}>
                            <View>
                                <Text style={styles.distLabel}>{membership.type}</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[
                                        styles.progressBarFill, 
                                        { 
                                            width: `${membership.percentage}%`, 
                                            backgroundColor: index === 0 ? '#888' : index === 1 ? '#ff8c2b' : '#00cc44' 
                                        }
                                    ]} />
                                </View>
                            </View>
                            <Text style={styles.distCount}>{membership.count} members</Text>
                        </View>
                    ))}
                </View>

                {/* Top Trainers */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Top Trainers</Text>
                    {topTrainers.length > 0 ? (
                        topTrainers.slice(0, 4).map((trainer, i) => {
                            const medalColors = [
                                { bg: "#C9B037", text: "#5D4037" },
                                { bg: "#B4B4B4", text: "#333" },
                                { bg: "#AD8A56", text: "#3E2723" },
                                { bg: "#332211", text: "#ff8c2b" },
                            ];
                            const medal = medalColors[i] || medalColors[3];
                            
                            return (
                                <View key={trainer._id || i} style={styles.rankingCard}>
                                    <View style={[styles.rankBadge, { backgroundColor: medal.bg }]}>
                                        <Text style={[styles.rankText, { color: medal.text }]}>#{i + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.rankName}>{trainer.name}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={styles.rankClients}>{trainer.count} sessions</Text>
                                            <Text style={{ color: '#666' }}>•</Text>
                                            <Ionicons name="star" size={10} color="#ff8c2b" />
                                            <Text style={styles.rankRating}>{trainer.rating?.toFixed(1) || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.rankRevenueValue}>
                                            {trainer.revenue ? `${trainer.revenue.toLocaleString()} ETB` : '--'}
                                        </Text>
                                        <Text style={styles.rankRevenueLabel}>Revenue</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="barbell-outline" size={40} color="#444" />
                            <Text style={styles.emptyStateText}>No trainer data available</Text>
                        </View>
                    )}
                </View>
                </>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/owner-home")}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/members-list-owner")}>
                    <Ionicons name="people-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/trainers-list-owner")}>
                    <Ionicons name="barbell-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/membership-plans")}>
                    <Ionicons name="disc-outline" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/owner-profile")}>
                    <Ionicons name="person" size={24} color="#ff8c2b" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        color: '#888',
        marginTop: 12,
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyStateText: {
        color: '#666',
        marginTop: 10,
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        gap: 20,
    },
    tabBtn: {
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#ff8c2b',
    },
    tabText: {
        color: '#888',
        fontSize: 14,
        fontWeight: 'bold',
    },
    tabTextActive: {
        color: '#ff8c2b',
    },
    contentContainer: {
        padding: 20,
    },
    profileHeaderCard: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    avatarRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#ff8c2b',
        borderRadius: 12,
        padding: 4,
        borderWidth: 2,
        borderColor: '#111',
    },
    gymNameLarge: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memberSince: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 8,
    },
    activeBadge: {
        backgroundColor: '#0f3a1e',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    inactiveBadge: {
        backgroundColor: '#3a2a0f',
    },
    activeText: {
        color: '#00cc44',
        fontSize: 10,
        fontWeight: 'bold',
    },
    inactiveText: {
        color: '#ff8c2b',
    },
    formSection: {
        gap: 16,
        marginBottom: 24,
    },
    label: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 14,
    },
    inputWithIcon: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44, // Fixed height to match standard input feel
    },
    inputInner: {
        flex: 1,
        color: '#fff',
        marginLeft: 8,
        height: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    dropdown: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    saveBtn: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionContainer: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    analyticsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    analyticsCard: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    analyticsHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    analyticsIconBg: {
        backgroundColor: '#0f3a1e',
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyticsLabel: {
        color: '#aaa',
        fontSize: 10,
    },
    analyticsValue_Green: {
        color: '#00cc44',
        fontSize: 14,
        fontWeight: 'bold',
    },
    analyticsSub: {
        color: '#666',
        fontSize: 10,
    },
    chartCard: {
        marginBottom: 24,
    },
    chartTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    distRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    distLabel: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
    },
    distCount: {
        color: '#666',
        fontSize: 12,
    },
    progressBarBg: {
        width: 150,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    rankingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        gap: 12,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    rankName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    rankClients: {
        color: '#aaa',
        fontSize: 12,
    },
    rankRating: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold',
    },
    rankRevenueValue: {
        color: '#00cc44',
        fontSize: 12,
        fontWeight: 'bold',
    },
    rankRevenueLabel: {
        color: '#666',
        fontSize: 10,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1a1a1a',
        paddingTop: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
});
