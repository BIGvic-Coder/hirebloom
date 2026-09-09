import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

export type ApplicationStatus = 
  | 'Pending Review' 
  | 'Screening' 
  | 'Interview Scheduled' 
  | 'Offer Received' 
  | 'Not Selected';

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  applicants: number;
  posted: string;
  status: 'Active' | 'Drafts' | 'Closed';
  postedByRole: string;
  postedByUid?: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: ApplicationStatus;
  statusColor: string;
  statusBg: string;
  appliedDate: string;
  step: string;
  notes?: string;
  feedbackReason?: string;
}

// Roles permitted to post jobs
export const ALLOWED_JOB_POSTER_ROLES = ['admin', 'owner', 'ceo', 'employer'];

export function canUserPostJob(role?: string | null): boolean {
  if (!role) return false;
  return ALLOWED_JOB_POSTER_ROLES.includes(role.toLowerCase().trim());
}

export function getStatusStyle(status: ApplicationStatus): { color: string; bg: string } {
  switch (status) {
    case 'Pending Review':
      return { color: '#d97706', bg: '#fef3c7' }; // Amber
    case 'Screening':
      return { color: '#2563eb', bg: '#dbeafe' }; // Blue
    case 'Interview Scheduled':
      return { color: '#7c3aed', bg: '#ede9fe' }; // Purple
    case 'Offer Received':
      return { color: '#059669', bg: '#d1fae5' }; // Emerald
    case 'Not Selected':
      return { color: '#dc2626', bg: '#fee2e2' }; // Red
    default:
      return { color: '#64748b', bg: '#f1f5f9' };
  }
}

// Initial seed data
const DEFAULT_JOBS: JobItem[] = [
  { 
    id: 'job-1', 
    title: 'Senior Customer Support Lead', 
    company: 'InnovateX', 
    location: 'Remote (US Hours)', 
    salary: '$15 - $18 / hr', 
    type: 'Full-time', 
    tags: ['Zendesk', 'BYU-Pathway', 'Bilingual'], 
    applicants: 24, 
    posted: '2 days ago', 
    status: 'Active',
    postedByRole: 'employer',
    createdAt: new Date().toISOString()
  },
  { 
    id: 'job-2', 
    title: 'Technical Onboarding Specialist', 
    company: 'DesignFlow', 
    location: 'Remote (Americas)', 
    salary: '$14 - $16 / hr', 
    type: 'Full-time', 
    tags: ['Client Success', 'SaaS', 'Intercom'], 
    applicants: 18, 
    posted: '4 days ago', 
    status: 'Active',
    postedByRole: 'ceo',
    createdAt: new Date().toISOString()
  },
  { 
    id: 'job-3', 
    title: 'Node.js & Backend Support Engineer', 
    company: 'CloudCore Corp', 
    location: 'Remote (Global)', 
    salary: '$18 - $22 / hr', 
    type: 'Contract', 
    tags: ['Node.js', 'API', 'PostgreSQL'], 
    applicants: 5, 
    posted: '1 week ago', 
    status: 'Active',
    postedByRole: 'admin',
    createdAt: new Date().toISOString()
  },
  { 
    id: 'job-4', 
    title: 'Executive Operations Assistant', 
    company: 'Hirebloom Direct', 
    location: 'Remote (US Hours)', 
    salary: '$13 - $15 / hr', 
    type: 'Full-time', 
    tags: ['Admin', 'Coordination', 'English C2'], 
    applicants: 0, 
    posted: '3 weeks ago', 
    status: 'Drafts',
    postedByRole: 'owner',
    createdAt: new Date().toISOString()
  },
];

const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Lead Support Specialist',
    company: 'InnovateX',
    candidateId: 'demo-candidate-1',
    candidateName: 'Alex Morgan',
    candidateEmail: 'alex.morgan@hirebloom.com',
    status: 'Interview Scheduled',
    statusColor: '#7c3aed',
    statusBg: '#ede9fe',
    appliedDate: 'Aug 10, 2026',
    step: 'Live Client Panel Interview on Google Meet',
    notes: 'Strong performance on verbal English assessment (96%). Hardware setup verified.',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Customer Success Manager',
    company: 'DesignFlow',
    candidateId: 'demo-candidate-1',
    candidateName: 'Alex Morgan',
    candidateEmail: 'alex.morgan@hirebloom.com',
    status: 'Offer Received',
    statusColor: '#059669',
    statusBg: '#d1fae5',
    appliedDate: 'Aug 04, 2026',
    step: 'Review Contract Offer ($15/hr flat rate)',
    notes: 'Client was impressed with BYU-Pathway communication background.',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    jobTitle: 'Technical Support Executive',
    company: 'CloudCore Corp',
    candidateId: 'demo-candidate-1',
    candidateName: 'Alex Morgan',
    candidateEmail: 'alex.morgan@hirebloom.com',
    status: 'Not Selected',
    statusColor: '#dc2626',
    statusBg: '#fee2e2',
    appliedDate: 'Jul 28, 2026',
    step: 'Candidate Selection Completed',
    notes: 'High application volume.',
    feedbackReason: 'We were grateful for your time and interview. CloudCore selected a finalist with dedicated Kafka distributed-event background. You are pre-vetted and kept on active priority for new backend roles!',
  },
];

