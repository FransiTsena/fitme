import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AdCarousel } from '@/components/AdCarousel';
import { GymCard } from '@/components/GymCard';
import { UserBottomNav } from '@/components/UserBottomNav';
import { ThemedText } from '@/components/themed-text';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';


export default function TabTwoScreen() {
  const { user } = useAuth();
  const [gyms, setGyms] = useState<any[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'rating', 'name'
  
  // Fetch gyms from API
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        let response;
        
        if (useLocation) {
          // For now, we'll use dummy coordinates for testing nearby functionality
          // In a real app, we would get the user's actual location
          const dummyLat = 9.018336;
          const dummyLng = 38.74687;
          
          response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/gyms/nearby?latitude=${dummyLat}&longitude=${dummyLng}&maxDistance=10`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
              'Content-Type': 'application/json',
            },
          });
        } else {
          response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/gyms`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
              'Content-Type': 'application/json',
            },
          });
        }
        
        if (response.ok) {
          const data = await response.json();
          const gymData = data.data || data.gyms || [];
          setGyms(gymData);
          setFilteredGyms(gymData);
        } else {
          console.error('Failed to fetch gyms:', response.status, response.statusText);
          setGyms([]);
          setFilteredGyms([]);
        }
      } catch (error) {
        console.error('Error fetching gyms:', error);
        setGyms([]);
        setFilteredGyms([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGyms();
  }, [user?.token, useLocation]);
  
  // Apply search and filters
  useEffect(() => {
    let result = [...gyms];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(gym => 
        (gym.name && gym.name.toLowerCase().includes(query)) ||
        (gym.address && gym.address.city && gym.address.city.toLowerCase().includes(query)) ||
        (gym.address && gym.address.area && gym.address.area.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else { // distance or default
      // For now, we'll sort by name since we don't have exact distance data
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    setFilteredGyms(result);
  }, [searchQuery, sortBy, gyms]);
  
  const toggleLocationFilter = () => {
    setUseLocation(!useLocation);
  };
  
  const handleGymPress = (gymId: string) => {
    router.push({pathname: '/member/gym-details', params: {id: gymId}});
  };
  
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
              <TextInput
                style={styles.searchInput}
                placeholder="Search gyms..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View style={{ flex: 1 }} />
              <Text style={styles.resultCount}>{filteredGyms.length} results</Text>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
                <Text style={styles.filterText}>Filter</Text>
                <Ionicons name="chevron-down" size={12} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn} onPress={() => {
                const newSortOrder = sortBy === 'rating' ? 'name' : sortBy === 'name' ? 'distance' : 'rating';
                setSortBy(newSortOrder);
              }}>
                <Text style={styles.filterText}>Sort: {sortBy}</Text>
                <Ionicons name="chevron-down" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content (index 2) */}
          <View style={styles.contentContainer}>
            {/* Near Me Button - Positioned normally now to avoid overlap */}
            <View style={styles.nearMeContainer}>
              <TouchableOpacity style={[styles.nearMeBtnList, useLocation && styles.activeNearMeBtn]} onPress={toggleLocationFilter}>
                <Text style={styles.nearMeText}>Near Me {useLocation ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            <AdCarousel />

            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Featured Gyms</ThemedText>

            {loading ? (
              <ThemedText type="default">Loading gyms...</ThemedText>
            ) : filteredGyms.length > 0 ? (
              filteredGyms.map((gym) => (
                <TouchableOpacity key={gym._id} onPress={() => handleGymPress(gym._id)}>
                  <GymCard
                    name={gym.name || "Unknown Gym"}
                    rating={gym.rating?.average || 0}
                    reviews={gym.rating?.count || 0}
                    distance="N/A"  // Actual distance calculation would require user location
                    price={gym.price ? `${gym.price} birr` : "N/A"}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <ThemedText type="default">No gyms found</ThemedText>
            )}

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
  searchInput: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
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
  },
  activeNearMeBtn: {
    backgroundColor: '#ff5500', // Darker orange when active
  }
});
