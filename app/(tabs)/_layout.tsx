import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '../../src/ui/BottomNav';
import { Colors } from '../../src/ui/theme';

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const insets = useSafeAreaInsets();

  // Navigation items - using Phosphor Icons
  const NAV_ITEMS = [
    {
      key: 'home',
      iconName: 'home',
      accessibilityLabel: 'Ana Sayfa',
    },
    {
      key: 'wardrobe',
      iconName: 'wardrobe',
      accessibilityLabel: 'Gardrop',
    },
    {
      key: 'gallery',
      iconName: 'gallery',
      accessibilityLabel: 'Galeri',
    },
    {
      key: 'profile',
      iconName: 'profile',
      accessibilityLabel: 'Profil',
    },
  ];

  const handleTabSelect = (key: string) => {
    setActiveTab(key);
    router.push(`/(tabs)/${key}` as any);
  };

  const handleCreatePress = () => {
    router.push('/create');
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          animation: 'shift',
        }}
        screenListeners={{
          state: (e) => {
            const routes = e.data?.state?.routes;
            const index = e.data?.state?.index;
            if (routes && index !== undefined) {
              const currentRoute = routes[index];
              setActiveTab(currentRoute.name);
            }
          },
        }}
      >
        <Tabs.Screen 
          name="home" 
          options={{
            animation: 'shift',
          }}
        />
        <Tabs.Screen 
          name="wardrobe" 
          options={{
            animation: 'shift',
          }}
        />
        <Tabs.Screen 
          name="gallery" 
          options={{
            animation: 'shift',
          }}
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            animation: 'shift',
          }}
        />
      </Tabs>

      <BottomNav
        items={NAV_ITEMS}
        activeKey={activeTab}
        onSelect={handleTabSelect}
        onCreatePress={handleCreatePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});

export default TabsLayout;
