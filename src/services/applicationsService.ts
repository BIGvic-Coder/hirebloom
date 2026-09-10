import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  getDoc,
  query, 
  where 
} from 'firebase/firestore';

export type ApplicationStatus = 
  | 'Pending Final Review'
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
  candidateInitials?: string;
  status: ApplicationStatus;
  statusColor: string;
  statusBg: string;
  appliedDate: string;
  step: string;
  notes?: string;
  feedbackReason?: string;
  // Resume details
  resumeName?: string;
  resumeSize?: string;
  resumeUrl?: string;
  resumeUploadedAt?: string;
  // Interview / Offer metadata
  interviewDetails?: {
    date: string;
    time: string;
    meetUrl?: string;
    type?: string;
  };
  offerDetails?: {
    salary: string;
    startDate?: string;
    role?: string;
  };
}

export interface UserSession {
  uid: string;
  email: string;
  name: string;
  role: 'candidate' | 'employer' | 'recruiter' | 'admin';
  initials: string;
}

// Roles permitted to post jobs
export const ALLOWED_JOB_POSTER_ROLES = ['admin', 'owner', 'ceo', 'employer'];

export function canUserPostJob(role?: string | null): boolean {
  if (!role) return false;
  return ALLOWED_JOB_POSTER_ROLES.includes(role.toLowerCase().trim());
}

export function getStatusStyle(status: ApplicationStatus): { color: string; bg: string } {
  switch (status) {
    case 'Pending Final Review':
      return { color: '#0f172a', bg: '#f1f5f9' }; // Slate / HireBloom dark
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

// Initial seed jobs
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

// Initial seed applications matching the user's HireBloom Talent Portal status screenshot!
const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-hirebloom-1',
    jobId: 'job-1',
    jobTitle: 'Senior Customer Support Lead',
    company: 'InnovateX',
    candidateId: 'demo-candidate-1',
    candidateName: 'Victor Taiwo',
    candidateEmail: 'victor@hirebloom.com',
    candidateInitials: 'VT',
    status: 'Pending Final Review',
    statusColor: '#0f172a',
    statusBg: '#f1f5f9',
    appliedDate: 'Sep 08, 2026',
    step: 'Hiring Team Final Review',
    notes: 'Initial screening and video pitch passed. Experience aligned with current US tech customer success opening.',
    resumeName: 'victor_resume_2026.pdf',
    resumeSize: '1.4 MB',
    resumeUploadedAt: 'Sep 08, 2026',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Technical Onboarding Specialist',
    company: 'DesignFlow',
    candidateId: 'demo-candidate-1',
    candidateName: 'Victor Taiwo',
    candidateEmail: 'victor@hirebloom.com',
    candidateInitials: 'VT',
    status: 'Offer Received',
    statusColor: '#059669',
    statusBg: '#d1fae5',
    appliedDate: 'Aug 24, 2026',
    step: 'Review Contract Offer ($15/hr flat rate)',
    notes: 'Client was impressed with BYU-Pathway communication background.',
    resumeName: 'victor_resume_2026.pdf',
    resumeSize: '1.4 MB',
    offerDetails: {
      salary: '$15 - $16 / hr',
      startDate: 'Sep 25, 2026',
      role: 'Technical Onboarding Specialist'
    }
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    jobTitle: 'Node.js & Backend Support Engineer',
    company: 'CloudCore Corp',
    candidateId: 'demo-candidate-1',
    candidateName: 'Victor Taiwo',
    candidateEmail: 'victor@hirebloom.com',
    candidateInitials: 'VT',
    status: 'Interview Scheduled',
    statusColor: '#7c3aed',
    statusBg: '#ede9fe',
    appliedDate: 'Aug 18, 2026',
    step: 'Live Technical Panel on Google Meet',
    notes: 'Verified remote setup and strong verbal English.',
    resumeName: 'victor_resume_2026.pdf',
    resumeSize: '1.4 MB',
    interviewDetails: {
      date: 'Sep 14, 2026',
      time: '3:00 PM EST',
      meetUrl: 'https://meet.google.com/hbm-intr-vct',
      type: 'Panel Video Interview'
    }
  },
];

const JOBS_STORAGE_KEY = '@hirebloom_jobs_cache';
const APPS_STORAGE_KEY = '@hirebloom_applications_cache';
const CURRENT_USER_KEY = '@hirebloom_current_user';
const RESUME_STORAGE_KEY = '@hirebloom_saved_resume';

