import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  LabelSmall,
} from '../src/ui/Typography';

const SUPPORT_EMAIL = 'support@wearify.app';
const FAQ_ITEMS = [
  {
    question: 'support.faq.howToUse.question',
    answer: 'support.faq.howToUse.answer',
  },
  {
    question: 'support.faq.credits.question',
    answer: 'support.faq.credits.answer',
  },
  {
    question: 'support.faq.quality.question',
    answer: 'support.faq.quality.answer',
  },
  {
    question: 'support.faq.refund.question',
    answer: 'support.faq.refund.answer',
  },
];

const SupportScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleEmailSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('support.emailSubject'))}`);
  };

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
          <DisplaySmall>{t('support.title')}</DisplaySmall>
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
        {/* Contact Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.contactCard}>
            <LinearGradient
              colors={[theme.colors.accentDim + '30', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.contactIcon}>
              <Image
                source={require('../full3dicons/images/sparkle.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <HeadlineSmall style={styles.contactTitle}>
              {t('support.needHelp')}
            </HeadlineSmall>
            <BodySmall color="secondary" style={styles.contactSubtitle}>
              {t('support.contactDescription')}
            </BodySmall>
            <TouchableOpacity
              style={[styles.emailButton, { backgroundColor: theme.colors.accent }]}
              onPress={handleEmailSupport}
              activeOpacity={0.8}
            >
              <LabelMedium style={styles.emailButtonText}>
                {t('support.emailUs')}
              </LabelMedium>
            </TouchableOpacity>
            <LabelSmall color="tertiary">{SUPPORT_EMAIL}</LabelSmall>
          </GlassCard>
        </Animated.View>

        {/* FAQ Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>
            {t('support.faqTitle')}
          </HeadlineSmall>

          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(400 + index * 100).springify()}
              >
                <GlassCard style={styles.faqCard}>
                  <View style={styles.faqQuestion}>
                    <View style={[styles.faqBullet, { backgroundColor: theme.colors.accent }]}>
                      <LabelSmall style={styles.faqBulletText}>?</LabelSmall>
                    </View>
                    <LabelMedium style={styles.faqQuestionText}>
                      {t(item.question)}
                    </LabelMedium>
                  </View>
                  <BodySmall color="secondary" style={styles.faqAnswer}>
                    {t(item.answer)}
                  </BodySmall>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <View style={styles.appInfo}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
            <LabelSmall color="tertiary">Wearify v1.0.0</LabelSmall>
            <BodySmall color="tertiary" style={styles.appTagline}>
              {t('support.madeWithLove')}
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
    gap: 24,
  },
  // Contact Card
  contactCard: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(181, 255, 31, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  contactTitle: {
    textAlign: 'center',
  },
  contactSubtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  emailButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    marginTop: 8,
  },
  emailButtonText: {
    color: '#000',
    // Using Typography component weight
  },
  // FAQ
  sectionTitle: {
    marginBottom: 12,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    padding: 16,
    gap: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqBulletText: {
    color: '#000',
    fontSize: 12,
    // Using Typography component weight
  },
  faqQuestionText: {
    flex: 1,
  },
  faqAnswer: {
    paddingLeft: 36,
    lineHeight: 20,
  },
  // App Info
  appInfo: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  appLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  appTagline: {
    fontStyle: 'italic',
  },
});

export default SupportScreen;

