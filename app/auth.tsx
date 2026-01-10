import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  DisplaySmall,
  HeadlineMedium,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../src/ui/Typography';
import { GlassCard } from '../src/ui/GlassCard';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { supabase } from '../src/services/supabase';
import { useSessionStore } from '../src/state/useSessionStore';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const AuthScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  
  const tabIndicatorPosition = useSharedValue(0);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);
  const clearUserData = useSessionStore((s) => s.clearUserData);

  // Tab indicator animation
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(tabIndicatorPosition.value * (width - 48) / 2) }],
  }));

  const handleTabChange = (tab: 'login' | 'register') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    tabIndicatorPosition.value = tab === 'login' ? 0 : 1;
  };

  // Check if Apple Auth is available
  useEffect(() => {
    const checkAppleAuth = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);
    };
    checkAppleAuth();
  }, []);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setHasCompletedOnboarding(true);
          router.replace('/(tabs)/home');
        }
      } catch (e) {
        console.log('Session check error:', e);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)/home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.emailAndPasswordRequired'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordMinLength'));
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (activeTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        
        if (error) throw error;
        
        clearUserData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)/home');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: name.trim() || undefined },
          },
        });
        
        if (error) throw error;
        
        if (data.user && data.session) {
          clearUserData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setHasCompletedOnboarding(true);
          router.replace('/(tabs)/home');
        } else if (data.user) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          
          if (signInError) throw signInError;
          
          clearUserData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setHasCompletedOnboarding(true);
          router.replace('/(tabs)/home');
        }
      }
    } catch (error: any) {
      let msg = t('auth.genericError');
      if (error.message?.includes('Invalid login') || error.message?.includes('Invalid credentials')) {
        msg = t('auth.invalidCredentials');
      } else if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        msg = t('auth.alreadyRegistered');
        handleTabChange('login');
      } else if (error.message) {
        msg = error.message;
      }
      Alert.alert(t('common.error'), msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    clearUserData();
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)/home');
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const rawNonce = Array.from(
        await Crypto.getRandomBytesAsync(32)
      ).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        throw new Error(t('auth.appleSignInError.authFailed'));
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;

      if (credential.fullName?.givenName || credential.fullName?.familyName) {
        const fullName = [
          credential.fullName.givenName,
          credential.fullName.familyName,
        ].filter(Boolean).join(' ');

        if (fullName && data.user) {
          await supabase.auth.updateUser({
            data: { full_name: fullName },
          });
        }
      }

      clearUserData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasCompletedOnboarding(true);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      // Detaylı hata logla
      console.log('🍎 Apple Sign In Error:', JSON.stringify(error, null, 2));
      console.log('🍎 Error message:', error.message);
      console.log('🍎 Error code:', error.code);
      
      if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
        return;
      }
      
      let title = t('auth.appleSignInError.genericTitle');
      let message = '';
      
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code || '';
      
      if (errorMessage.includes('unknown reason') || errorMessage.includes('failed for an unknown')) {
        title = t('auth.appleSignInError.unknownTitle');
        message = t('auth.appleSignInError.unknownMessage');
      } else if (errorMessage.includes('network') || errorMessage.includes('internet')) {
        title = t('auth.appleSignInError.networkTitle');
        message = t('auth.appleSignInError.networkMessage');
      } else if (errorMessage.includes('invalid') || errorMessage.includes('token')) {
        title = t('auth.appleSignInError.validationTitle');
        message = t('auth.appleSignInError.validationMessage');
      } else if (errorCode === 'ERR_REQUEST_UNKNOWN') {
        title = t('auth.appleSignInError.serverTitle');
        message = t('auth.appleSignInError.serverMessage');
      } else {
        message = t('auth.appleSignInError.genericMessage');
      }
      
      Alert.alert(title, message, [{ text: t('auth.appleSignInError.ok'), style: 'default' }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAppleLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LinearGradient
          colors={['#0B0B0C', '#12121a', '#0B0B0C']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={Colors.accent.primary} />
      </View>
    );
  }

  const isLogin = activeTab === 'login';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background */}
      <LinearGradient
        colors={isLogin ? ['#0B0B0C', '#0f1629', '#0B0B0C'] : ['#0B0B0C', '#1a0f29', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Accent Glow */}
      <View style={styles.glowContainer}>
        <Animated.View 
          style={[
            styles.glowOrb,
            { backgroundColor: isLogin ? '#7C3AED' : '#EC4899' },
          ]} 
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <DisplaySmall style={styles.appName}>Wearify</DisplaySmall>
        </Animated.View>

        {/* Tab Switcher */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
            
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange('login')}
              activeOpacity={0.7}
            >
              <BodyMedium 
                color={isLogin ? 'primary' : 'tertiary'} 
                style={[styles.tabText, isLogin && styles.tabTextActive]}
              >
                {t('auth.login')}
              </BodyMedium>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange('register')}
              activeOpacity={0.7}
            >
              <BodyMedium 
                color={!isLogin ? 'primary' : 'tertiary'} 
                style={[styles.tabText, !isLogin && styles.tabTextActive]}
              >
                {t('auth.register')}
              </BodyMedium>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Form Card */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()} 
          style={styles.formContainer}
        >
          <GlassCard style={styles.formCard}>
            {/* Title */}
            <View style={styles.formHeader}>
              <HeadlineSmall>
                {isLogin ? `👋 ${t('auth.welcomeBack')}` : `✨ ${t('auth.createAccount')}`}
              </HeadlineSmall>
              <BodySmall color="secondary" style={styles.formSubtitle}>
                {isLogin 
                  ? t('auth.loginDescription')
                  : t('auth.registerDescription')}
              </BodySmall>
            </View>

            {/* Name Input (only for register) */}
            {!isLogin && (
              <Animated.View entering={FadeInUp.delay(100)} exiting={FadeOut}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <Image
                      source={require('../full3dicons/images/profile-icon.png')}
                      style={styles.inputIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.nameOptional')}
                    placeholderTextColor={Colors.text.tertiary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                </View>
              </Animated.View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <LabelMedium style={styles.inputIconEmoji}>📧</LabelMedium>
              </View>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={Colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <LabelMedium style={styles.inputIconEmoji}>🔒</LabelMedium>
              </View>
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder={isLogin ? t('auth.password') : t('auth.passwordPlaceholder')}
                placeholderTextColor={Colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleAuth}
              />
            </View>

            {/* Submit Button */}
            <PrimaryButton
              title={isLogin ? t('auth.login') : t('auth.createAccount')}
              onPress={handleAuth}
              loading={isLoading}
              style={[
                styles.submitButton,
                !isLogin && styles.submitButtonRegister,
              ]}
            />

            {/* Apple Sign In */}
            {Platform.OS === 'ios' && appleAuthAvailable && (
              <View style={styles.appleSection}>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <LabelSmall color="tertiary">{t('auth.or')}</LabelSmall>
                  <View style={styles.dividerLine} />
                </View>
                
                <View style={styles.appleButtonWrapper}>
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                    cornerRadius={12}
                    style={styles.appleButton}
                    onPress={handleAppleSignIn}
                  />
                  
                  {isAppleLoading && (
                    <View style={styles.appleLoadingOverlay}>
                      <ActivityIndicator size="small" color={Colors.accent.primary} />
                    </View>
                  )}
                </View>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Skip Button */}
        <Animated.View entering={FadeIn.delay(500)} style={styles.skipContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <BodySmall color="tertiary">{t('auth.continueWithoutLogin')}</BodySmall>
            <LabelSmall color="accent"> →</LabelSmall>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeIn.delay(600)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <BodySmall color="tertiary" style={styles.footerText}>
            {t('auth.termsNotice', {
              terms: t('auth.termsOfService'),
              privacy: t('auth.privacyPolicy'),
            })}
          </BodySmall>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.page,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowOrb: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    opacity: 0.08,
    position: 'absolute',
    top: -width * 0.8,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  appName: {
    letterSpacing: 1,
  },
  // Tab Switcher
  tabContainer: {
    marginBottom: 24,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width - 48 - 8) / 2,
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#000',
  },
  // Form
  formContainer: {
    marginBottom: 24,
  },
  formCard: {
    padding: 24,
    gap: 16,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  inputIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIcon: {
    width: 22,
    height: 22,
    opacity: 0.6,
  },
  inputIconEmoji: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 15,
    paddingVertical: 14,
    paddingRight: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonRegister: {
    backgroundColor: '#EC4899',
  },
  // Apple
  appleSection: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  appleButtonWrapper: {
    position: 'relative',
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  appleLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Skip
  skipContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  // Footer
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthScreen;