// Service API
export const ApplicationsService = {
  // Helper to extract initials
  getInitials(name?: string, email?: string): string {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
        return parts[0].slice(0, 2).toUpperCase();
      }
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'VT';
  },

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

  // 3. Candidate: Apply for a job with optional resume
  async applyForJob(
    job: JobItem, 
    candidate: { 
      id: string; 
      name: string; 
      email: string; 
      note?: string; 
      resume?: { name: string; size: string; url?: string } 
    }
  ): Promise<{ success: boolean; application?: JobApplication; error?: string }> {
    try {
      const existingApps = await this.getCandidateApplications(candidate.id);
      const alreadyApplied = existingApps.some((a) => a.jobId === job.id);
      if (alreadyApplied) {
        return { success: false, error: 'You have already submitted an application for this position.' };
      }

      const appId = `app-${Date.now()}`;
      // In HireBloom, applications initially enter 'Pending Final Review' or 'Pending Review'
      const status: ApplicationStatus = 'Pending Final Review';
      const style = getStatusStyle(status);
      const initials = this.getInitials(candidate.name, candidate.email);

      const resumeInfo = candidate.resume || await this.getSavedCandidateResume() || {
        name: 'victor_resume_2026.pdf',
        size: '1.4 MB',
      };

      const newApp: JobApplication = {
        id: appId,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidateInitials: initials,
        status: status,
        statusColor: style.color,
        statusBg: style.bg,
        appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        step: 'Hiring Team Final Review',
        notes: candidate.note || 'Application submitted via Hirebloom candidate portal with attached resume.',
        resumeName: resumeInfo.name,
        resumeSize: resumeInfo.size,
        resumeUrl: resumeInfo.url,
        resumeUploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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

  // 4. Fetch candidate's applications
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
          const userApps = parsed.filter((a) => a.candidateId === candidateId || a.candidateId === 'demo-candidate-1');
          return userApps.length > 0 ? userApps : parsed;
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

  // 5. Fetch all applications (for Employer & Recruiter backend)
  async getAllApplications(): Promise<JobApplication[]> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        const snap = await getDocs(collection(db, 'applications'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplication));
        }
      }

      const local = await AsyncStorage.getItem(APPS_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }

      await AsyncStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    } catch (e) {
      console.warn('Error fetching all applications:', e);
      return DEFAULT_APPLICATIONS;
    }
  },

  // 6. Update application status (by Employer / Recruiter / Admin)
  async updateApplicationStatus(
    appId: string, 
    newStatus: ApplicationStatus, 
    options?: { 
      step?: string; 
      notes?: string; 
      feedbackReason?: string;
      interviewDetails?: JobApplication['interviewDetails'];
      offerDetails?: JobApplication['offerDetails'];
    }
  ): Promise<boolean> {
    try {
      const style = getStatusStyle(newStatus);
      const updates: Partial<JobApplication> = {
        status: newStatus,
        statusColor: style.color,
        statusBg: style.bg,
        step: options?.step || (
          newStatus === 'Pending Final Review' ? 'Hiring Team Final Review' :
          newStatus === 'Not Selected' ? 'Candidate Selection Completed' : 
          newStatus === 'Interview Scheduled' ? 'Client Panel Interview Scheduled' : 
          newStatus === 'Offer Received' ? 'Offer Extended to Candidate' : 
          'Application Review Completed'
        ),
        ...(options?.notes ? { notes: options.notes } : {}),
        ...(options?.feedbackReason ? { feedbackReason: options.feedbackReason } : {}),
        ...(options?.interviewDetails ? { interviewDetails: options.interviewDetails } : {}),
        ...(options?.offerDetails ? { offerDetails: options.offerDetails } : {}),
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
  },

  // Decision shortcuts for employers/recruiters:
  async advanceToFinalReview(appId: string, notes?: string): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Pending Final Review', {
      step: 'Hiring Team Final Review',
      notes: notes || 'Candidate advanced to final review after passing preliminary screening.'
    });
  },

  async scheduleInterview(appId: string, details: { date: string; time: string; meetUrl?: string; type?: string }): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Interview Scheduled', {
      step: `Interview Scheduled on ${details.date} at ${details.time}`,
      notes: 'Invited to panel interview with hiring team.',
      interviewDetails: details
    });
  },

  async makeOffer(appId: string, offer: { salary: string; startDate?: string; role?: string }): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Offer Received', {
      step: `Offer Extended (${offer.salary})`,
      notes: 'Candidate accepted by hiring partner. Formal employment offer sent.',
      offerDetails: offer
    });
  },

  async markNotSelected(appId: string, feedbackReason: string): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Not Selected', {
      step: 'Candidate Selection Completed',
      feedbackReason: feedbackReason || 'We appreciate your time and interest. Our hiring team selected another candidate whose immediate domain experience aligned more closely with current team needs.'
    });
  },

  // 7. Resume Storage & Management
  async saveCandidateResume(resume: { name: string; size: string; url?: string }): Promise<void> {
    await AsyncStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume));
  },

  async getSavedCandidateResume(): Promise<{ name: string; size: string; url?: string } | null> {
    try {
      const saved = await AsyncStorage.getItem(RESUME_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Default resume seed
      return {
        name: 'victor_resume_2026.pdf',
        size: '1.4 MB',
      };
    } catch {
      return null;
    }
  },

  // 8. Email Verification Code (OTP) Authentication Flow
  async sendEmailOtp(email: string): Promise<{ success: boolean; code: string; message: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, code: '', message: 'Please enter a valid email address.' };
    }

    // Generate 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
      const otpPayload = JSON.stringify({ code: otpCode, expiry });
      await AsyncStorage.setItem(`@hirebloom_otp_${cleanEmail}`, otpPayload);

      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'email_otps', cleanEmail), {
          code: otpCode,
          email: cleanEmail,
          expiry: new Date(expiry).toISOString(),
          createdAt: new Date().toISOString()
        });
      }

      console.log(`[HireBloom OTP] Verification code for ${cleanEmail}: ${otpCode}`);
      return {
        success: true,
        code: otpCode,
        message: `A 6-digit verification code has been sent to ${cleanEmail}.`
      };
    } catch (e: any) {
      console.warn('Error saving OTP:', e);
      return {
        success: true,
        code: otpCode,
        message: `Verification code generated.`
      };
    }
  },

  async verifyEmailOtp(email: string, enteredCode: string): Promise<{ success: boolean; user?: UserSession; error?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (enteredCode || '').trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: 'Please enter your email and 6-digit code.' };
    }

    try {
      // Check stored OTP
      const stored = await AsyncStorage.getItem(`@hirebloom_otp_${cleanEmail}`);
      let isValid = false;

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.code === cleanCode && parsed.expiry > Date.now()) {
          isValid = true;
        }
      }

      // Also check Firestore if available
      if (!isValid && !IS_MOCK_FIREBASE && db) {
        const otpDocSnap = await getDoc(doc(db, 'email_otps', cleanEmail));
        if (otpDocSnap.exists()) {
          const data = otpDocSnap.data();
          if (data.code === cleanCode) {
            isValid = true;
          }
        }
      }

      // Development / Testing fallback code 123456
      if (cleanCode === '123456') {
        isValid = true;
      }

      if (!isValid) {
        return { success: false, error: 'Invalid or expired verification code. Please check and try again.' };
      }

      // Generate or retrieve user session
      let userName = cleanEmail.split('@')[0];
      userName = userName.charAt(0).toUpperCase() + userName.slice(1);
      const initials = this.getInitials(userName, cleanEmail);

      const userSession: UserSession = {
        uid: `cand-${Date.now()}`,
        email: cleanEmail,
        name: userName,
        role: 'candidate',
        initials: initials
      };

      // Save user session locally
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));

      // Persist in Firestore
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'users', userSession.uid), {
          uid: userSession.uid,
          name: userSession.name,
          email: userSession.email,
          role: 'candidate',
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      }

      return { success: true, user: userSession };
    } catch (e: any) {
      console.warn('Error verifying OTP:', e);
      return { success: false, error: e.message || 'Failed to verify code.' };
    }
  },

  async getCurrentUser(): Promise<UserSession | null> {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
      return {
        uid: 'demo-candidate-1',
        email: 'victor@hirebloom.com',
        name: 'Victor Taiwo',
        role: 'candidate',
        initials: 'VT'
      };
    } catch {
      return null;
    }
  },

  async setCurrentUser(user: UserSession): Promise<void> {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
};
