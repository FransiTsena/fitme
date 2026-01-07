import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get('window');
// Removing padding from width calculation to make it align with container if needed, 
// but design usually has full width or slight inset. Let's make it fit the container width.
const CARD_WIDTH = width - 40; // Assuming 20px padding on each side of parent

type AdItem = {
    id: string;
    title: string;
    subtitle: string;
    colors: [string, string];
    image: any;
    badges: string[];
    titleColor: string;
};

const ADS: AdItem[] = [
    {
        id: '1',
        title: "HAY'LO\nETHIOPIA",
        subtitle: "Premium Protein Powder",
        colors: ['#1a4c28', '#000'],
        image: require('@/assets/images/ad-protein.png'),
        badges: ["ORGANIC INGREDIENTS", "STEVIA ROSE VERIFIED"],
        titleColor: "#4ade80"
    },
    {
        id: '2',
        title: "BOLT\nENERGY",
        subtitle: "Unleash the Power",
        colors: ['#cc5500', '#000'],
        image: require('@/assets/images/ad-energy.png'),
        badges: ["SUGAR FREE", "CAFFEINE +"],
        titleColor: "#ffaa00"
    },
    {
        id: '3',
        title: "PRO\nGEAR",
        subtitle: "Heavy Duty Equipment",
        colors: ['#333', '#000'],
        image: require('@/assets/images/ad-equipment.png'),
        badges: ["LIFETIME WARRANTY", "15% OFF"],
        titleColor: "#fff"
    },
];

export function AdCarousel() {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll logic
    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= ADS.length) {
                nextIndex = 0;
            }
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [currentIndex]);

    const renderItem = ({ item }: { item: AdItem }) => (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.subTitle}>{item.subtitle}</Text>
                        <Text style={[styles.title, { color: item.titleColor }]}>{item.title}</Text>

                        <View style={styles.badges}>
                            {item.badges.map((badge, index) => (
                                <View key={index} style={styles.badge}>
                                    <Text style={styles.badgeText}>{badge}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <Image
                        source={item.image}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.carouselContainer}>
            <FlatList
                ref={flatListRef}
                data={ADS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
                    setCurrentIndex(newIndex);
                }}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={{ gap: 0 }} // No gap between pages for scrolling logic
            />

            {/* Dots Indicator */}
            <View style={styles.dotsContainer}>
                {ADS.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: index === currentIndex ? '#ff8c2b' : '#333' }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    carouselContainer: {
        marginBottom: 20,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: 140,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#333",
        // marginHorizontal not used here because FlatList logic prefers handling logic in container or snap logic
        // But since we want paging, simplest is width = defined width.
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
        color: "#aaa",
        fontSize: 12,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    title: {
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
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 8,
    },
    productImage: {
        width: 100,
        height: 120,
        marginTop: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});
