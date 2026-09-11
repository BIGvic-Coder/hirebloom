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
}

const NOTIFICATIONS_STORAGE_KEY = '@hirebloom_notifications_cache';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'demo-candidate-1',
    type: 'application',
    title: 'Matched to Client Requisition',
    body: 'Your vetted profile has been matched to InnovateX for Senior Customer Support Lead.',
    deepLink: '/candidate/applications',
    read: false,
    createdAt: '10 minutes ago',
  },
  {
    id: 'notif-2',
    userId: 'demo-candidate-1',
    type: 'interview',
    title: 'Interview Scheduled',
    body: 'Client panel interview confirmed for Wednesday at 2:00 PM EST via Google Meet.',
    deepLink: '/candidate/interviews',
    read: false,
    createdAt: '2 hours ago',
  },
  {
    id: 'notif-3',
    userId: 'demo-candidate-1',
    type: 'offer',
    title: 'Contract Offer Extended',
    body: 'DesignFlow extended a formal remote placement offer ($15 - $16 / hr).',
    deepLink: '/candidate/applications',
    read: true,
    createdAt: '1 day ago',
  },
  {
    id: 'notif-4',
    userId: 'demo-candidate-1',
    type: 'system',
    title: 'Welcome to Hire Bloom',
    body: 'Your profile has completed initial verification with C1 English status.',
    deepLink: '/candidate/profile',
    read: true,
    createdAt: '3 days ago',
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

      return list;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  async getUnreadCount(userId?: string): Promise<number> {
    const list = await this.getNotifications(userId);
    return list.filter((n) => !n.read).length;
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        await updateDoc(doc(db, 'notifications', notificationId), { read: true });
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
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: 'Just now',
    };

    try {
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      }

      const all = await this.getNotifications(item.userId);
      const updated = [newNotif, ...all];
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handled silently
    }

    return newNotif;
  }
};
