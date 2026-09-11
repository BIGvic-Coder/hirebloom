import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'contracts' | 'hardware' | 'channels' | 'welcome';
}

export interface OfferItem {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  company: string;
  role: string;
  salary: string;
  hours: string;
  startDate: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  terms: string;
  onboardingTasks: OnboardingTask[];
  createdAt: string;
}

const OFFERS_STORAGE_KEY = '@hirebloom_offers_cache';

const DEFAULT_ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: 'task-1',
    title: 'Review & Sign Hire Bloom Direct Contractor Agreement',
    description: 'Compliant international remote service agreement managed by Hire Bloom.',
    completed: true,
    category: 'contracts',
  },
  {
    id: 'task-2',
    title: 'Workstation Hardware & Fiber Speed Confirmation',
    description: 'Verify 50+ Mbps download speed, UPS battery backup, and clear HD camera framing.',
    completed: true,
    category: 'hardware',
  },
  {
    id: 'task-3',
    title: 'Client Workspace Onboarding (Slack & CRM Access)',
    description: 'Accept invitation to partner Slack workspace and configure Zendesk/Intercom seat.',
    completed: false,
    category: 'channels',
  },
  {
    id: 'task-4',
    title: 'Team Welcome & Alignment Sync',
    description: '30-minute kickoff video sync with your team lead on day one.',
    completed: false,
    category: 'welcome',
  },
];

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'offer-1',
    applicationId: 'app-2',
    candidateName: 'Victor Taiwo',
    candidateEmail: 'victor@hirebloom.com',
    company: 'DesignFlow',
    role: 'Technical Onboarding Specialist',
    salary: '$15.00 / hr',
    hours: 'Full-time (40 hrs/wk, US EST)',
    startDate: 'Sep 25, 2026',
    status: 'Accepted',
    terms: 'Embedded Team flat rate contract. Payroll, international compliance, and contracts administered by Hire Bloom.',
    onboardingTasks: DEFAULT_ONBOARDING_TASKS,
    createdAt: 'Aug 26, 2026',
  },
];

export const OffersService = {
  async getOffers(): Promise<OfferItem[]> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        const snap = await getDocs(collection(db, 'offers'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OfferItem));
        }
      }

      const local = await AsyncStorage.getItem(OFFERS_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }

      await AsyncStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(INITIAL_OFFERS));
      return INITIAL_OFFERS;
    } catch {
      return INITIAL_OFFERS;
    }
  },

  async createOffer(data: Omit<OfferItem, 'id' | 'status' | 'onboardingTasks' | 'createdAt'>): Promise<{ success: boolean; offer?: OfferItem; error?: string }> {
    try {
      const newId = `offer-${Date.now()}`;
      const newOffer: OfferItem = {
        ...data,
        id: newId,
        status: 'Pending',
        onboardingTasks: DEFAULT_ONBOARDING_TASKS.map((t) => ({ ...t, completed: false })),
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'offers', newId), newOffer);
      }

      const current = await this.getOffers();
      const updated = [newOffer, ...current];
      await AsyncStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updated));

      return { success: true, offer: newOffer };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create offer.' };
    }
  },

  async acceptOffer(offerId: string): Promise<boolean> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        await updateDoc(doc(db, 'offers', offerId), { status: 'Accepted' });
      }

      const current = await this.getOffers();
      const updated = current.map((o) => (o.id === offerId ? { ...o, status: 'Accepted' as const } : o));
      await AsyncStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  async toggleOnboardingTask(offerId: string, taskId: string): Promise<boolean> {
    try {
      const current = await this.getOffers();
      const updated = current.map((o) => {
        if (o.id !== offerId) return o;
        const tasks = o.onboardingTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
        return { ...o, onboardingTasks: tasks };
      });
      await AsyncStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
};
