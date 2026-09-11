import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  timezone: string;
  tags: string[];
  applicants: number;
  posted: string;
  status: 'Active' | 'Drafts' | 'Closed';
  postedByRole: string;
  postedByUid?: string;
  description?: string;
  requirements?: string[];
  verified: boolean;
  createdAt: string;
}

export const ALLOWED_JOB_POSTERS = ['admin', 'owner', 'ceo', 'employer'];

export function canUserPostJob(role?: string | null): boolean {
  if (!role) return false;
  return ALLOWED_JOB_POSTERS.includes(role.toLowerCase().trim());
}

export const DEFAULT_JOBS: JobItem[] = [
  {
    id: 'job-1',
    title: 'Senior Customer Support Lead',
    company: 'InnovateX',
    location: 'Remote (US Hours)',
    salary: '$15 - $18 / hr',
    type: 'Full-time',
    timezone: 'EST / CST (9 AM - 5 PM)',
    tags: ['Zendesk', 'BYU-Pathway', 'Bilingual C1'],
    applicants: 24,
    posted: '2 days ago',
    status: 'Active',
    postedByRole: 'employer',
    verified: true,
    description: 'Lead high-volume tier-2 support operations for high-growth US SaaS users. Requires demonstrated Zendesk macro mastery and native verbal English fluency.',
    requirements: [
      '4+ years proven customer support experience in SaaS',
      'C1 or C2 accredited verbal & written English',
      'Dedicated home workstation with fiber internet & power backup',
      'BYU-Pathway or US college accredited degree preferred'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    title: 'Technical Onboarding Specialist',
    company: 'DesignFlow',
    location: 'Remote (Americas)',
    salary: '$14 - $16 / hr',
    type: 'Full-time',
    timezone: 'EST (8 AM - 4 PM)',
    tags: ['Client Success', 'SaaS', 'Intercom'],
    applicants: 18,
    posted: '4 days ago',
    status: 'Active',
    postedByRole: 'ceo',
    verified: true,
    description: 'Guide new enterprise software customers through account setup, SSO integrations, and user training sessions.',
    requirements: [
      'Experience in customer onboarding or technical client success',
      'Excellent screen-share presentation skills',
      'Comfortable with API concepts and webhook configurations'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    title: 'Node.js & Backend Support Engineer',
    company: 'CloudCore Corp',
    location: 'Remote (Global)',
    salary: '$18 - $22 / hr',
    type: 'Full-time',
    timezone: 'Flexible US Overlap (4 hours)',
    tags: ['Node.js', 'API', 'PostgreSQL'],
    applicants: 5,
    posted: '1 week ago',
    status: 'Active',
    postedByRole: 'admin',
    verified: true,
    description: 'Debug API latency issues, review database query bottlenecks, and support live integrations.',
    requirements: [
      'Strong JavaScript / TypeScript / Node.js proficiency',
      'Relational database querying (PostgreSQL / MySQL)',
      'Proven ability to debug production errors under SLA'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-4',
    title: 'Executive Operations Assistant',
    company: 'Hire Bloom Direct',
    location: 'Remote (US Hours)',
    salary: '$13 - $15 / hr',
    type: 'Full-time',
    timezone: 'PST / MST',
    tags: ['Admin', 'Coordination', 'English C2'],
    applicants: 12,
    posted: '3 days ago',
    status: 'Active',
    postedByRole: 'owner',
    verified: true,
    description: 'Provide executive coordination, calendar synchronization, and international contractor onboarding management.',
    requirements: [
      'Exceptional organization and high attention to detail',
      'Proficiency with Google Workspace, Slack, and Notion',
      'Proactive calendar and task management'
    ],
    createdAt: new Date().toISOString(),
  },
];

const JOBS_STORAGE_KEY = '@hirebloom_jobs_cache';

export const JobsService = {
  async getJobs(): Promise<JobItem[]> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        const snap = await getDocs(collection(db, 'jobs'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobItem));
        }
      }

      const local = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }

      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(DEFAULT_JOBS));
      return DEFAULT_JOBS;
    } catch {
      return DEFAULT_JOBS;
    }
  },

  async getJobById(id: string): Promise<JobItem | null> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.id === id) || null;
  },

  async createJob(
    jobData: Omit<JobItem, 'id' | 'createdAt' | 'applicants'>,
    userRole: string,
    userUid?: string
  ): Promise<{ success: boolean; job?: JobItem; error?: string }> {
    if (!canUserPostJob(userRole)) {
      return {
        success: false,
        error: `Unauthorized: Only Admins, Owners, CEOs, or verified Employers have permission to post roles. Your current role is "${userRole}".`,
      };
    }

    const newId = `job-${Date.now()}`;
    const newJob: JobItem = {
      ...jobData,
      id: newId,
      applicants: 0,
      posted: 'Just now',
      postedByRole: userRole,
      postedByUid: userUid || 'unknown',
      verified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'jobs', newId), newJob);
      }

      const current = await this.getJobs();
      const updated = [newJob, ...current];
      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, job: newJob };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to publish job.' };
    }
  },

  async updateJobStatus(id: string, status: 'Active' | 'Drafts' | 'Closed'): Promise<boolean> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        await updateDoc(doc(db, 'jobs', id), { status });
      }

      const jobs = await this.getJobs();
      const updated = jobs.map((j) => (j.id === id ? { ...j, status } : j));
      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
};
