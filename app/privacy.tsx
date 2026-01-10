import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../src/hooks/useTranslation';
import { useTheme } from '../src/theme';
import { GlassCard } from '../src/ui/GlassCard';
import { IconButton } from '../src/ui/IconButton';
import { BorderRadius, Colors, Spacing } from '../src/ui/theme';
import {
  BodyMedium,
  BodySmall,
  DisplaySmall,
  HeadlineSmall,
  LabelMedium,
} from '../src/ui/Typography';

const PRIVACY_SECTIONS = [
  {
    title: 'privacy.dataCollection.title',
    icon: '📱',
    items: [
      'privacy.dataCollection.item1',
      'privacy.dataCollection.item2',
      'privacy.dataCollection.item3',
    ],
  },
  {
    title: 'privacy.dataUsage.title',
    icon: '🔧',
    items: [
      'privacy.dataUsage.item1',
      'privacy.dataUsage.item2',
      'privacy.dataUsage.item3',
    ],
  },
  {
    title: 'privacy.dataSecurity.title',
    icon: '🔒',
    items: [
      'privacy.dataSecurity.item1',
      'privacy.dataSecurity.item2',
    ],
  },
  {
    title: 'privacy.userRights.title',
    icon: '✅',
    items: [
      'privacy.userRights.item1',
      'privacy.userRights.item2',
      'privacy.userRights.item3',
    ],
  },
];

const PrivacyScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as unknown as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <IconButton
          icon={require('../full3dicons/images/home.png')}
          onPress={() => router.back()}
          accessibilityLabel="Geri"
          variant="glass"
          size="sm"
        />
        <View style={styles.headerTitle}>
          <DisplaySmall>{t('privacy.title')}</DisplaySmall>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.introCard}>
            <LinearGradient
              colors={[theme.colors.accentDim + '20', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.introIcon}>
              <LabelMedium style={styles.introIconText}>🛡️</LabelMedium>
            </View>
            <BodyMedium color="primary" style={styles.introText}>
              {t('privacy.intro')}
            </BodyMedium>
          </GlassCard>
        </Animated.View>

        {/* Privacy Sections */}
        {PRIVACY_SECTIONS.map((section, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(300 + index * 100).springify()}
          >
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.colors.accentDim }]}>
                  <LabelMedium style={styles.sectionIconText}>{section.icon}</LabelMedium>
                </View>
                <HeadlineSmall style={styles.sectionTitle}>
                  {t(section.title)}
                </HeadlineSmall>
              </View>
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.sectionItem}>
                    <View style={[styles.itemBullet, { backgroundColor: theme.colors.accent }]} />
                    <BodySmall color="secondary" style={styles.itemText}>
                      {t(item)}
                    </BodySmall>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        {/* Contact */}
        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <View style={styles.contactSection}>
            <BodySmall color="tertiary" style={styles.contactText}>
              {t('privacy.contact')}
            </BodySmall>
            <LabelMedium color="accent">support@wearify.app</LabelMedium>
          </View>
        </Animated.View>

        {/* Last Updated */}
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <View style={styles.lastUpdated}>
            <BodySmall color="tertiary">
              {t('privacy.lastUpdated')}: 10 Ocak 2026
            </BodySmall>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.page,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 16,
  },
  // Intro Card
  introCard: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
  },
  introIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introIconText: {
    fontSize: 24,
  },
  introText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  // Section Card
  sectionCard: {
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
  },
  sectionItems: {
    gap: 10,
    paddingLeft: 48,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  itemText: {
    flex: 1,
    lineHeight: 20,
  },
  // Contact
  contactSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.strokeLight,
  },
  contactText: {
    textAlign: 'center',
  },
  // Last Updated
  lastUpdated: {
    alignItems: 'center',
    marginTop: 8,
  },
});

export default PrivacyScreen;

