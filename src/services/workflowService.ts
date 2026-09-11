import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { HireBloomColors } from '@/constants/hirebloomTheme';

/**
 * Central Workflow State Machine & Public 4-Step Hiring Journey
 * 
 * Public Client Hiring Journey:
 * 1. Intro -> 2. Match -> 3. Interview -> 4. Onboard
 */

export type PublicHiringStage = 'Intro' | 'Match' | 'Interview' | 'Onboard' | 'Declined';

export type CandidateWorkflowState =
  | 'REGISTERED'
  | 'PROFILE_INCOMPLETE'
  | 'PROFILE_READY'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'MATCHED'
  | 'INTERVIEW_INVITED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFERED'
  | 'OFFER_ACCEPTED'
  | 'ONBOARDING'
  | 'ACTIVE';

export type EmployerPipelineStage =
  | 'APPLIED'
  | 'REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'DECLINED';

export interface PublicStageInfo {
  stage: PublicHiringStage;
  stepNumber: number; // 1 to 4 (0 if declined)
  title: string;
  badgeLabel: string;
  headline: string;
  description: string;
  nextStepPrompt: string;
  color: string;
  bg: string;
  border: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: 'application' | 'job' | 'interview' | 'offer' | 'vetting' | 'user';
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const AUDIT_LOGS_KEY = '@hirebloom_audit_logs';

export const WorkflowService = {
  /**
   * Translates any granular internal application/candidate status into the verified
   * 4-step public client process: Intro -> Match -> Interview -> Onboard
   */
  getPublicStageInfo(status?: string | null): PublicStageInfo {
    const norm = (status || '').toLowerCase().trim();

    // 1. DECLINED / NOT SELECTED
    if (norm.includes('declined') || norm.includes('not selected') || norm.includes('rejected')) {
      return {
        stage: 'Declined',
        stepNumber: 0,
        title: 'Candidate Selection Completed',
        badgeLabel: 'Closed',
        headline: 'Application Concluded',
        description: 'While we selected another candidate whose immediate domain experience aligned more closely with current team needs, your vetted profile remains active in the Bloom talent network for matching opportunities.',
        nextStepPrompt: 'Explore other matching roles across the network.',
        color: HireBloomColors.stages.declined.color,
        bg: HireBloomColors.stages.declined.bg,
        border: HireBloomColors.stages.declined.border,
      };
    }

    // 2. ONBOARD / OFFER ACCEPTED / HIRED / ACTIVE (Step 4)
    if (
      norm.includes('onboard') || 
      norm.includes('hired') || 
      norm.includes('active') || 
      norm.includes('offer accepted')
    ) {
      return {
        stage: 'Onboard',
        stepNumber: 4,
        title: 'Onboard & Placement Integration',
        badgeLabel: 'Step 4: Onboard',
        headline: 'Active Onboarding Underway',
        description: 'Hirebloom handles contracts, equipment check, and payroll compliance. Your hiring partner provides role-specific tools, communication channels, and team orientation.',
        nextStepPrompt: 'Complete your onboarding checklist and confirm welcome sync.',
        color: HireBloomColors.stages.onboard.color,
        bg: HireBloomColors.stages.onboard.bg,
        border: HireBloomColors.stages.onboard.border,
      };
    }

    // 3. OFFER EXTENDED (Sub-step in Onboarding transition)
    if (norm.includes('offer') || norm.includes('offered')) {
      return {
        stage: 'Onboard',
        stepNumber: 4,
        title: 'Offer Extended — Ready to Onboard',
        badgeLabel: 'Step 4: Onboard',
        headline: 'Formal Offer Received',
        description: 'Congratulations! You have been extended a formal placement offer. Review the hourly rate and start date details below to accept and begin your onboarding journey.',
        nextStepPrompt: 'Review contract terms and confirm acceptance.',
        color: HireBloomColors.stages.onboard.color,
        bg: HireBloomColors.stages.onboard.bg,
        border: HireBloomColors.stages.onboard.border,
      };
    }

    // 4. INTERVIEW (Step 3)
    if (norm.includes('interview')) {
      return {
        stage: 'Interview',
        stepNumber: 3,
        title: 'Client Partner Interview',
        badgeLabel: 'Step 3: Interview',
        headline: 'Interview Scheduled',
        description: 'You have been selected for a live panel interview with the client hiring manager. Prepare your camera, test your headset, and join via the Google Meet room.',
        nextStepPrompt: 'Check your scheduled time in EST and test your workstation.',
        color: HireBloomColors.stages.interview.color,
        bg: HireBloomColors.stages.interview.bg,
        border: HireBloomColors.stages.interview.border,
      };
    }

    // 5. MATCH (Step 2)
    if (norm.includes('match') || norm.includes('shortlist') || norm.includes('final review') || norm.includes('pending final review')) {
      return {
        stage: 'Match',
        stepNumber: 2,
        title: 'Candidate Match & Shortlist',
        badgeLabel: 'Step 2: Match',
        headline: 'Matched with Client Requisition',
        description: 'You passed our initial screening and have been matched directly with open client partner requisitions. The hiring team is reviewing your profile to schedule next steps.',
        nextStepPrompt: 'Hiring manager review in progress — response expected within 24-48 hours.',
        color: HireBloomColors.stages.match.color,
        bg: HireBloomColors.stages.match.bg,
        border: HireBloomColors.stages.match.border,
      };
    }

    // 6. INTRO / SCREENING / APPLIED (Step 1)
    return {
      stage: 'Intro',
      stepNumber: 1,
      title: 'Intro & Application Screening',
      badgeLabel: 'Step 1: Intro',
      headline: 'Application Received & Screening',
      description: 'Your application has been received. Our vetting desk verifies verbal English fluency, qualifications, workstation specs, and program background before matching.',
      nextStepPrompt: 'Our talent coordinators are reviewing your credentials.',
      color: HireBloomColors.stages.intro.color,
      bg: HireBloomColors.stages.intro.bg,
      border: HireBloomColors.stages.intro.border,
    };
  },

  /**
   * Records an immutable audit log entry for any critical state transition
   */
  async recordAuditLog(
    actorId: string,
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      action,
      entityType,
      entityId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'auditLogs', entry.id), entry);
      }
      const existingStr = await AsyncStorage.getItem(AUDIT_LOGS_KEY);
      const existing: AuditLogEntry[] = existingStr ? JSON.parse(existingStr) : [];
    } catch {
      // Handled silently
    }
  },

  /**
   * Retrieves recent audit logs
   */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(AUDIT_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
