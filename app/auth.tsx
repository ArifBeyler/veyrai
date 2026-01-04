import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing } from '../src/ui/theme';
import {
  HeadlineMedium,
  BodyMedium,
  LabelMedium,
} from '../src/ui/Typography';
import { GlassCard } from '../src/ui/GlassCard';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { supabase } from '../src/services/supabase';
import { useSessionStore } from '../src/state/useSessionStore';

const AuthScreen = () => {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);
  const clearUserData = useSessionStore((s) => s.clearUserData);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Already logged in
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)/home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre gerekli');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        
        if (error) {
          console.error('Login error:', error);
          throw error;
        }
        
        console.log('Login success:', data.user?.email);
        clearUserData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setHasCompletedOnboarding(true);
        router.replace('/(tabs)/home');
      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        console.log('Signup success:', data.user?.email);
        
        // Email doğrulama yok - direkt otomatik giriş
        if (data.user && data.session) {
          clearUserData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setHasCompletedOnboarding(true);
          router.replace('/(tabs)/home');
        } else if (data.user) {
          // User created but no session - try to sign in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          
          if (signInError) {
            throw signInError;
          }
          
          clearUserData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setHasCompletedOnboarding(true);
          router.replace('/(tabs)/home');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let msg = 'Bir hata oluştu';
      if (error.message?.includes('Invalid login') || error.message?.includes('Invalid credentials')) {
        msg = 'Email veya şifre hatalı';
      } else if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        msg = 'Bu email zaten kayıtlı. Giriş yapmayı deneyin.';
        setIsLogin(true); // Switch to login tab
      } else if (error.message) {
        msg = error.message;
      }
      Alert.alert('Hata', msg);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.logoContainer}>
          <Image
            source={require('../full3dicons/images/t-shirts.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <HeadlineMedium>FIT-SWAP</HeadlineMedium>
          <BodyMedium color="secondary">
            {isLogin ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
          </BodyMedium>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </GlassCard>

          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Şifre (min 6 karakter)"
              placeholderTextColor={Colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </GlassCard>

          <PrimaryButton
            title={isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            onPress={handleAuth}
            loading={isLoading}
          />

          <GlassCard
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <LabelMedium color="secondary">
              {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Hesabın var mı? Giriş yap'}
            </LabelMedium>
          </GlassCard>
        </Animated.View>

        {/* Skip button */}
        <Animated.View entering={FadeIn.delay(400)}>
          <GlassCard style={styles.skipButton} onPress={handleSkip}>
            <LabelMedium color="tertiary">Demo modunda devam et →</LabelMedium>
          </GlassCard>
        </Animated.View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.page,
    justifyContent: 'center',
    gap: 32,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 80,
    height: 80,
  },
  form: {
    gap: 16,
  },
  inputCard: {
    padding: 0,
  },
  input: {
    color: Colors.text.primary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  switchButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

export default AuthScreen;