const JOBS_STORAGE_KEY = '@hirebloom_jobs_cache';
const APPS_STORAGE_KEY = '@hirebloom_applications_cache';

// Service API
export const ApplicationsService = {
  // 1. Fetch all jobs
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
    } catch (e) {
      console.warn('Error fetching jobs:', e);
      return DEFAULT_JOBS;
    }
  },

  // 2. Create job (Role Restricted: Admin, Owner, CEO, Employer)
  async createJob(jobData: Omit<JobItem, 'id' | 'createdAt' | 'applicants'>, userRole: string, userUid?: string): Promise<{ success: boolean; job?: JobItem; error?: string }> {
    if (!canUserPostJob(userRole)) {
      return { 
        success: false, 
        error: `Unauthorized: Only Admins, Owners, CEOs, or verified Employers have permission to post new roles. Your current role is "${userRole}".` 
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
      createdAt: new Date().toISOString(),
    };

    try {
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'jobs', newId), newJob);
      }
      
      const currentJobs = await this.getJobs();
      const updated = [newJob, ...currentJobs];
      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, job: newJob };
    } catch (e: any) {
      console.warn('Error creating job:', e);
      return { success: false, error: e.message || 'Failed to publish role.' };
    }
  },

  // 3. Candidate: Apply for a job
  async applyForJob(job: JobItem, candidate: { id: string; name: string; email: string; note?: string }): Promise<{ success: boolean; application?: JobApplication; error?: string }> {
    try {
      const existingApps = await this.getCandidateApplications(candidate.id);
      const alreadyApplied = existingApps.some((a) => a.jobId === job.id);
      if (alreadyApplied) {
        return { success: false, error: 'You have already submitted an application for this position.' };
      }

      const appId = `app-${Date.now()}`;
      const style = getStatusStyle('Pending Review');
      const newApp: JobApplication = {
        id: appId,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        status: 'Pending Review',
        statusColor: style.color,
        statusBg: style.bg,
        appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        step: 'Awaiting Recruiter Screening Feedback',
        notes: candidate.note || 'Application submitted via Hirebloom candidate portal.',
      };

      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'applications', appId), newApp);
      }

      const updatedApps = [newApp, ...existingApps];
      await AsyncStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updatedApps));

      // Also increment applicants count on the job
      const jobs = await this.getJobs();
      const updatedJobs = jobs.map((j) => (j.id === job.id ? { ...j, applicants: j.applicants + 1 } : j));
      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));

      return { success: true, application: newApp };
    } catch (e: any) {
      console.warn('Error applying for job:', e);
      return { success: false, error: e.message || 'Failed to submit application.' };
    }
  },

  // 4. Fetch candidate's applications (all statuses including 'Not Selected')
  async getCandidateApplications(candidateId?: string): Promise<JobApplication[]> {
    try {
      if (!IS_MOCK_FIREBASE && db && candidateId) {
        const q = query(collection(db, 'applications'), where('candidateId', '==', candidateId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplication));
        }
      }

      const local = await AsyncStorage.getItem(APPS_STORAGE_KEY);
      if (local) {
        const parsed: JobApplication[] = JSON.parse(local);
        if (candidateId) {
          return parsed.filter((a) => a.candidateId === candidateId || a.candidateId === 'demo-candidate-1');
        }
        return parsed;
      }

      await AsyncStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    } catch (e) {
      console.warn('Error fetching candidate applications:', e);
      return DEFAULT_APPLICATIONS;
    }
  },

  // 5. Update application status (by Employer / Recruiter / Admin)
  async updateApplicationStatus(
    appId: string, 
    newStatus: ApplicationStatus, 
    options?: { step?: string; notes?: string; feedbackReason?: string }
  ): Promise<boolean> {
    try {
      const style = getStatusStyle(newStatus);
      const updates: Partial<JobApplication> = {
        status: newStatus,
        statusColor: style.color,
        statusBg: style.bg,
        step: options?.step || (newStatus === 'Not Selected' ? 'Candidate Selection Completed' : newStatus === 'Interview Scheduled' ? 'Client Panel Interview Scheduled' : 'Application Review Completed'),
        ...(options?.notes ? { notes: options.notes } : {}),
        ...(options?.feedbackReason ? { feedbackReason: options.feedbackReason } : {}),
      };

      if (!IS_MOCK_FIREBASE && db) {
        await updateDoc(doc(db, 'applications', appId), updates);
      }

      const local = await AsyncStorage.getItem(APPS_STORAGE_KEY);
      const allApps: JobApplication[] = local ? JSON.parse(local) : DEFAULT_APPLICATIONS;
      const updated = allApps.map((a) => (a.id === appId ? { ...a, ...updates } : a));
      await AsyncStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updated));

      return true;
    } catch (e) {
      console.warn('Error updating application status:', e);
      return false;
    }
  }
};
