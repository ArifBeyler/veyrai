import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '../../src/ui/BottomNav';
import { Colors } from '../../src/ui/theme';

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const insets = useSafeAreaInsets();

  // Icon names - BottomNav will handle 3D/normal icon switching
  const NAV_ITEMS = [
    {
      key: 'home',
      icon: require('../../full3dicons/images/home.png'),
      iconName: 'home',
      accessibilityLabel: 'Ana Sayfa',
    },
    {
      key: 'wardrobe',
      icon: require('../../full3dicons/images/wardrobe.png'),
      iconName: 'wardrobe',
      accessibilityLabel: 'Gardrop',
    },
    {
      key: 'gallery',
      icon: require('../../full3dicons/images/photo.png'),
      iconName: 'gallery',
      accessibilityLabel: 'Galeri',
    },
    {
      key: 'profile',
      icon: require('../../full3dicons/images/profile.png'),
      iconName: 'profile',
      accessibilityLabel: 'Profil',
    },
  ];

  const CREATE_ICON = require('../../full3dicons/images/plus-sign.png');

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
        <Tabs.Screen name="home" />
        <Tabs.Screen name="wardrobe" />
        <Tabs.Screen name="gallery" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <BottomNav
        items={NAV_ITEMS}
        activeKey={activeTab}
        onSelect={handleTabSelect}
        onCreatePress={handleCreatePress}
        createIcon={CREATE_ICON}
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
