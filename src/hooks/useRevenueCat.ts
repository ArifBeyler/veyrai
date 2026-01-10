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
  const addCredits = useSessionStore((s) => s.addCredits);
  const setCredits = useSessionStore((s) => s.setCredits);

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
      
      // Fetch user credits from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        // Try direct table query first (more reliable)
        const { data: creditData, error: creditError } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', session.user.id)
          .single();
        
        if (!creditError && creditData?.balance !== undefined) {
          setCredits(creditData.balance);
          console.log('Credits loaded from Supabase:', creditData.balance);
        } else {
          // Fallback: try RPC function
          const { data, error } = await supabase.rpc('get_user_credits', {
            p_user_id: session.user.id
          });
          if (!error && data !== null) {
            setCredits(data);
            console.log('Credits loaded via RPC:', data);
          }
        }
      }
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium, setCredits]);

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
      
      // Add credits based on package type
      const packageId = packageToPurchase.identifier?.toLowerCase() || '';
      let creditsToAdd = 0;
      
      if (packageId.includes('yearly') || packageId.includes('annual')) {
        creditsToAdd = 480; // Yıllık: 480 kredi
      } else if (packageId.includes('monthly')) {
        creditsToAdd = 40; // Aylık: 40 kredi
      }
      
      if (creditsToAdd > 0) {
        // Add credits to Supabase and local state
        const { data: { session } } = await supabase.auth.getSession();
        
        // Always update local state immediately for instant feedback
        addCredits(creditsToAdd);
        console.log(`Added ${creditsToAdd} credits locally`);
        
        if (session?.user?.id) {
          // Try to sync with Supabase
          try {
            // Try RPC first
            const { data, error } = await supabase.rpc('add_credits', {
              p_user_id: session.user.id,
              p_amount: creditsToAdd
            });
            
            if (!error && data !== null) {
              setCredits(data); // Sync with server balance
              console.log(`Synced with Supabase. Server balance: ${data}`);
            } else {
              // Fallback: direct upsert
              const { data: existingCredits } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', session.user.id)
                .single();
              
              const newBalance = (existingCredits?.balance || 0) + creditsToAdd;
              
              await supabase
                .from('user_credits')
                .upsert({ 
                  user_id: session.user.id, 
                  balance: newBalance 
                }, { onConflict: 'user_id' });
              
              console.log(`Direct upsert to Supabase. New balance: ${newBalance}`);
            }
          } catch (syncError) {
            console.warn('Supabase sync failed, credits saved locally:', syncError);
          }
        }
      }
      
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
  }, [setIsPremium, addCredits, setCredits]);

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
    } catch (error: any) {
      // Ignore 429 "request in flight" error - logout was already triggered
      if (error?.code === 16 || error?.info?.backendErrorCode === 7638) {
        console.log('RevenueCat logout already in progress, ignoring...');
        setCustomerInfo(null);
        setIsEntitled(false);
        setIsPremium(false);
        return;
      }
      console.error('Error logging out:', error);
    }
  }, [setIsPremium]);

  // Get package by identifier
  const getPackage = useCallback((identifier: 'monthly' | 'yearly' | 'lifetime'): PurchasesPackage | null => {
    return getPackageByIdentifier(offerings, identifier);
  }, [offerings]);

  // Get token package by identifier (for consumable token purchases)
  const getTokenPackage = useCallback((identifier: string): PurchasesPackage | null => {
    if (!offerings?.all) return null;
    
    // Token paketleri 'tokens' offering'inde olabilir
    const tokenOffering = offerings.all['tokens'] || offerings.current;
    
    if (!tokenOffering?.availablePackages) return null;
    
    // identifier'a göre paketi bul (örn: tokens_10, tokens_50)
    const pkg = tokenOffering.availablePackages.find(
      (p) => p.identifier?.toLowerCase() === identifier.toLowerCase()
    );
    
    return pkg || null;
  }, [offerings]);

  // Purchase token package (consumable)
  const purchaseTokenPackage = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      setIsLoading(true);
      const info = await purchasePackage(packageToPurchase);
      setCustomerInfo(info);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return info;
    } catch (error: any) {
      console.error('Token purchase error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    purchaseTokenPackage,
    restore,
    presentPaywall,
    presentCustomerCenter: presentCenter,
    setUserId,
    logOut,
    getPackage,
    getTokenPackage,
    refreshOfferings,
  };
};

