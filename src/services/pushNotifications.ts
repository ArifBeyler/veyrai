import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useSessionStore } from '../state/useSessionStore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushNotificationPayload = {
  title: string;
  body: string;
  data?: {
    type: 'job_completed' | 'job_failed' | 'promo' | 'general';
    jobId?: string;
    screen?: string;
  };
};

/**
 * Register for push notifications and get the token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  let token: string | null = null;

  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    token = tokenResponse.data;
    console.log('Push token:', token);

    // Store token in session
    useSessionStore.getState().setPushToken(token);
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
    });

    await Notifications.setNotificationChannelAsync('tryon-results', {
      name: 'Try-On Sonuçları',
      description: 'Try-on işlemlerinizin sonuçları için bildirimler',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
    });
  }

  return token;
};

/**
 * Schedule a local notification (for testing)
 */
export const scheduleLocalNotification = async (
  notification: PushNotificationPayload
): Promise<string> => {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
    },
    trigger: null, // Immediately
  });

  return identifier;
};

/**
 * Send notification when try-on job is completed
 */
export const sendJobCompletedNotification = async (jobId: string): Promise<void> => {
  await scheduleLocalNotification({
    title: '✨ Denemen Hazır!',
    body: 'Kıyafet denemesi tamamlandı. Sonucu görmek için tıkla.',
    data: {
      type: 'job_completed',
      jobId,
      screen: `/generation/${jobId}`,
    },
  });
};

/**
 * Send notification when try-on job fails
 */
export const sendJobFailedNotification = async (jobId: string): Promise<void> => {
  await scheduleLocalNotification({
    title: '❌ Deneme Başarısız',
    body: 'Kıyafet denemesi tamamlanamadı. Lütfen tekrar deneyin.',
    data: {
      type: 'job_failed',
      jobId,
    },
  });
};

/**
 * Add notification response listener
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number): Promise<boolean> => {
  return await Notifications.setBadgeCountAsync(count);
};

/**
 * Clear badge count
 */
export const clearBadge = async (): Promise<boolean> => {
  return await Notifications.setBadgeCountAsync(0);
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Dismiss all notifications from notification center
 */
export const dismissAllNotifications = async (): Promise<void> => {
  await Notifications.dismissAllNotificationsAsync();
};

