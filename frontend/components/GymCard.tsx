import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GymCardProps {
    imageFn?: () => any; // For require() images
    name: string;
    rating: number;
    reviews: number;
    distance: string;
    price: string;
    tags?: string[];
}

export function GymCard({
    imageFn,
    name,
    rating,
    reviews,
    distance,
    price,
    tags = [],
}: GymCardProps) {
    return (
        <View style={styles.card}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
                {imageFn ? (
                    <Image source={imageFn()} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="image-outline" size={40} color="#444" />
                    </View>
                )}

                {/* Optional heart/favorite icon overlay could go here */}
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <Text style={styles.name}>{name}</Text>

                <View style={styles.row}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#ff8c2b" />
                        <Text style={styles.ratingText}>{rating} ({reviews} reviews)</Text>
                    </View>
                    <View style={styles.dot} />
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={14} color="#888" />
                        <Text style={styles.distanceText}>{distance}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View>
                        <Text style={styles.price}>{price}</Text>
                        <Text style={styles.perMonth}>/ month</Text>
                    </View>

                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#ff8c2b', '#ff5500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.checkInBtn}
                        >
                            <Text style={styles.checkInText}>check-in</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#111",
        borderRadius: 16,
        overflow: "hidden", // For image border radius
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    imageContainer: {
        height: 180,
        width: "100%",
        backgroundColor: "#222",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    content: {
        padding: 16,
    },
    name: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: "#aaa",
        fontSize: 12,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#666",
        marginHorizontal: 8,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    distanceText: {
        color: "#aaa",
        fontSize: 12,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    price: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    perMonth: {
        color: "#666",
        fontSize: 12,
    },
    checkInBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    checkInText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});
