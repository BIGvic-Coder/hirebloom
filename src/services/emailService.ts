import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE, sanitizeForFirestore } from '@/constants/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';

export type EmailTemplateType =
  | 'application_submitted'
  | 'reviewer_feedback'
  | 'stage_advanced'
  | 'interview_invite'
  | 'offer_letter'
  | 'founder_welcome'
  | 'talent_welcome'
  | 'returning_user_welcome'
  | 'not_selected';

export interface EmailMessage {
  id: string;
  toEmail: string;
  toName: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  template: EmailTemplateType;
  date: string;
  timestamp: number;
  read: boolean;
  metadata?: {
    jobTitle?: string;
    company?: string;
    stage?: string;
    feedback?: string;
    reviewerName?: string;
    senderTitle?: string;
    teamName?: string;
    isExistingUser?: boolean;
    interviewDate?: string;
    interviewTime?: string;
    meetUrl?: string;
    salary?: string;
    startDate?: string;
  };
}

const EMAILS_STORAGE_KEY = '@hirebloom_emails_cache';

// Seed initial realistic emails with professional Talent & HR team sign-offs
const INITIAL_SEED_EMAILS: EmailMessage[] = [
  {
    id: 'email-1',
    toEmail: 'victor@hirebloom.com',
    toName: 'Victor',
    fromName: 'HireBloom Talent Operations',
    fromEmail: 'review@hirebloom.com',
    subject: 'Application Submitted — Senior Customer Support Lead',
    preview: 'Hi Victor, thanks for applying! Your application is currently in our review queue, and our talent team is evaluating your experience.',
    template: 'application_submitted',
    date: '17 Jan',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    read: true,
    metadata: {
      jobTitle: 'Senior Customer Support Lead',
      company: 'InnovateX',
      stage: 'Review Queue',
      reviewerName: 'HireBloom Vetting Team',
      senderTitle: 'Talent Acquisition & Assessment',
      teamName: 'HireBloom Global Operations',
    },
    body: `Hi Victor,

Thanks for applying! Your application is in our review queue, and our talent team is carefully reviewing your background and experience.

You'll hear from our vetting specialists within 1–2 weeks. No further action is needed on your end right now — just keep an eye on your inbox for direct status updates.`,
  },
  {
    id: 'email-2',
    toEmail: 'victor@hirebloom.com',
    toName: 'Victor',
    fromName: 'HireBloom Talent Team',
    fromEmail: 'talent@hirebloom.com',
    subject: 'Welcome back to HireBloom — Pipeline Updates & Active Openings',
    preview: 'Welcome back! Your candidate profile is active in our talent pool. Explore fresh openings and track your application milestones.',
    template: 'returning_user_welcome',
    date: '08 Jan',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    read: true,
    metadata: {
      reviewerName: 'HireBloom Candidate Relations Team',
      senderTitle: 'Talent Success & Retention',
      teamName: 'Candidate Operations @ HireBloom',
      isExistingUser: true,
    },
    body: `Hi Victor,

Welcome back to HireBloom!

Your candidate profile remains active in our verified talent network. Client partners and hiring teams are actively reviewing profiles for newly added remote positions this week.

Here are quick updates for your account:
• Application Status: You can review live stage updates, reviewer notes, and scheduled interviews directly in your Applications tab.
• New Opportunities: Fresh remote roles in Tech, Operations, and Customer Success have been posted to the job board.
• Profile & Loom: Make sure your latest resume and Loom intro are up to date to stay at the top of recruiter shortlists.

If you have any questions about your active applications, our candidate operations team is here to support you every step of the way.

Warm regards,
HireBloom Candidate Relations Team
Global Hiring Operations & Talent Success`,
  },
];

