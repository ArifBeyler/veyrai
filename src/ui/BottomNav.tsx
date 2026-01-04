import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Shadows, Spacing, Animation } from './theme';

type NavItem = {
  key: string;
  icon: ImageSourcePropType;
  accessibilityLabel: string;
};

type BottomNavProps = {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  onCreatePress: () => void;
  createIcon: ImageSourcePropType;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, Animation.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.navButton, animatedStyle]}
      accessibilityRole="tab"
      accessibilityLabel={item.accessibilityLabel}
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Image
          source={item.icon}
          style={[
            styles.navIcon,
            !isActive && styles.inactiveIcon,
          ]}
          resizeMode="contain"
        />
      </View>
      {isActive && <View style={styles.activeIndicator} />}
    </AnimatedPressable>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeKey,
  onSelect,
  onCreatePress,
  createIcon,
}) => {
  const insets = useSafeAreaInsets();
  const createScale = useSharedValue(1);

  const createAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createScale.value }],
  }));

  const handleCreatePressIn = () => {
    createScale.value = withSpring(0.9, Animation.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCreatePressOut = () => {
    createScale.value = withSpring(1, Animation.spring);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <View style={styles.navWrapper}>
        <BlurView
          intensity={70}
          tint="dark"
          style={styles.pillContainer}
        >
          <View style={styles.pillContent}>
            {items.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                onPress={() => onSelect(item.key)}
              />
            ))}
          </View>
        </BlurView>

        <AnimatedPressable
          onPressIn={handleCreatePressIn}
          onPressOut={handleCreatePressOut}
          onPress={onCreatePress}
          style={[styles.createButton, createAnimatedStyle]}
          accessibilityRole="button"
          accessibilityLabel="Yeni oluştur"
        >
          <View style={styles.createButtonInner}>
            <Image
              source={createIcon}
              style={styles.createIcon}
              resizeMode="contain"
            />
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  navWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillContainer: {
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.glass.white,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  activeIconContainer: {
    backgroundColor: Colors.accent.primaryDim,
  },
  navIcon: {
    width: 32,
    height: 32,
  },
  inactiveIcon: {
    opacity: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.primary,
  },
  createButton: {
    ...Shadows.glow(Colors.accent.primary),
  },
  createButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIcon: {
    width: 28,
    height: 28,
  },
});

export default BottomNav;
