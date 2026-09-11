import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export interface InterviewItem {
  id: string;
  applicationId?: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  candidateEmail?: string;
  interviewer: string;
  date: string;
  time: string;
  timezone: string;
  duration: string;
  meetingUrl: string;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

const INTERVIEWS_STORAGE_KEY = '@hirebloom_interviews_cache';

const INITIAL_INTERVIEWS: InterviewItem[] = [
  {
    id: 'int-1',
    applicationId: 'app-hirebloom-1',
    jobTitle: 'Senior Customer Support Lead',
    company: 'InnovateX',
    candidateName: 'Victor Taiwo',
    candidateEmail: 'victor@hirebloom.com',
    interviewer: 'David Vance (Director of Operations)',
    date: 'Wednesday, Sep 16, 2026',
    time: '2:00 PM - 2:30 PM',
    timezone: 'EST (US New York)',
    duration: '30 mins',
    meetingUrl: 'https://meet.google.com/hbm-intr-vct',
    type: 'Client Panel Interview',
    status: 'Scheduled',
    notes: 'Technical walkthrough of Zendesk escalation macros and team leadership scenario.',
  },
  {
    id: 'int-2',
    applicationId: 'app-2',
    jobTitle: 'Technical Onboarding Specialist',
    company: 'DesignFlow',
    candidateName: 'Victor Taiwo',
    candidateEmail: 'victor@hirebloom.com',
    interviewer: 'Zanele Mthembu (Client Success Manager)',
    date: 'Friday, Sep 18, 2026',
    time: '11:00 AM - 11:30 AM',
    timezone: 'EST (US New York)',
    duration: '30 mins',
    meetingUrl: 'https://meet.google.com/xyz-qprs-tuv',
    type: 'Final Round Evaluation',
    status: 'Scheduled',
    notes: 'Screen share demonstration of customer workflow onboarding.',
  },
];

export const InterviewsService = {
  async getInterviews(): Promise<InterviewItem[]> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        const snap = await getDocs(collection(db, 'interviews'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InterviewItem));
        }
      }

      const local = await AsyncStorage.getItem(INTERVIEWS_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }

      await AsyncStorage.setItem(INTERVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_INTERVIEWS));
      return INITIAL_INTERVIEWS;
    } catch {
      return INITIAL_INTERVIEWS;
    }
  },

  async scheduleInterview(
    data: Omit<InterviewItem, 'id' | 'status'>
  ): Promise<{ success: boolean; interview?: InterviewItem; error?: string }> {
    try {
      const newId = `int-${Date.now()}`;
      const newInterview: InterviewItem = {
        ...data,
        id: newId,
        status: 'Scheduled',
      };

      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'interviews', newId), newInterview);
      }

      const current = await this.getInterviews();
      const updated = [newInterview, ...current];
      await AsyncStorage.setItem(INTERVIEWS_STORAGE_KEY, JSON.stringify(updated));

      return { success: true, interview: newInterview };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to schedule interview.' };
    }
  },

  async cancelInterview(id: string): Promise<boolean> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        await updateDoc(doc(db, 'interviews', id), { status: 'Cancelled' });
      }

      const current = await this.getInterviews();
      const updated = current.map((i) => (i.id === id ? { ...i, status: 'Cancelled' as const } : i));
      await AsyncStorage.setItem(INTERVIEWS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
};
