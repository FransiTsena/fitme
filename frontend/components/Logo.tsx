import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogoProps {
    color?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ color = '#ff8c2b', size = 32 }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="barbell" size={size} color={color} />
            </View>
            <Text style={[styles.text, { fontSize: size * 0.8 }]}>
                Fit<Text style={{ color: color }}>Me</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        transform: [{ rotate: '-45deg' }],
    },
    text: {
        color: '#fff',
        fontWeight: '800',
        letterSpacing: 1,
    },
});