export const EmailService = {
  /**
   * Helper to determine if an email belongs to an existing user
   */
  async checkIsExistingUser(email: string): Promise<{ isExisting: boolean; name?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return { isExisting: false };

    // 1. Check local registered user cache
    try {
      const stored = await AsyncStorage.getItem('@hirebloom_registered_users');
      if (stored) {
        const users = JSON.parse(stored);
        if (Array.isArray(users)) {
          const found = users.find((u: any) => u.email?.toLowerCase() === cleanEmail);
          if (found) {
            return { isExisting: true, name: found.name };
          }
        }
      }
    } catch {}

    // 2. Check candidate applications cache
    try {
      const storedApps = await AsyncStorage.getItem('@hirebloom_candidate_applications_cache');
      if (storedApps) {
        const apps = JSON.parse(storedApps);
        if (Array.isArray(apps)) {
          const foundApp = apps.find(
            (a: any) =>
              (a.candidateEmail && a.candidateEmail.toLowerCase() === cleanEmail) ||
              (a.candidateId && a.candidateId.toLowerCase().includes(cleanEmail.split('@')[0]))
          );
          if (foundApp) {
            return { isExisting: true, name: foundApp.candidateName };
          }
        }
      }
    } catch {}

    // 3. Known existing seed/leadership emails
    if (
      cleanEmail === 'victor@hirebloom.com' ||
      cleanEmail === 'getinbig6@gmail.com' ||
      cleanEmail === 'ceo@hirebloom.com' ||
      cleanEmail === 'alex.morgan.talent@gmail.com' ||
      cleanEmail === 'sarah.jenkins@hirebloom.com'
    ) {
      return { isExisting: true };
    }

    return { isExisting: false };
  },

  /**
   * Factory for creating a professional New User Welcome Email (Talent & HR Team)
   */
  createNewUserWelcomeEmail(cleanEmail: string, candidateName?: string): EmailMessage {
    const userFirstName = candidateName || cleanEmail.split('@')[0];
    const formattedName = userFirstName.charAt(0).toUpperCase() + userFirstName.slice(1);

    return {
      id: `welcome-${cleanEmail}`,
      toEmail: cleanEmail,
      toName: formattedName,
      fromName: 'HireBloom Onboarding Team',
      fromEmail: 'welcome@hirebloom.com',
      subject: 'Welcome to HireBloom — Your Remote Career Journey Begins 🚀',
      preview: `Hi ${formattedName}! Welcome to HireBloom. Browse verified remote opportunities, apply in one click, and track your interviews right here.`,
      template: 'talent_welcome',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        reviewerName: 'HireBloom Talent Acquisition Team',
        senderTitle: 'Candidate Onboarding & Placement',
        teamName: 'People & Culture Division @ HireBloom',
        isExistingUser: false,
      },
      body: `Hi ${formattedName},

Welcome to HireBloom! We are thrilled to welcome you to our curated talent community.

Our mission is to connect ambitious professionals with vetted international companies offering high-paying, remote-first positions.

Here is how to get started on your portal:
• Complete Your Profile: Add your latest resume and an optional 60-second video introduction to stand out to hiring managers.
• Explore Verified Roles: Browse active positions across Tech, Operations, and Client Success in your Jobs tab.
• 1-Click Application: Submit your candidacy instantly. Our recruitment desk will carefully review your qualifications.
• Direct Updates: You'll receive real-time notifications for reviewer feedback, interview invitations, and formal offer letters directly in this inbox.

We are excited to support your career journey. Good luck with your applications!

Best regards,
HireBloom Talent Acquisition Team
Candidate Onboarding & Talent Operations`,
    };
  },

  /**
   * Factory for creating a professional Returning User Welcome Email (Candidate Relations & HR Team)
   */
  createReturningUserWelcomeEmail(cleanEmail: string, candidateName?: string): EmailMessage {
    const userFirstName = candidateName || cleanEmail.split('@')[0];
    const formattedName = userFirstName.charAt(0).toUpperCase() + userFirstName.slice(1);

    return {
      id: `welcome-back-${cleanEmail}`,
      toEmail: cleanEmail,
      toName: formattedName,
      fromName: 'HireBloom Talent Team',
      fromEmail: 'talent@hirebloom.com',
      subject: 'Welcome back to HireBloom — Pipeline Updates & Active Openings',
      preview: `Welcome back ${formattedName}! Your candidate profile is active in our talent pool. Explore fresh openings and track your application milestones.`,
      template: 'returning_user_welcome',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        reviewerName: 'HireBloom Candidate Relations Team',
        senderTitle: 'Talent Success & Retention Team',
        teamName: 'Global Hiring Operations @ HireBloom',
        isExistingUser: true,
      },
      body: `Hi ${formattedName},

Welcome back to HireBloom!

Your talent profile remains active in our verified candidate network. Client hiring teams and partner companies are currently reviewing profiles for newly added remote positions this week.

Here are your account updates:
• Application Tracking: Monitor live stages, interviewer feedback, and decision milestones directly in your Applications tab.
• New Opportunities: Check out recently posted remote roles tailored to your background and compensation preferences.
• Keep Profiles Fresh: Updating your latest resume or availability ensures you remain top-of-mind for executive recruiters.

Our candidate relations team is always here if you have any questions or need guidance on upcoming interviews.

Warm regards,
HireBloom Candidate Relations Team
Global Hiring Operations & Talent Success`,
    };
  },

  /**
   * Get all emails for a specific recipient (or all emails if none specified)
   */
  async getEmails(recipientEmail?: string): Promise<EmailMessage[]> {
    try {
      const cleanEmail = (recipientEmail || '').trim().toLowerCase();

      // 1. Read authoritative local storage first
      let list: EmailMessage[] = [];
      try {
        const stored = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
        if (stored) {
          list = JSON.parse(stored);
        }
      } catch (storageErr) {
        console.warn('AsyncStorage read warning in getEmails:', storageErr);
      }

      if (!list || list.length === 0) {
        list = [...INITIAL_SEED_EMAILS];
        await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(list));
      }

      // 2. Safely attempt Firestore sync if available (non-blocking, won't throw on permissions)
      if (!IS_MOCK_FIREBASE && db && cleanEmail) {
        try {
          const q = query(collection(db, 'emails'), where('toEmail', '==', cleanEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const cloudDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailMessage));
            for (const item of cloudDocs) {
              if (!list.find((m) => m.id === item.id)) {
                list.push(item);
              }
            }
          }
        } catch {
          // Handled silently - local storage is authoritative
        }
      }

      // 3. Automatically upgrade any legacy emails (e.g. older seeds that had Eric or hardcoded CEO)
      let listModified = false;
      const userStatus = cleanEmail ? await this.checkIsExistingUser(cleanEmail) : { isExisting: false };

      list = list.map((msg) => {
        const isLegacy =
          msg.template === 'founder_welcome' ||
          msg.fromEmail === 'eric@hirebloom.com' ||
          (msg.body && (msg.body.includes('Eric Engebretsen') || msg.body.includes("I'm Eric")));

        if (isLegacy) {
          listModified = true;
          if (userStatus.isExisting) {
            const upgraded = this.createReturningUserWelcomeEmail(msg.toEmail || cleanEmail, msg.toName);
            return { ...upgraded, id: msg.id, read: msg.read, timestamp: msg.timestamp };
          } else {
            const upgraded = this.createNewUserWelcomeEmail(msg.toEmail || cleanEmail, msg.toName);
            return { ...upgraded, id: msg.id, read: msg.read, timestamp: msg.timestamp };
          }
        }
        return msg;
      });

      if (listModified) {
        await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(list));
      }

      // Sort by newest first
      list.sort((a, b) => b.timestamp - a.timestamp);

      // Filter by recipient email if provided
      if (cleanEmail) {
        let matches = list.filter((e) => e.toEmail.toLowerCase() === cleanEmail);

        if (matches.length === 0) {
          // No emails yet for this user: Generate personalized welcome based on user status
          const welcomeEmail = userStatus.isExisting
            ? this.createReturningUserWelcomeEmail(cleanEmail, userStatus.name)
            : this.createNewUserWelcomeEmail(cleanEmail, userStatus.name);

          list.unshift(welcomeEmail);
          await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(list));
          return [welcomeEmail];
        }

        // Ensure at least one official onboarding or returning welcome email exists
        const hasWelcome = matches.some(
          (e) =>
            e.template === 'talent_welcome' ||
            e.template === 'returning_user_welcome' ||
            e.template === 'founder_welcome'
        );

        if (!hasWelcome) {
          const welcomeEmail = userStatus.isExisting
            ? this.createReturningUserWelcomeEmail(cleanEmail, userStatus.name)
            : this.createNewUserWelcomeEmail(cleanEmail, userStatus.name);

          matches.push(welcomeEmail);
          list.unshift(welcomeEmail);
          await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(list));
        }

        matches.sort((a, b) => b.timestamp - a.timestamp);
        return matches;
      }

      return list;
    } catch {
      return [];
    }
  },

  /**
   * Mark an email as read
   */
  async markAsRead(emailId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
      const list: EmailMessage[] = stored ? JSON.parse(stored) : INITIAL_SEED_EMAILS;
      const updated = list.map((e) => (e.id === emailId ? { ...e, read: true } : e));
      await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));

      if (!IS_MOCK_FIREBASE && db) {
        try {
          await updateDoc(doc(db, 'emails', emailId), { read: true });
        } catch {
          // Safe catch
        }
      }
    } catch (e) {
      console.warn('Error marking email as read:', e);
    }
  },

  /**
   * Count unread emails for a recipient
   */
  async getUnreadCount(recipientEmail?: string): Promise<number> {
    const list = await this.getEmails(recipientEmail);
    return list.filter((e) => !e.read).length;
  },

  /**
   * Internal dispatcher: save email to storage & cloud
   */
  async dispatchEmail(newEmail: EmailMessage): Promise<void> {
    try {
      // 1. Authoritative local storage first (instant & reliable)
      const stored = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
      const list: EmailMessage[] = stored ? JSON.parse(stored) : INITIAL_SEED_EMAILS;
      const deduplicated = list.filter((e) => e.id !== newEmail.id);
      const updated = [newEmail, ...deduplicated];
      await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));

      // 2. Safely sync to Firestore in background
      if (!IS_MOCK_FIREBASE && db) {
        try {
          await setDoc(doc(db, 'emails', newEmail.id), sanitizeForFirestore(newEmail));
        } catch {
          // Handled silently
        }
      }
    } catch (e) {
      console.warn('Error dispatching email:', e);
    }
  },

  /**
   * 1. Send "Application Submitted" Email (matching Screenshot 1)
   */
  async sendApplicationSubmittedEmail(
    candidate: { name: string; email: string },
    job: { title: string; company: string }
  ): Promise<EmailMessage> {
    const firstName = candidate.name.split(' ')[0] || 'Victor';
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      toEmail: candidate.email.toLowerCase().trim(),
      toName: firstName,
      fromName: 'Bloom',
      fromEmail: 'review@hirebloom.com',
      subject: 'Application Submitted',
      preview: `Hi ${firstName}, Thanks for applying! Your application is in our review queue, and we're carefully reviewing your experience.`,
      template: 'application_submitted',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        jobTitle: job.title,
        company: job.company,
        stage: 'Review Queue',
      },
      body: `Hi ${firstName},

Thanks for applying! Your application is in our review queue, and we're carefully reviewing your experience.

You'll hear from us within 1–2 weeks. No action needed on your end — just keep an eye on your inbox (and spam folder, just in case).`,
    };

    await this.dispatchEmail(email);
    return email;
  },

  /**
   * 2. Send "Stage Advanced & Reviewer Feedback" Email
   */
  async sendFeedbackAndAdvanceEmail(
    candidate: { name: string; email: string },
    job: { title: string; company: string },
    stage: string,
    feedback: string,
    reviewerName: string = 'Sarah Jenkins (Hire Bloom Vetting Desk)'
  ): Promise<EmailMessage> {
    const firstName = candidate.name.split(' ')[0] || 'Victor';
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      toEmail: candidate.email.toLowerCase().trim(),
      toName: firstName,
      fromName: 'Bloom Talent Team',
      fromEmail: 'review@hirebloom.com',
      subject: `Application Update: Advanced to ${stage} for ${job.title}`,
      preview: `Great news ${firstName}! Your application for ${job.title} at ${job.company} has been reviewed and moved to ${stage}.`,
      template: 'reviewer_feedback',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        jobTitle: job.title,
        company: job.company,
        stage: stage,
        feedback: feedback,
        reviewerName: reviewerName,
      },
      body: `Hi ${firstName},

Great news! Our vetting team has reviewed your resume and background qualifications for ${job.title} at ${job.company}.

Reviewer Feedback:
"${feedback}"

Your application has officially moved to: ${stage}.

You can monitor your live progress on the Hire Bloom Talent Portal timeline. Our team will reach out with the next milestone.

Best regards,
${reviewerName}
Hire Bloom Vetting Desk`,
    };

    await this.dispatchEmail(email);
    return email;
  },

  /**
   * 3. Send Interview Invitation Email
   */
  async sendInterviewInviteEmail(
    candidate: { name: string; email: string },
    job: { title: string; company: string },
    details: { date: string; time: string; meetUrl?: string; type?: string }
  ): Promise<EmailMessage> {
    const firstName = candidate.name.split(' ')[0] || 'Victor';
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      toEmail: candidate.email.toLowerCase().trim(),
      toName: firstName,
      fromName: 'Bloom Scheduling',
      fromEmail: 'interviews@hirebloom.com',
      subject: `Interview Invitation: ${job.title} at ${job.company}`,
      preview: `You're invited to interview for ${job.title}! Date: ${details.date} at ${details.time}.`,
      template: 'interview_invite',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        jobTitle: job.title,
        company: job.company,
        stage: 'Interview Scheduled',
        interviewDate: details.date,
        interviewTime: details.time,
        meetUrl: details.meetUrl || 'https://meet.google.com/hbm-intr-vct',
      },
      body: `Hi ${firstName},

Congratulations! The hiring team at ${job.company} was very impressed with your profile and would like to invite you to a ${details.type || 'Panel Video Interview'}.

Interview Details:
• Position: ${job.title}
• Date: ${details.date}
• Time: ${details.time}
• Video Room: ${details.meetUrl || 'https://meet.google.com/hbm-intr-vct'}

Please make sure your camera and headset are tested beforehand. You can also join directly from the Interviews tab in your Hire Bloom app.

Best of luck!
The Bloom Talent Team`,
    };

    await this.dispatchEmail(email);
    return email;
  },

  /**
   * 4. Send Job Offer Email
   */
  async sendOfferEmail(
    candidate: { name: string; email: string },
    job: { title: string; company: string },
    offer: { salary: string; startDate?: string }
  ): Promise<EmailMessage> {
    const firstName = candidate.name.split(' ')[0] || 'Victor';
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      toEmail: candidate.email.toLowerCase().trim(),
      toName: firstName,
      fromName: 'HireBloom Placement Operations',
      fromEmail: 'offers@hirebloom.com',
      subject: `Formal Offer Extended: ${job.title} at ${job.company}! 🎉`,
      preview: `Congratulations ${firstName}! You have received an employment offer for ${job.title} at ${offer.salary}.`,
      template: 'offer_letter',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        jobTitle: job.title,
        company: job.company,
        stage: 'Offer Received',
        salary: offer.salary,
        startDate: offer.startDate || 'Within 2 weeks',
        reviewerName: 'HireBloom People Operations Team',
        senderTitle: 'Global Placements & Talent Success',
        teamName: 'People & Culture Division @ HireBloom',
      },
      body: `Hi ${firstName},

We are thrilled to extend a formal placement offer for the role of ${job.title} at ${job.company}!

Offer Details:
• Compensation: ${offer.salary}
• Target Start Date: ${offer.startDate || 'Within 2 weeks'}
• Setup: Remote (US Hours)

Please visit your Hire Bloom Talent Portal to review the full contract terms and accept your offer to begin onboarding.

Congratulations on this remarkable achievement!

Warm regards,
HireBloom People Operations & Hiring Leadership Team
Global Placements Division`,
    };

    await this.dispatchEmail(email);
    return email;
  },

  /**
   * 5. Send Thoughtful Decision / Rejection Feedback Email
   */
  async sendRejectionFeedbackEmail(
    candidate: { name: string; email: string },
    job: { title: string; company: string },
    feedback: string,
    reviewerName: string = 'Hire Bloom Vetting Team'
  ): Promise<EmailMessage> {
    const firstName = candidate.name.split(' ')[0] || 'Victor';
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      toEmail: candidate.email.toLowerCase().trim(),
      toName: firstName,
      fromName: 'Bloom Talent Team',
      fromEmail: 'review@hirebloom.com',
      subject: `Update regarding your application for ${job.title}`,
      preview: `Thank you for your application, ${firstName}. Here is an update on your candidacy for ${job.title}.`,
      template: 'not_selected',
      date: 'Today',
      timestamp: Date.now(),
      read: false,
      metadata: {
        jobTitle: job.title,
        company: job.company,
        stage: 'Not Selected',
        feedback: feedback,
        reviewerName: reviewerName,
      },
      body: `Hi ${firstName},

Thank you for taking the time to apply for ${job.title} at ${job.company}.

Our hiring review team carefully evaluated your background against the immediate requirements for this opening. While we have chosen to move forward with other candidates whose specific domain experience aligned more closely with current requisition needs, we were genuinely impressed with your profile.

Reviewer Feedback:
"${feedback}"

Your profile remains active in our verified talent network. As new requisitions open that match your skills, we will notify you immediately.

Thank you again for your interest in Bloom.

Warm regards,
${reviewerName}
Hire Bloom Talent Network`,
    };

    await this.dispatchEmail(email);
    return email;
  },
};
