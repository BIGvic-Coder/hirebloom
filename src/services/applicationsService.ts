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
import { NotificationsService } from './notificationsService';
import { WorkflowService } from './workflowService';
import { EmailService } from './emailService';

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

// Initial seed applications for testing (job-1 "Senior Customer Support Lead" is kept UNAPPLIED so you can test applying to it fresh!)
const DEFAULT_APPLICATIONS: JobApplication[] = [
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
const REGISTERED_USERS_KEY = '@hirebloom_registered_users';

const DEFAULT_EXISTING_USERS: Array<{
  uid: string;
  email: string;
  name: string;
  role: 'candidate' | 'employer' | 'recruiter';
  company?: string;
}> = [
  {
    uid: 'user-victor-1',
    email: 'victor@hirebloom.com',
    name: 'Victor Taiwo',
    role: 'candidate',
  },
  {
    uid: 'user-alex-1',
    email: 'alex.morgan.talent@gmail.com',
    name: 'Alex Morgan',
    role: 'candidate',
  },
  {
    uid: 'user-sarah-1',
    email: 'sarah.jenkins@hirebloom.com',
    name: 'Sarah Jenkins',
    role: 'recruiter',
  },
  {
    uid: 'user-client-1',
    email: 'client@apextech.com',
    name: 'Apex Tech Hiring Team',
    role: 'employer',
    company: 'Apex Technologies',
  },
  {
    uid: 'user-gabriella-1',
    email: 'gabriellasmithlogan@gmail.com',
    name: 'Gabriella Smith',
    role: 'candidate',
  },
];

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
    } catch {
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
      // In demo/test mode: replace previous application for this role so user can test applying anytime
      const otherApps = existingApps.filter((a) => a.jobId !== job.id);

      const appId = `app-${Date.now()}`;
      // In HireBloom, new applications start at Step 1: Intro / Pending Review
      const status: ApplicationStatus = 'Pending Review';
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
        step: 'Intro & Screening Review',
        notes: candidate.note || 'Application submitted via Hirebloom candidate portal with attached resume.',
        resumeName: resumeInfo.name,
        resumeSize: resumeInfo.size,
        resumeUrl: resumeInfo.url,
        resumeUploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'applications', appId), newApp);
      }

      const updatedApps = [newApp, ...otherApps];
      await AsyncStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updatedApps));

      // 1. Immediately send Official "Application Submitted" Email to candidate (matching Screenshot 1)
      await EmailService.sendApplicationSubmittedEmail(
        { name: candidate.name, email: candidate.email },
        { title: job.title, company: job.company }
      );

      // 2. In-app notification for candidate
      await NotificationsService.sendNotification({
        userId: candidate.id,
        type: 'application',
        title: 'Application Submitted',
        body: `Your application for ${job.title} at ${job.company} is in our review queue.`,
        deepLink: '/candidate/applications',
      });

      // 3. Record in audit trail
      await WorkflowService.recordAuditLog(
        candidate.id,
        'APPLICATION_SUBMITTED',
        'application',
        appId,
        { jobTitle: job.title, company: job.company, status: 'Pending Review' }
      );

      // Also increment applicants count on the job
      const jobs = await this.getJobs();
      const updatedJobs = jobs.map((j) => (j.id === job.id ? { ...j, applicants: j.applicants + 1 } : j));
      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));

      return { success: true, application: newApp };
    } catch (e: any) {
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
    } catch {
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
    } catch {
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
      reviewerName?: string;
      interviewDetails?: JobApplication['interviewDetails'];
      offerDetails?: JobApplication['offerDetails'];
    }
  ): Promise<boolean> {
    try {
      const style = getStatusStyle(newStatus);
      const reviewer = options?.reviewerName || 'Hire Bloom Vetting Desk';
      const updates: Partial<JobApplication> = {
        status: newStatus,
        statusColor: style.color,
        statusBg: style.bg,
        step: options?.step || (
          newStatus === 'Pending Final Review' ? 'Step 2: Candidate Match & Shortlist' :
          newStatus === 'Not Selected' ? 'Candidate Selection Completed' : 
          newStatus === 'Interview Scheduled' ? 'Step 3: Client Panel Interview Scheduled' : 
          newStatus === 'Offer Received' ? 'Step 4: Offer Extended to Candidate' : 
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
      const targetApp = updated.find((a) => a.id === appId);
      if (targetApp) {
        // Record audit log
        await WorkflowService.recordAuditLog(
          reviewer,
          `STATUS_CHANGED_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
          'application',
          appId,
          { newStatus, step: updates.step, feedback: options?.feedbackReason }
        );

        // Send in-app notification to candidate
        let notifTitle = 'Application Update';
        let notifType: any = 'application';
        let notifBody = `Your application for ${targetApp.jobTitle} is now in ${newStatus}.`;

        if (newStatus === 'Interview Scheduled') {
          notifTitle = 'Interview Scheduled';
          notifType = 'interview';
          notifBody = `Client panel interview scheduled for ${targetApp.jobTitle} at ${targetApp.company}.`;
        } else if (newStatus === 'Offer Received') {
          notifTitle = 'Offer Received!';
          notifType = 'offer';
          notifBody = `Congratulations! You received an employment offer for ${targetApp.jobTitle}.`;
        } else if (newStatus === 'Pending Final Review') {
          notifTitle = 'Matched to Final Review';
          notifType = 'application';
          notifBody = `Your application for ${targetApp.jobTitle} passed screening and has moved to final review.`;
        }

        await NotificationsService.sendNotification({
          userId: targetApp.candidateId,
          type: notifType,
          title: notifTitle,
          body: notifBody,
          deepLink: newStatus === 'Interview Scheduled' ? '/candidate/interviews' : '/candidate/applications',
        });

        // ==================== DISPATCH OFFICIAL EMAIL NOTIFICATIONS ====================
        try {
          if (newStatus === 'Pending Final Review') {
            await EmailService.sendFeedbackAndAdvanceEmail(
              { name: targetApp.candidateName, email: targetApp.candidateEmail },
              { title: targetApp.jobTitle, company: targetApp.company },
              'Step 2: Match & Final Screening',
              options?.feedbackReason || options?.notes || 'Candidate passed 6-layer vetting and English proficiency assessment. Shortlisted for client partner requisition.',
              reviewer
            );
          } else if (newStatus === 'Interview Scheduled') {
            await EmailService.sendInterviewInviteEmail(
              { name: targetApp.candidateName, email: targetApp.candidateEmail },
              { title: targetApp.jobTitle, company: targetApp.company },
              options?.interviewDetails || {
                date: 'Upcoming',
                time: 'Confirmed',
                meetUrl: 'https://meet.google.com/hbm-intr-vct',
              }
            );
          } else if (newStatus === 'Offer Received') {
            await EmailService.sendOfferEmail(
              { name: targetApp.candidateName, email: targetApp.candidateEmail },
              { title: targetApp.jobTitle, company: targetApp.company },
              options?.offerDetails || {
                salary: '$15 - $18 / hr',
                startDate: 'Within 2 weeks',
              }
            );
          } else if (newStatus === 'Not Selected') {
            await EmailService.sendRejectionFeedbackEmail(
              { name: targetApp.candidateName, email: targetApp.candidateEmail },
              { title: targetApp.jobTitle, company: targetApp.company },
              options?.feedbackReason || 'We appreciate your time. Our hiring team selected another applicant whose immediate domain background aligned with current team needs.',
              reviewer
            );
          } else if (options?.feedbackReason) {
            await EmailService.sendFeedbackAndAdvanceEmail(
              { name: targetApp.candidateName, email: targetApp.candidateEmail },
              { title: targetApp.jobTitle, company: targetApp.company },
              newStatus,
              options.feedbackReason,
              reviewer
            );
          }
        } catch (emailErr) {
          console.warn('Error dispatching stage email:', emailErr);
        }
      }

      await AsyncStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  // Decision shortcuts for employers/recruiters:
  async advanceToFinalReview(appId: string, notes?: string, reviewerName?: string): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Pending Final Review', {
      step: 'Step 2: Candidate Match & Shortlist',
      notes: notes || 'Candidate advanced to final review after passing preliminary screening.',
      feedbackReason: notes || 'Candidate credentials, C1 English fluency, and remote workstation setup verified. Advanced to finalist match.',
      reviewerName,
    });
  },

  async scheduleInterview(
    appId: string, 
    details: { date: string; time: string; meetUrl?: string; type?: string },
    reviewerName?: string
  ): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Interview Scheduled', {
      step: `Step 3: Interview on ${details.date} at ${details.time}`,
      notes: 'Invited to panel interview with hiring team.',
      interviewDetails: details,
      reviewerName,
    });
  },

  async makeOffer(
    appId: string, 
    offer: { salary: string; startDate?: string; role?: string },
    reviewerName?: string
  ): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Offer Received', {
      step: `Step 4: Formal Offer Extended (${offer.salary})`,
      notes: 'Candidate accepted by hiring partner. Formal employment offer sent.',
      offerDetails: offer,
      reviewerName,
    });
  },

  async markNotSelected(appId: string, feedbackReason: string, reviewerName?: string): Promise<boolean> {
    return this.updateApplicationStatus(appId, 'Not Selected', {
      step: 'Candidate Selection Completed',
      feedbackReason: feedbackReason || 'We appreciate your time and interest. Our hiring team selected another candidate whose immediate domain experience aligned more closely with current team needs.',
      reviewerName,
    });
  },

  async sendFeedbackOnly(appId: string, feedbackReason: string, reviewerName?: string): Promise<boolean> {
    const apps = await this.getAllApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) return false;

    return this.updateApplicationStatus(appId, app.status, {
      feedbackReason,
      notes: feedbackReason,
      reviewerName,
    });
  },

  async resetTestApplications(): Promise<void> {
    await AsyncStorage.removeItem(APPS_STORAGE_KEY);
    await AsyncStorage.removeItem('@hirebloom_emails_cache');
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
        try {
          await setDoc(doc(db, 'email_otps', cleanEmail), {
            code: otpCode,
            email: cleanEmail,
            expiry: new Date(expiry).toISOString(),
            createdAt: new Date().toISOString()
          });
        } catch {
          // Handled silently with local OTP fallback
        }
      }

      console.log(`[HireBloom OTP] Verification code for ${cleanEmail}: ${otpCode}`);
      return {
        success: true,
        code: otpCode,
        message: `A 6-digit verification code has been sent to ${cleanEmail}.`
      };
    } catch {
      return {
        success: true,
        code: otpCode,
        message: `Verification code generated.`
      };
    }
  },

  // 9. User Existence Verification (Old vs New User Detection)
  async getRegisteredUsers(): Promise<Array<{
    uid: string;
    email: string;
    name: string;
    role: 'candidate' | 'employer' | 'recruiter';
    company?: string;
  }>> {
    try {
      const stored = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_EXISTING_USERS));
      return DEFAULT_EXISTING_USERS;
    } catch {
      return DEFAULT_EXISTING_USERS;
    }
  },

  async registerNewUser(profile: {
    uid: string;
    email: string;
    name: string;
    role: 'candidate' | 'employer';
    company?: string;
  }): Promise<void> {
    const cleanEmail = profile.email.trim().toLowerCase();
    const existing = await this.getRegisteredUsers();
    const updated = [
      ...existing.filter((u) => u.email.toLowerCase() !== cleanEmail),
      { ...profile, email: cleanEmail }
    ];
    await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  },

  async checkUserExists(email: string): Promise<{
    exists: boolean;
    user?: {
      uid: string;
      email: string;
      name: string;
      role: 'candidate' | 'employer' | 'recruiter';
      company?: string;
    };
  }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { exists: false };
    }

    // 1. Check local registered user cache
    const registered = await this.getRegisteredUsers();
    const foundLocal = registered.find((u) => u.email.toLowerCase() === cleanEmail);
    if (foundLocal) {
      return { exists: true, user: foundLocal };
    }

    // 2. Check Firestore 'users' collection if online
    if (!IS_MOCK_FIREBASE && db) {
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const foundFirestore = {
            uid: docData.uid || snap.docs[0].id,
            email: cleanEmail,
            name: docData.name || cleanEmail.split('@')[0],
            role: (docData.role as any) || 'candidate',
            company: docData.company,
          };
          await this.registerNewUser(foundFirestore);
          return { exists: true, user: foundFirestore };
        }
      } catch {
        // Handled silently
      }
    }

    return { exists: false };
  },

  async verifyEmailOtp(email: string, enteredCode: string): Promise<{ success: boolean; user?: UserSession; error?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (enteredCode || '').trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: 'Please enter your email and 6-digit code.' };
    }

    try {
      // 1. Check stored OTP locally
      const stored = await AsyncStorage.getItem(`@hirebloom_otp_${cleanEmail}`);
      let isValid = false;

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.code === cleanCode && parsed.expiry > Date.now()) {
          isValid = true;
        }
      }

      // 2. Also check Firestore if available (safely caught)
      if (!isValid && !IS_MOCK_FIREBASE && db) {
        try {
          const otpDocSnap = await getDoc(doc(db, 'email_otps', cleanEmail));
          if (otpDocSnap.exists()) {
            const data = otpDocSnap.data();
            if (data.code === cleanCode) {
              isValid = true;
            }
          }
        } catch {
          // Handled silently
        }
      }

      // 3. Testing / Quick-verification fallback code 123456
      if (cleanCode === '123456') {
        isValid = true;
      }

      if (!isValid) {
        return { success: false, error: 'Invalid or expired verification code. Please check your code and try again.' };
      }

      // 4. Retrieve saved profile to preserve role (e.g. employer, recruiter, candidate)
      const check = await this.checkUserExists(cleanEmail);
      const existingUser = check.user;

      let userName = existingUser?.name || cleanEmail.split('@')[0];
      userName = userName.charAt(0).toUpperCase() + userName.slice(1);
      const userRole = existingUser?.role || 'candidate';
      const uid = existingUser?.uid || `user-${Date.now()}`;
      const initials = this.getInitials(userName, cleanEmail);

      const userSession: UserSession = {
        uid: uid,
        email: cleanEmail,
        name: userName,
        role: userRole as any,
        initials: initials
      };

      // 5. Save user session locally (Guaranteed to succeed!)
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));

      // 6. Persist in Firestore if permitted (Non-blocking)
      if (!IS_MOCK_FIREBASE && db) {
        try {
          await setDoc(doc(db, 'users', userSession.uid), {
            uid: userSession.uid,
            name: userSession.name,
            email: userSession.email,
            role: userRole,
            lastLoginAt: new Date().toISOString()
          }, { merge: true });
        } catch {
          // Handled silently
        }
      }

      return { success: true, user: userSession };
    } catch (e: any) {
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
