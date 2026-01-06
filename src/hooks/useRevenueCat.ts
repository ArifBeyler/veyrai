import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  initializeRevenueCat,
  checkEntitlement,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  presentPaywall as showPaywall,
  presentCustomerCenter,
  setUserId as setRevenueCatUserId,
  logOut as revenueCatLogOut,
  getPackageByIdentifier,
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from '../services/revenuecat';
import { useSessionStore } from '../state/useSessionStore';
import { supabase } from '../services/supabase';

/**
 * RevenueCat hook - entitlement kontrolü ve subscription yönetimi
 */
export const useRevenueCat = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isEntitled, setIsEntitled] = useState(false);
  
  const setIsPremium = useSessionStore((s) => s.setIsPremium);

  // Initialize RevenueCat
  const initialize = useCallback(async (userId?: string) => {
    try {
      setIsLoading(true);
      await initializeRevenueCat(userId);
      setIsInitialized(true);
      
      // Check entitlement after initialization
      const entitled = await checkEntitlement();
      setIsEntitled(entitled);
      setIsPremium(entitled);
      
      // Get customer info
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      
      // Get offerings
      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  // Check entitlement
  const checkProEntitlement = useCallback(async () => {
    try {
      const entitled = await checkEntitlement();
      setIsEntitled(entitled);
      setIsPremium(entitled);
      
      // Refresh customer info
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      
      return entitled;
    } catch (error) {
      console.error('Error checking entitlement:', error);
      return false;
    }
  }, [setIsPremium]);

  // Purchase package
  const purchase = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      setIsLoading(true);
      const info = await purchasePackage(packageToPurchase);
      setCustomerInfo(info);
      
      const entitled = await checkEntitlement();
      setIsEntitled(entitled);
      setIsPremium(entitled);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return info;
    } catch (error: any) {
      console.error('Purchase error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Satın alma sırasında bir hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  // Restore purchases
  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await restorePurchases();
      setCustomerInfo(info || null);
      
      const entitled = await checkEntitlement();
      setIsEntitled(entitled);
      setIsPremium(entitled);
      
      if (entitled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Başarılı', 'Satın alımlar geri yüklendi');
      } else {
        Alert.alert('Bilgi', 'Geri yüklenecek satın alım bulunamadı');
      }
      
      return info;
    } catch (error: any) {
      console.error('Restore error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Satın alımlar geri yüklenirken bir hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  // Present RevenueCat Paywall
  const presentPaywall = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await showPaywall();
      
      if (info) {
        setCustomerInfo(info);
        const entitled = await checkEntitlement();
        setIsEntitled(entitled);
        setIsPremium(entitled);
      }
      
      return info;
    } catch (error: any) {
      console.error('Paywall error:', error);
      // Don't show error if user cancelled
      if (!error.userCancelled) {
        Alert.alert('Hata', 'Paywall gösterilirken bir hata oluştu');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  // Present Customer Center
  const presentCenter = useCallback(async () => {
    try {
      await presentCustomerCenter();
    } catch (error) {
      console.error('Customer Center error:', error);
      Alert.alert('Hata', 'Customer Center gösterilirken bir hata oluştu');
    }
  }, []);

  // Set user ID (when user logs in)
  const setUserId = useCallback(async (userId: string) => {
    try {
      const info = await setRevenueCatUserId(userId);
      setCustomerInfo(info);
      await checkProEntitlement();
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }, [checkProEntitlement]);

  // Log out
  const logOut = useCallback(async () => {
    try {
      await revenueCatLogOut();
      setCustomerInfo(null);
      setIsEntitled(false);
      setIsPremium(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [setIsPremium]);

  // Get package by identifier
  const getPackage = useCallback((identifier: 'monthly' | 'yearly' | 'lifetime'): PurchasesPackage | null => {
    return getPackageByIdentifier(offerings, identifier);
  }, [offerings]);

  // Refresh offerings
  const refreshOfferings = useCallback(async () => {
    try {
      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);
    } catch (error) {
      console.error('Error refreshing offerings:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      await initialize(userId);
    };
    
    init();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        await logOut();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    // State
    isInitialized,
    isLoading,
    isEntitled,
    customerInfo,
    offerings,
    
    // Actions
    initialize,
    checkEntitlement: checkProEntitlement,
    purchase,
    restore,
    presentPaywall,
    presentCustomerCenter: presentCenter,
    setUserId,
    logOut,
    getPackage,
    refreshOfferings,
  };
};

