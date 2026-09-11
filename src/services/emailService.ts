import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';

export type EmailTemplateType =
  | 'application_submitted'
  | 'reviewer_feedback'
  | 'stage_advanced'
  | 'interview_invite'
  | 'offer_letter'
  | 'founder_welcome'
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
    interviewDate?: string;
    interviewTime?: string;
    meetUrl?: string;
    salary?: string;
    startDate?: string;
  };
}

const EMAILS_STORAGE_KEY = '@hirebloom_emails_cache';

// Seed initial realistic emails matching Screenshot 1 and Screenshot 2
const INITIAL_SEED_EMAILS: EmailMessage[] = [
  {
    id: 'email-1',
    toEmail: 'victor@hirebloom.com',
    toName: 'Victor',
    fromName: 'Bloom',
    fromEmail: 'review@hirebloom.com',
    subject: 'Application Submitted',
    preview: 'Hi Victor, Thanks for applying! Your application is in our review queue, and we are carefully reviewing your experience.',
    template: 'application_submitted',
    date: '17 Jan',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    read: true,
    metadata: {
      jobTitle: 'Senior Customer Support Lead',
      company: 'InnovateX',
      stage: 'Review Queue',
    },
    body: `Hi Victor,

Thanks for applying! Your application is in our review queue, and we're carefully reviewing your experience.

You'll hear from us within 1–2 weeks. No action needed on your end — just keep an eye on your inbox (and spam folder, just in case).`,
  },
  {
    id: 'email-2',
    toEmail: 'victor@hirebloom.com',
    toName: 'Victor',
    fromName: 'Bloom',
    fromEmail: 'eric@hirebloom.com',
    subject: 'Thanks for contacting Bloom — now apply to our job network here 🙌',
    preview: "Hi there! I'm Eric, Co-Founder at Bloom — thanks for reaching out! Our mission at Bloom is to help 10,000 people...",
    template: 'founder_welcome',
    date: '08 Jan',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    read: true,
    metadata: {
      reviewerName: 'Eric Engebretsen',
    },
    body: `Hi there!

I'm Eric, Co-Founder at Bloom — thanks for reaching out! Our mission at Bloom is to help 10,000 people around the world get better paying, remote jobs.

We'd love to get to know more about you and your work experience so we can match you with hiring companies. Please fill out this form to officially apply to join the Bloom Job Network.

Thanks again, good things to come!
Eric

--
Eric Engebretsen
Co-Founder @ Bloom`,
  },
];

export const EmailService = {
  /**
   * Get all emails for a specific recipient (or all emails if none specified)
   */
  async getEmails(recipientEmail?: string): Promise<EmailMessage[]> {
    try {
      const cleanEmail = (recipientEmail || '').trim().toLowerCase();

      if (!IS_MOCK_FIREBASE && db && cleanEmail) {
        const q = query(collection(db, 'emails'), where('toEmail', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailMessage));
          list.sort((a, b) => b.timestamp - a.timestamp);
          return list;
        }
      }

      const stored = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
      if (stored) {
        const list: EmailMessage[] = JSON.parse(stored);
        list.sort((a, b) => b.timestamp - a.timestamp);
        if (cleanEmail) {
          const userEmails = list.filter(
            (e) =>
              e.toEmail.toLowerCase() === cleanEmail ||
              e.toEmail.toLowerCase() === 'victor@hirebloom.com'
          );
          return userEmails.length > 0 ? userEmails : list;
        }
        return list;
      }

      await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_EMAILS));
      return INITIAL_SEED_EMAILS;
    } catch {
      return INITIAL_SEED_EMAILS;
    }
  },

  /**
   * Mark an email as read
   */
  async markAsRead(emailId: string): Promise<void> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        await updateDoc(doc(db, 'emails', emailId), { read: true });
      }

      const stored = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
      const list: EmailMessage[] = stored ? JSON.parse(stored) : INITIAL_SEED_EMAILS;
      const updated = list.map((e) => (e.id === emailId ? { ...e, read: true } : e));
      await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
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
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'emails', newEmail.id), newEmail);
      }

      const stored = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
      const list: EmailMessage[] = stored ? JSON.parse(stored) : INITIAL_SEED_EMAILS;
      const updated = [newEmail, ...list];
      await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
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
      fromName: 'Bloom Placements',
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
      },
      body: `Hi ${firstName},

We are thrilled to extend a formal placement offer for the role of ${job.title} at ${job.company}!

Offer Details:
• Compensation: ${offer.salary}
• Target Start Date: ${offer.startDate || 'Within 2 weeks'}
• Setup: Remote (US Hours)

Please visit your Hire Bloom Talent Portal to review the full contract terms and accept your offer to begin onboarding.

Congratulations on this remarkable achievement!
Eric Engebretsen & The Bloom Team`,
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
