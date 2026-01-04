import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEVICE_HASH_KEY = 'fit_swap_device_hash';

/**
 * Generates a unique device hash for tracking free credits
 * This is stored securely and persists across app reinstalls on iOS
 */
export const generateDeviceHash = async (): Promise<string> => {
  // Try to get existing hash first
  const existingHash = await getStoredDeviceHash();
  if (existingHash) {
    return existingHash;
  }

  // Generate new hash based on device info
  const deviceInfo = [
    Constants.deviceName || 'unknown',
    Platform.OS,
    Platform.Version,
    Constants.sessionId,
    Date.now().toString(),
    Math.random().toString(),
  ].join('-');

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    deviceInfo
  );

  // Store the hash
  await storeDeviceHash(hash);

  return hash;
};

/**
 * Gets the stored device hash from secure storage
 */
export const getStoredDeviceHash = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(DEVICE_HASH_KEY);
  } catch (error) {
    console.error('Error getting device hash:', error);
    return null;
  }
};

/**
 * Stores the device hash in secure storage
 */
export const storeDeviceHash = async (hash: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(DEVICE_HASH_KEY, hash);
  } catch (error) {
    console.error('Error storing device hash:', error);
  }
};

/**
 * Clears the device hash (for testing purposes only)
 */
export const clearDeviceHash = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(DEVICE_HASH_KEY);
  } catch (error) {
    console.error('Error clearing device hash:', error);
  }
};

