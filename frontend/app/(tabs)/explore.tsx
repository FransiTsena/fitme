import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AdCarousel } from '@/components/AdCarousel';
import { GymCard } from '@/components/GymCard';
import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';


export default function TabTwoScreen() {
  return (
    <ProtectedRoute>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Stack.Screen
          options={{
            headerTitle: () => <Logo size={24} />,
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
                <TouchableOpacity>
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                  {/* Badge */}
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

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          stickyHeaderIndices={[1]}
          snapToOffsets={[0, 250]}
          snapToEnd={false}
          decelerationRate="fast"
        >
          {/* Map Header (index 0) */}
          <View style={styles.mapContainer}>
            <Image
              source={require('@/assets/images/map-header.png')}
              style={{ width: '100%', height: 250 }}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.mapOverlayBtn}>
              <Text style={styles.nearMeText}>Near Me</Text>
            </TouchableOpacity>
          </View>

          {/* Sticky Header Container (index 1) */}
          <View style={{ backgroundColor: '#000', paddingBottom: 10, zIndex: 1000, elevation: 50 }}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color="#888" />
              <Text style={styles.searchText}>Search member...</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.resultCount}>99 results</Text>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterBtn}>
                <Text style={styles.filterText}>Filter</Text>
                <Ionicons name="chevron-down" size={12} color="#fff" />
              </View>
              <View style={styles.filterBtn}>
                <Text style={styles.filterText}>Sort</Text>
                <Ionicons name="chevron-down" size={12} color="#fff" />
              </View>
            </View>
          </View>

          {/* Content (index 2) */}
          <View style={styles.contentContainer}>
            {/* Near Me Button - Positioned normally now to avoid overlap */}
            <View style={styles.nearMeContainer}>
              <TouchableOpacity style={styles.nearMeBtnList}>
                <Text style={styles.nearMeText}>Near Me</Text>
              </TouchableOpacity>
            </View>

            <AdCarousel />

            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Featured Gyms</ThemedText>

            <GymCard
              name="Muscles Gym"
              rating={4.8}
              reviews={500}
              distance="1.2 km"
              price="12,000birr"
              imageFn={() => require('@/assets/images/gym-1.png')}
            />
            <GymCard
              name="Power House"
              rating={4.5}
              reviews={120}
              distance="2.5 km"
              price="8,000birr"
              imageFn={() => require('@/assets/images/gym-1.png')}
            />
            <GymCard
              name="Fitness First"
              rating={4.2}
              reviews={80}
              distance="5.0 km"
              price="6,000birr"
              imageFn={() => require('@/assets/images/gym-1.png')}
            />
            <GymCard
              name="Gold's Gym"
              rating={4.9}
              reviews={1000}
              distance="0.8 km"
              price="15,000birr"
              imageFn={() => require('@/assets/images/gym-1.png')}
            />

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
        <UserBottomNav />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff8c2b',
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom nav
  },
  mapContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#e6e6e6',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 25, // Pill shape
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 0,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  searchText: {
    color: '#666',
  },
  resultCount: {
    color: '#666',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
    marginHorizontal: 16,
    marginTop: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterText: {
    color: '#fff',
    fontSize: 12,
  },
  contentContainer: {
    marginTop: 0, // Removed negative margin to prevent overlap
    paddingBottom: 40,
  },
  nearMeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  mapOverlayBtn: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ff8c2b',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  nearMeBtnList: {
    backgroundColor: '#ff8c2b',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nearMeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,

  }
});
