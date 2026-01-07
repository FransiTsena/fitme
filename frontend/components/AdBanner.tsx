import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function AdBanner() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a4c28', '#000']} // Dark green to black gradient simulation
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.subTitle}>Premium Protein Powder</Text>
                        <Text style={styles.title}>HAY'LO{"\n"}ETHIOPIA</Text>

                        <View style={styles.badges}>
                            <View style={styles.badge}><Text style={styles.badgeText}>ORGANIC INGREDIENTS</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>STEVIA ROSE VERIFIED</Text></View>
                        </View>
                    </View>
                    <Image
                        source={require('@/assets/images/ad-protein.png')}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 140,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#333",
    },
    gradient: {
        flex: 1,
        padding: 16,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    subTitle: {
        color: "#aaa", // Cursive-ish font in design, using simple text for now
        fontSize: 12,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    title: {
        color: "#4ade80", // Greenish
        fontSize: 24,
        fontWeight: "900",
        marginBottom: 10,
        lineHeight: 26,
    },
    badges: {
        flexDirection: "row",
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 8,
    },
    productImage: {
        width: 100,
        height: 120,
        marginTop: 10,
    }
});
