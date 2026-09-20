import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';

export type NotificationCategory = 'application' | 'interview' | 'offer' | 'onboarding' | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationCategory;
  title: string;
  body: string;
  deepLink?: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    applicationId?: string;
    jobTitle?: string;
    company?: string;
    salary?: string;
    startDate?: string;
    meetUrl?: string;
    interviewDate?: string;
    interviewTime?: string;
  };
}

const NOTIFICATIONS_STORAGE_KEY = '@hirebloom_notifications_cache';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome',
    userId: 'all',
    type: 'system',
    title: 'Welcome to HireBloom',
    body: 'Explore open roles, apply with your resume, and track your interviews and offers in real-time.',
    deepLink: '/candidate',
    read: false,
    createdAt: 'Just now',
  },
];

export const NotificationsService = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    try {
      let list: NotificationItem[] = [];
      const local = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (local) {
        list = JSON.parse(local);
      } else {
        list = INITIAL_NOTIFICATIONS;
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
      }

      if (!IS_MOCK_FIREBASE && db && userId) {
        try {
          const q = query(collection(db, 'notifications'), where('userId', '==', userId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const cloudDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
            for (const item of cloudDocs) {
              if (!list.find((n) => n.id === item.id)) {
                list.push(item);
              }
            }
          }
        } catch {
          // Handled silently
        }
      }

      // Deduplicate strictly by unique notification ID
      const uniqueMap = new Map<string, NotificationItem>();
      for (const item of list) {
        if (item && item.id) {
          uniqueMap.set(item.id, item);
        }
      }
      const uniqueList = Array.from(uniqueMap.values());

      // If storage had duplicate items, heal and update local storage automatically
      if (uniqueList.length !== list.length) {
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(uniqueList));
      }

      if (userId) {
        const cleanUser = userId.trim().toLowerCase();
        return uniqueList.filter(
          (n) =>
            (n.userId && n.userId.toLowerCase() === cleanUser) ||
            (n.type === 'system' && (!n.userId || n.userId === 'all'))
        );
      }

      return uniqueList;
    } catch {
      return [];
    }
  },

  async getUnreadCount(userId?: string): Promise<number> {
    const list = await this.getNotifications(userId);
    return list.filter((n) => !n.read).length;
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        try {
          await updateDoc(doc(db, 'notifications', notificationId), { read: true });
        } catch {
          // Silent catch
        }
      }

      const all = await this.getNotifications();
      const updated = all.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handled silently
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      const all = await this.getNotifications();
      const updated = all.map((n) => ({ ...n, read: true }));
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handled silently
    }
  },

  async sendNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      read: false,
      createdAt: 'Just now',
    };

    try {
      if (!IS_MOCK_FIREBASE && db) {
        try {
          await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
        } catch {
          // Handled silently
        }
      }

      const all = await this.getNotifications();
      const deduplicated = all.filter((n) => n.id !== newNotif.id);
      const updated = [newNotif, ...deduplicated];
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handled silently
    }

    return newNotif;
  },

  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch {
      // Handled silently
    }
  }
};
