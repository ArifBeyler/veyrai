import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const DEVICE_USER_ID_KEY = 'com.veyra.deviceUserId';

/**
 * Gets or creates a unique device user ID stored in Keychain
 * This ID persists across app reinstalls (if Keychain remains)
 * Returns a UUID v4 string
 */
export const getOrCreateDeviceUserId = async (): Promise<string> => {
  try {
    // Try to get existing ID from Keychain
    const existingId = await SecureStore.getItemAsync(DEVICE_USER_ID_KEY);
    if (existingId) {
      return existingId;
    }

    // Generate new UUID v4
    const uuid = await generateUUIDv4();
    
    // Store in Keychain
    await SecureStore.setItemAsync(DEVICE_USER_ID_KEY, uuid);
    
    return uuid;
  } catch (error) {
    console.error('Error getting/creating device user ID:', error);
    // Fallback: generate a temporary ID (won't persist but app won't crash)
    return await generateUUIDv4();
  }
};

/**
 * Gets the stored device user ID without creating a new one
 * Returns null if not found
 */
export const getDeviceUserId = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(DEVICE_USER_ID_KEY);
  } catch (error) {
    console.error('Error getting device user ID:', error);
    return null;
  }
};

/**
 * Generates a UUID v4 string
 */
const generateUUIDv4 = async (): Promise<string> => {
  // Generate 16 random bytes
  const bytes = await Crypto.getRandomBytesAsync(16);
  
  // Convert to hex string
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    hex.substring(0, 8),
    hex.substring(8, 12),
    '4' + hex.substring(13, 16), // Version 4
    ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16) + hex.substring(17, 20), // Variant bits
    hex.substring(20, 32),
  ].join('-');
  
  return uuid;
};

/**
 * Clears the device user ID (for testing purposes only)
 */
export const clearDeviceUserId = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(DEVICE_USER_ID_KEY);
  } catch (error) {
    console.error('Error clearing device user ID:', error);
  }
};
