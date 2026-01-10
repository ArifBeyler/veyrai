import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '../services/pushNotifications';
import { useSessionStore } from '../state/useSessionStore';

type NotificationData = {
  type: 'job_completed' | 'job_failed' | 'promo' | 'general';
  jobId?: string;
  screen?: string;
};

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const setPushToken = useSessionStore((s) => s.setPushToken);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        setPushToken(token);
      }
    });

    // Handle notification when app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      setNotification(notification);
      console.log('Notification received:', notification);
    });

    // Handle notification tap
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('Notification response:', response);
      
      const data = response.notification.request.content.data as NotificationData | undefined;
      
      if (data?.screen) {
        // Navigate to the specified screen
        router.push(data.screen as any);
      } else if (data?.type === 'job_completed' && data.jobId) {
        // Navigate to generation result
        router.push(`/generation/${data.jobId}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [setPushToken]);

  return {
    expoPushToken,
    notification,
  };
};

