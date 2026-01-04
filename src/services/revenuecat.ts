import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesError,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = 'test_ZlrmixGXfOlxOaNTwnPJmMtpKNG';
const ENTITLEMENT_ID = 'fitswap Pro';

// RevenueCat konfigürasyonu
let isConfigured = false;

/**
 * RevenueCat'i initialize et
 * App başlangıcında çağrılmalı
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  try {
    if (isConfigured) {
      console.log('RevenueCat already configured');
      return;
    }

    // Platform'a göre API key kullan (iOS/Android aynı test key)
    await Purchases.configure({ apiKey: API_KEY });
    
    // Kullanıcı ID'si varsa set et
    if (userId) {
      await Purchases.logIn(userId);
    }
    
    isConfigured = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('RevenueCat initialization error:', error);
    throw error;
  }
};

/**
 * Mevcut kullanıcı bilgilerini al
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return null;
  }
};

/**
 * Kullanıcının fitswap Pro entitlement'ına sahip olup olmadığını kontrol et
 */
export const checkEntitlement = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isEntitled = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return isEntitled;
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return false;
  }
};

/**
 * Mevcut offering'leri al (paketler: monthly, yearly, lifetime)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

/**
 * Belirli bir package'ı satın al
 */
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    // Kullanıcı iptal ettiyse özel hata fırlatma
    if (error.userCancelled) {
      throw new Error('Satın alma iptal edildi');
    }
    
    // Diğer hatalar
    if (error.code === PurchasesError.PURCHASE_NOT_ALLOWED) {
      throw new Error('Satın alma izni yok');
    }
    
    if (error.code === PurchasesError.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE) {
      throw new Error('Ürün satın alınamıyor');
    }
    
    console.error('Purchase error:', error);
    throw new Error(error.message || 'Satın alma sırasında bir hata oluştu');
  }
};

/**
 * Satın alımları geri yükle
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw new Error('Satın alımlar geri yüklenirken bir hata oluştu');
  }
};

/**
 * RevenueCat Paywall'u göster
 */
export const presentPaywall = async (): Promise<CustomerInfo | null> => {
  try {
    // react-native-purchases-ui kullanarak paywall göster
    const { presentPaywall } = await import('react-native-purchases-ui');
    const customerInfo = await presentPaywall();
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      return null; // Kullanıcı iptal etti
    }
    console.error('Error presenting paywall:', error);
    throw error;
  }
};

/**
 * Customer Center'ı göster
 */
export const presentCustomerCenter = async (): Promise<void> => {
  try {
    const { presentCustomerCenter } = await import('react-native-purchases-ui');
    await presentCustomerCenter();
  } catch (error) {
    console.error('Error presenting customer center:', error);
    throw error;
  }
};

/**
 * Kullanıcıyı logout yap (RevenueCat'ten)
 */
export const logOut = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

/**
 * Kullanıcı ID'sini set et
 */
export const setUserId = async (userId: string): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('Error setting user ID:', error);
    throw error;
  }
};

/**
 * Package tiplerini map et (monthly, yearly, lifetime)
 */
export const getPackageByIdentifier = (
  offering: PurchasesOffering | null,
  identifier: 'monthly' | 'yearly' | 'lifetime'
): PurchasesPackage | null => {
  if (!offering) return null;
  
  // Lifetime genellikle availablePackages içinde değil, özel olarak kontrol et
  const packageMap: Record<string, PurchasesPackage | null> = {
    monthly: offering.availablePackages.find(pkg => pkg.identifier === 'monthly' || pkg.packageType === 'MONTHLY') || null,
    yearly: offering.availablePackages.find(pkg => pkg.identifier === 'yearly' || pkg.packageType === 'ANNUAL') || null,
    lifetime: offering.availablePackages.find(pkg => pkg.identifier === 'lifetime' || pkg.packageType === 'LIFETIME') || null,
  };
  
  return packageMap[identifier] || null;
};

