import { Logo } from "@/components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
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

const screenWidth = Dimensions.get("window").width;

export default function OwnerProfileScreen() {
    const [activeTab, setActiveTab] = useState("Profile");

    // Charts Data
    const revenueData = [
        { value: 850000, label: 'Jul' },
        { value: 920000, label: 'Aug' },
        { value: 1080000, label: 'Sep' },
        { value: 1120000, label: 'Oct' },
        { value: 1180000, label: 'Nov' },
        { value: 1250000, label: 'Dec' },
    ];

    const peakHoursData = [
        { value: 85, label: '6 AM' },
        { value: 120, label: '8 AM' },
        { value: 95, label: '10 PM' },
        { value: 75, label: '12 PM' },
        { value: 60, label: '2 PM' },
        { value: 140, label: '4 PM' },
        { value: 165, label: '6 PM' }, // Peak
        { value: 110, label: '8 PM' },
    ];

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
                            <Text style={styles.gymNameLarge}>Bole Fitness Center</Text>
                            <Text style={styles.memberSince}>Member since January 2024</Text>
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Gym Name</Text>
                        <TextInput style={styles.input} value="Bole Fitness Center" />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Email</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="mail-outline" size={16} color="#888" />
                                    <TextInput style={styles.inputInner} value="abebe@example.com" />
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.label}>Phone number</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="call-outline" size={16} color="#888" />
                                    <TextInput style={styles.inputInner} value="+251912345678" />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWithIcon}>
                            <Ionicons name="location-outline" size={16} color="#888" />
                            <TextInput style={styles.inputInner} value="Bole Road, near Edna Mall" />
                        </View>

                        <Text style={styles.label}>Sub-City</Text>
                        <TouchableOpacity style={styles.dropdown}>
                            <Text style={{ color: '#fff' }}>Bole</Text>
                            <Ionicons name="caret-down-outline" size={16} color="#888" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value="Premier fitness center in Addis Ababa with state-of-the-art equipment and expert trainers."
                        />
                    </View>

                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveBtn}
                        >
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Business Analytics (Charts) */}
                <View style={styles.sectionContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="stats-chart" size={18} color="#ff8c2b" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Business Analytics</Text>
                    </View>

                    <View style={styles.analyticsRow}>
                        <View style={styles.analyticsCard}>
                            <View style={styles.analyticsHeader}>
                                <View style={styles.analyticsIconBg}><Ionicons name="trending-up" size={18} color="#00cc44" /></View>
                                <View>
                                    <Text style={styles.analyticsLabel}>Revenue Growth</Text>
                                    <Text style={styles.analyticsValue_Green}>+41%</Text>
                                </View>
                            </View>
                            <Text style={styles.analyticsSub}>Last 6 months</Text>
                        </View>

                        <View style={styles.analyticsCard}>
                            <View style={styles.analyticsHeader}>
                                <View style={[styles.analyticsIconBg, { backgroundColor: '#332211' }]}><Ionicons name="people" size={18} color="#ff8c2b" /></View>
                                <View>
                                    <Text style={styles.analyticsLabel}>Retention Rate</Text>
                                    <Text style={styles.analyticsValue_Green}>94%</Text>
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
                    <View style={styles.distRow}>
                        <View>
                            <Text style={styles.distLabel}>Basic</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#888' }]} />
                            </View>
                        </View>
                        <Text style={styles.distCount}>180 members</Text>
                    </View>
                    <View style={styles.distRow}>
                        <View>
                            <Text style={styles.distLabel}>Premium</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '60%', backgroundColor: '#ff8c2b' }]} />
                            </View>
                        </View>
                        <Text style={styles.distCount}>130 members</Text>
                    </View>
                    <View style={styles.distRow}>
                        <View>
                            <Text style={styles.distLabel}>VIP</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '25%', backgroundColor: '#00cc44' }]} />
                            </View>
                        </View>
                        <Text style={styles.distCount}>52 members</Text>
                    </View>
                </View>

                {/* Top Trainers */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Top Trainers</Text>
                    {[
                        { rank: 1, name: "Mesenbet Tadesse", clients: 52, rating: 4.9, revenue: "130,00 ETB", medalColor: "#C9B037", medalText: "#5D4037" },
                        { rank: 2, name: "Mesenbet Tadesse", clients: 52, rating: 4.9, revenue: "130,00 ETB", medalColor: "#B4B4B4", medalText: "#333" },
                        { rank: 3, name: "Mesenbet Tadesse", clients: 52, rating: 4.9, revenue: "130,00 ETB", medalColor: "#AD8A56", medalText: "#3E2723" },
                        { rank: 4, name: "Mesenbet Tadesse", clients: 52, rating: 4.9, revenue: "130,00 ETB", medalColor: "#332211", medalText: "#ff8c2b" },
                    ].map((trainer, i) => (
                        <View key={i} style={styles.rankingCard}>
                            <View style={[styles.rankBadge, { backgroundColor: trainer.medalColor }]}>
                                <Text style={[styles.rankText, { color: trainer.medalText }]}>#{trainer.rank}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rankName}>{trainer.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={styles.rankClients}>{trainer.clients} clients</Text>
                                    <Text style={{ color: '#666' }}>•</Text>
                                    <Ionicons name="star" size={10} color="#ff8c2b" />
                                    <Text style={styles.rankRating}>{trainer.rating}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.rankRevenueValue}>{trainer.revenue}</Text>
                                <Text style={styles.rankRevenueLabel}>Revenue</Text>
                            </View>
                        </View>
                    ))}
                </View>

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
    activeText: {
        color: '#00cc44',
        fontSize: 10,
        fontWeight: 'bold',
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
