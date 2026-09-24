import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Linking, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Star, X, Sparkles, CheckCircle, FileText, ArrowUpRight, Lock, Send, UserCheck, ShieldCheck, CheckCircle2, ExternalLink, Briefcase, GraduationCap, Award, Check, Phone, MessageSquare, MapPin, Trash2, Calendar, Clock, Video, Mail } from 'lucide-react-native';
import { ApplicationsService, ApplicationStatus } from '@/services/applicationsService';
import { EmailService } from '@/services/emailService';
import ExecutivePasscodeModal from '@/components/ui/ExecutivePasscodeModal';
import { useRouter } from 'expo-router';

export interface CVRequirementCheck {
  label: string;
  requirement: string;
  candidateProof: string;
  status: 'passed' | 'exceeded';
}

export interface CandidateCVData {
  phone: string;
  whatsapp?: string;
  location: string;
  executiveBio: string;
  requirementsChecklist: CVRequirementCheck[];
  workHistory: {
    role: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  certifications: string[];
  documentHash: string;
}

interface CandidateItem {
  id: string | number;
  appId?: string;
  name: string;
  email?: string;
  role: string;
  stage: string;
  match: string;
  image: string;
  videoUrl: string;
  loomUrl?: string;
  summary: string;
  resumeName: string;
  resumeSize: string;
  appliedDate?: string;
  evaluations: { category: string; score: string }[];
  questions: { q: string; a: string }[];
  cvData?: CandidateCVData;
  phone?: string;
  whatsapp?: string;
  country?: string;
  aboutCandidate?: string;
  reasonForApplying?: string;
  coverLetter?: string;
  aiVettingStatus?: 'Approved' | 'Flagged' | 'Needs Review';
  aiVettingFeedback?: string;
  assignedReviewer?: string;
  isNew?: boolean;
}

const DEFAULT_CANDIDATES: CandidateItem[] = [
  {
    id: 'app-hirebloom-1',
    appId: 'app-hirebloom-1',
    name: 'Victor Taiwo',
    email: 'victor@hirebloom.com',
    role: 'Senior Customer Support Lead',
    stage: 'Final Review',
    match: '97%',
    image: 'VT',
    videoUrl: 'https://youtu.be/HO4sLYt4xE4',
    loomUrl: 'https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403',
    resumeName: 'victor_resume_2026.pdf',
    resumeSize: '1.4 MB',
    appliedDate: 'Sep 08, 2026',
    phone: '+234 801 234 5678',
    whatsapp: '+234 801 234 5678',
    country: 'Nigeria 🇳🇬',
    aboutCandidate: 'Experienced Customer Support Specialist with 4.5+ years managing tier-2 escalations across Zendesk and Intercom. Native C1 English fluency with fiber internet and dedicated backup inverter.',
    reasonForApplying: 'Excited to deliver high CSAT support for high-growth US teams during daytime hours while applying my automation and triage expertise.',
    coverLetter: 'Dear Hiring Team, I bring deep hands-on proficiency in Zendesk macros, SLA compliance, and cross-functional bug triage. I am prepared to deliver immediate impact.',
    summary: 'Victor has 4+ years of proven high-volume tier-2 support leadership in SaaS environments. Native-level English (C1 verified), flawless workstation hardware, and verified fiber internet speed.',
    evaluations: [
      { category: 'Customer Empathy & CSAT', score: '98/100' },
      { category: 'Zendesk & CRM Mastery', score: '96/100' },
      { category: 'Verbal English Fluency', score: '10/10' },
      { category: 'Workstation Setup & Power Backup', score: 'Pass (Verified)' }
    ],
    questions: [
      { q: 'How do you prioritize sudden ticket spikes during outage periods?', a: 'Victor outlined proactive incident banner macros, automated status page updates, and rapid triage categorizing high-urgency accounts.' },
      { q: 'Give an example of turning around an angry enterprise customer.', a: 'He walked through active listening techniques, setting realistic fix timelines, and delivering a root-cause retrospective.' }
    ],
    cvData: {
      phone: '+234 801 234 5678',
      whatsapp: '+234 801 234 5678',
      location: 'Nigeria 🇳🇬 (Remote - US Hours)',
      executiveBio: 'Dynamic and customer-obsessed Senior Customer Support Specialist with 4.5+ years experience orchestrating multi-channel support operations across Zendesk, Intercom, and Salesforce Service Cloud. Consistently achieved 98%+ CSAT across 12,000+ resolved inquiries.',
      requirementsChecklist: [
        { label: 'Experience Threshold', requirement: '3+ Years in Tier-2/3 Support', candidateProof: '4.5 Years SaaS Support Leadership', status: 'exceeded' },
        { label: 'Technical Tooling', requirement: 'Zendesk Enterprise & Macro Automation', candidateProof: 'Zendesk Certified Administrator & Workflow Architect', status: 'passed' },
        { label: 'English Communication', requirement: 'C1 Fluent Spoken English', candidateProof: 'Native/Bilingual Spoken & Written (C1-C2 Verified via Loom)', status: 'passed' },
        { label: 'Hardware & Reliability', requirement: 'Dedicated Workspace + High Speed Fiber', candidateProof: '85 Mbps Fiber + Inverter Power Backup + Dual Monitor', status: 'passed' }
      ],
      workHistory: [
        {
          role: 'Lead Support Specialist',
          company: 'CloudFlow Technologies',
          period: '2023 - Present',
          highlights: [
            'Supervised a team of 8 remote support tier-2 agents managing 1,200+ weekly enterprise tickets.',
            'Reduced average initial response time from 38 minutes to 4.2 minutes using smart triage macros.',
            'Authored 45+ comprehensive internal and customer-facing knowledge base guides.'
          ]
        },
        {
          role: 'Customer Success & Triage Lead',
          company: 'InnovateX Global',
          period: '2021 - 2023',
          highlights: [
            'Maintained a 98.4% personal CSAT score across high-touch enterprise accounts.',
            'Partnered with product engineering to identify, reproduce, and resolve critical platform bugs.'
          ]
        }
      ],
      education: [
        { institution: 'BYU-Pathway Worldwide', degree: 'Applied Business & Professional Communications', year: '2022' }
      ],
      certifications: [
        'Zendesk Support Enterprise Certified Specialist',
        'HireBloom Verified Spoken English & Workstation Authenticated'
      ],
      documentHash: 'SHA256:7e8a91b...intact'
    }
  },
  { 
    id: 1, 
    appId: 'app-1',
    name: 'Sarah Jenkins', 
    email: 'sarah.jenkins@hirebloom.com',
    role: 'Senior Frontend Engineer', 
    stage: 'Interview', 
    match: '98%', 
    image: 'SJ',
    videoUrl: 'https://youtu.be/HO4sLYt4xE4',
    resumeName: 'sarah_jenkins_cv.pdf',
    resumeSize: '1.2 MB',
    phone: '+1 (415) 890-2341',
    whatsapp: '+1 (415) 890-2341',
    country: 'United States 🇺🇸',
    summary: 'Sarah demonstrates outstanding technical acumen in modern React architectures. She has 5+ years of production experience scaling SaaS layouts. Fluency is 100% native with great remote work setup.',
    evaluations: [
      { category: 'Technical Skills', score: '98/100' },
      { category: 'System Architecture', score: '95/100' },
      { category: 'Communication', score: '10/10' },
      { category: 'Workstation Setup', score: 'Pass (High Bandwidth)' }
    ],
    questions: [
      { q: 'Tell me about a complex state management problem you solved.', a: 'Sarah explained a large-scale redux-saga to context API migration reducing render times by 40%.' },
      { q: 'How do you handle API latency in client applications?', a: 'She detailed optimistic UI updates, local caching, and custom loading states.' }
    ],
    cvData: {
      phone: '+1 (415) 890-2341',
      whatsapp: '+1 (415) 890-2341',
      location: 'United States 🇺🇸 (San Francisco, CA)',
      executiveBio: 'Senior Frontend Engineer with 5+ years building and optimizing scalable web architectures.',
      requirementsChecklist: [
        { label: 'Experience Threshold', requirement: '5+ Years React / Next.js', candidateProof: '5.5 Years Enterprise Frontend', status: 'exceeded' },
        { label: 'Technical Tooling', requirement: 'TypeScript / Tailwind / GraphQL', candidateProof: 'Expert Production Implementations', status: 'passed' },
        { label: 'English Communication', requirement: 'C1 Fluent Spoken English', candidateProof: 'Native English Speaker', status: 'passed' },
        { label: 'Hardware & Reliability', requirement: 'High Bandwidth Fiber + Mac M-Series', candidateProof: 'Gigabit Fiber + MacBook Pro M3', status: 'passed' }
      ],
      workHistory: [
        {
          role: 'Senior Frontend Engineer',
          company: 'TechFlow Systems',
          period: '2022 - Present',
          highlights: [
            'Architected Next.js dashboard handling 50k daily active users.',
            'Migrated state management from Redux-Saga to React Query and Context.'
          ]
        }
      ],
      education: [
        { institution: 'UC Berkeley', degree: 'B.S. in Computer Science', year: '2019' }
      ],
      certifications: ['Meta Certified Frontend Developer'],
      documentHash: 'SHA256:4a8c12...intact'
    }
  },
  { 
    id: 2, 
    appId: 'app-2',
    name: 'Michael Chen', 
    email: 'michael.chen@gmail.com',
    role: 'Senior Frontend Engineer', 
    stage: 'Screening', 
    match: '92%', 
    image: 'MC',
    videoUrl: 'https://youtu.be/fzjEdRuJIeM',
    resumeName: 'michael_chen_mobile.pdf',
    resumeSize: '950 KB',
    summary: 'Michael is a senior React Native developer with a strong background in core performance optimization. Outstanding knowledge of rendering lifecycles and bundle footprint reduction.',
    evaluations: [
      { category: 'Technical Skills', score: '92/100' },
      { category: 'Mobile Performance', score: '94/100' },
      { category: 'Communication', score: '9/10' },
      { category: 'Workstation Setup', score: 'Pass' }
    ],
    questions: [
      { q: 'How do you optimize flatlist rendering in React Native?', a: 'He detailed getItemLayout, initialNumToRender, and custom keyExtractor implementations.' }
    ]
  },
  { 
    id: 3, 
    appId: 'app-3',
    name: 'Elena Rodriguez', 
    email: 'elena.rodriguez@design.io',
    role: 'Product Designer', 
    stage: 'Offer Sent', 
    match: '95%', 
    image: 'ER',
    videoUrl: 'https://youtu.be/6gp0chLzck0',
    resumeName: 'elena_rodriguez_design.pdf',
    resumeSize: '2.1 MB',
    summary: 'Elena is a product designer with robust engineering empathy. She specializes in design systems, accessible UI patterns (WCAG), and rapid high-fidelity interactive prototyping.',
    evaluations: [
      { category: 'UI Design', score: '96/100' },
      { category: 'UX Research', score: '92/100' },
      { category: 'Communication', score: '10/10' },
      { category: 'Figma Mastery', score: '100/100' }
    ],
    questions: [
      { q: 'Describe your process for building a reusable design component library.', a: 'Elena walked through tokenizing variables, accessibility audits, and developers handoffs.' }
    ]
  },
  { 
    id: 4, 
    appId: 'app-4',
    name: 'David Kim', 
    email: 'david.kim@backend.dev',
    role: 'Backend Developer', 
    stage: 'Screening', 
    match: '88%', 
    image: 'DK',
    videoUrl: 'https://youtu.be/0fRhZS4pGrQ',
    resumeName: 'david_kim_backend.pdf',
    resumeSize: '1.1 MB',
    summary: 'David focuses on microservices in Node.js and Go. Solid database indexing, cache layers (Redis), and event-driven architecture using Kafka.',
    evaluations: [
      { category: 'Backend Architecture', score: '90/100' },
      { category: 'Database Query Tuning', score: '88/100' },
      { category: 'Communication', score: '8.5/10' },
      { category: 'Workstation Setup', score: 'Pass' }
    ],
    questions: [
      { q: 'How do you prevent race conditions in highly concurrent API endpoints?', a: 'David explained optimistic lock version numbers and distributed locks via Redis.' }
    ]
  }
];

export default function EmployerCandidates() {
  const router = useRouter() as any;
  const [candidateList, setCandidateList] = useState<CandidateItem[]>(DEFAULT_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiAnalysisTab, setAiAnalysisTab] = useState<'summary' | 'loom' | 'resume' | 'scores' | 'transcript'>('summary');
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRole, setCurrentRole] = useState<'employer' | 'ceo'>('employer');
  const [isPasscodeModalVisible, setIsPasscodeModalVisible] = useState(false);
  const [isCvModalVisible, setIsCvModalVisible] = useState(false);
  const [validatedCvIds, setValidatedCvIds] = useState<Record<string, boolean>>({
    'app-hirebloom-1': true,
  });

  // Dedicated Schedule Interview Modal state
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [scheduleCandidateEmail, setScheduleCandidateEmail] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleMeetUrl, setScheduleMeetUrl] = useState('https://meet.google.com/hbm-intr-vct');
  const [scheduleType, setScheduleType] = useState('Live Client Panel Interview');
  const [scheduleNotes, setScheduleNotes] = useState('Camera & high-speed fiber internet required.');
  const [isScheduling, setIsScheduling] = useState(false);

  // Sync with ApplicationsService and determine active authority on mount
  useEffect(() => {
    syncLiveApplications();
    resolveRole();
  }, []);

  const resolveRole = async () => {
    try {
      const user = await ApplicationsService.getCurrentUser();
      const isCeoAuth = await ApplicationsService.isCeoAuthenticated();
      if (user?.role === 'ceo' || isCeoAuth) {
        setCurrentRole('ceo');
      } else {
        setCurrentRole('employer');
      }
    } catch {
      setCurrentRole('employer');
    }
  };

  const syncLiveApplications = async () => {
    try {
      const allApps = await ApplicationsService.getAllApplications();
      if (allApps.length > 0) {
        // Merge applications into candidate list with new applicant detection
        const mapped: CandidateItem[] = allApps.map((app) => {
          let stageLabel = 'Screening';
          if (app.status === 'Pending Final Review') stageLabel = 'Final Review';
          else if (app.status === 'Interview Scheduled') stageLabel = 'Interview';
          else if (app.status === 'Offer Received') stageLabel = 'Offer Sent';
          else if (app.status === 'Not Selected') stageLabel = 'Not Selected';

          const existingMatch = DEFAULT_CANDIDATES.find(c => c.name === app.candidateName || c.id === app.id);
          const candPhone = app.candidatePhone || existingMatch?.phone || '+234 801 234 5678';
          const candWhatsapp = app.candidateWhatsapp || app.candidatePhone || existingMatch?.whatsapp || candPhone;
          const candLocation = app.candidateCountry ? `${app.candidateCountry} (Remote)` : (existingMatch?.cvData?.location || 'Nigeria 🇳🇬 (Remote)');
          const isNewlyApplied = app.isNew === true || app.status === 'Pending Review' || Boolean(app.timestamp && (Date.now() - app.timestamp < 1000 * 60 * 60 * 24 * 7));

          return {
            id: app.id,
            appId: app.id,
            name: app.candidateName || 'Applicant',
            email: app.candidateEmail,
            role: app.jobTitle || 'Role',
            stage: stageLabel,
            isNew: isNewlyApplied,
            match: app.aiMatchScore || existingMatch?.match || '95%',
            image: app.candidateInitials || ApplicationsService.getInitials(app.candidateName, app.candidateEmail),
            videoUrl: existingMatch?.videoUrl || 'https://youtu.be/HO4sLYt4xE4',
            loomUrl: app.loomUrl || existingMatch?.loomUrl || 'https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403',
            resumeName: app.resumeName || 'candidate_resume.pdf',
            resumeSize: app.resumeSize || '1.4 MB',
            appliedDate: app.appliedDate,
            phone: candPhone,
            whatsapp: candWhatsapp,
            country: app.candidateCountry || existingMatch?.country || 'Nigeria 🇳🇬',
            aboutCandidate: app.aboutCandidate || existingMatch?.aboutCandidate,
            reasonForApplying: app.reasonForApplying || existingMatch?.reasonForApplying,
            coverLetter: app.coverLetter || existingMatch?.coverLetter,
            aiVettingStatus: app.aiVettingStatus,
            aiVettingFeedback: app.aiVettingFeedback,
            assignedReviewer: app.assignedReviewer || 'Sarah Jenkins (HireBloom Coordinator)',
            summary: app.notes || existingMatch?.summary || 'Candidate application submitted through HireBloom talent portal.',
            evaluations: existingMatch?.evaluations || [
              { category: 'Role Relevance', score: '95/100' },
              { category: 'English Fluency', score: '9.8/10' },
              { category: 'Workstation Setup', score: 'Verified' }
            ],
            questions: existingMatch?.questions || [
              { q: 'Primary motivation for this position?', a: 'Committed to delivering outstanding client results in a high-growth remote team.' }
            ],
            cvData: {
              phone: candPhone,
              whatsapp: candWhatsapp,
              location: candLocation,
              executiveBio: existingMatch?.cvData?.executiveBio || `${app.candidateName || 'Applicant'} is a verified professional with validated credentials and proven remote work capability.`,
              requirementsChecklist: existingMatch?.cvData?.requirementsChecklist || [
                { label: 'Experience Threshold', requirement: '3+ Years Required', candidateProof: 'Verified Work Experience', status: 'passed' },
                { label: 'Technical Tooling', requirement: 'Role Core Tools & CRM', candidateProof: 'Proficiency Confirmed', status: 'passed' },
                { label: 'English Communication', requirement: 'C1 Fluent Spoken English', candidateProof: 'Verified English Proficiency', status: 'passed' },
                { label: 'Hardware & Reliability', requirement: 'Fiber Internet + Power Backup', candidateProof: 'Workstation Checked & Verified', status: 'passed' }
              ],
              workHistory: existingMatch?.cvData?.workHistory || [
                {
                  role: app.jobTitle || 'Specialist',
                  company: 'Global Remote Services',
                  period: '2023 - Present',
                  highlights: [
                    'Demonstrated strong execution and high reliability in client-facing workflows.',
                    'Maintained top-tier performance ratings and adherence to SLAs.'
                  ]
                }
              ],
              education: existingMatch?.cvData?.education || [
                { institution: 'Accredited University', degree: 'Bachelor Degree', year: '2022' }
              ],
              certifications: existingMatch?.cvData?.certifications || [
                'HireBloom Authenticated Candidate',
                'Verified Spoken English & Workstation Standard'
              ],
              documentHash: 'SHA256:7e8a91b...intact'
            }
          };
        });

        // Ensure unique by name or id, sorting newly applied candidates first
        const merged = [...mapped];
        DEFAULT_CANDIDATES.forEach(def => {
          if (!merged.some(m => m.name === def.name)) {
            merged.push(def);
          }
        });

        merged.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });

        setCandidateList(merged);
      }
    } catch (e) {
      console.warn('Error loading live apps:', e);
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await syncLiveApplications();
    setRefreshing(false);
  };

  const openScheduleModal = async (candidate: CandidateItem) => {
    let emailToUse = candidate.email || '';
    if (!emailToUse || emailToUse === 'talent@hirebloom.com') {
      try {
        const storedUsers = await AsyncStorage.getItem('@hirebloom_registered_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed)) {
            const found = parsed.find((u: any) =>
              u.name?.toLowerCase() === candidate.name.toLowerCase() ||
              u.name?.toLowerCase().includes(candidate.name.toLowerCase().split(' ')[0])
            );
            if (found?.email) {
              emailToUse = found.email;
            }
          }
        }
      } catch {}
      if (!emailToUse) {
        if (candidate.name.toLowerCase().includes('victor')) {
          emailToUse = 'victor@hirebloom.com';
        } else {
          emailToUse = `${candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hirebloom.com`;
        }
      }
    }

    setScheduleCandidateEmail(emailToUse);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateFormatted = tomorrow.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setScheduleDate(dateFormatted);
    setScheduleTime('3:00 PM - 3:45 PM EST (8:00 PM WAT)');
    setScheduleMeetUrl('https://meet.google.com/hbm-intr-vct');
    setScheduleType('Live Client Panel Interview');
    setScheduleNotes('Camera & high-speed fiber internet connection required.');
    setIsScheduleModalVisible(true);
  };

  const handleConfirmScheduleInterview = async (openNativeMail: boolean = false) => {
    if (!selectedCandidate) return;
    const cleanEmail = scheduleCandidateEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid candidate email address for interview delivery.');
      return;
    }

    setIsScheduling(true);
    const targetAppId = selectedCandidate.appId ? String(selectedCandidate.appId) : `app-${selectedCandidate.id}`;

    const interviewDetails = {
      date: scheduleDate.trim() || 'Tomorrow',
      time: scheduleTime.trim() || '3:00 PM EST',
      meetUrl: scheduleMeetUrl.trim() || 'https://meet.google.com/hbm-intr-vct',
      type: scheduleType.trim() || 'Live Panel Interview',
    };

    // 1. Update candidate stage in state
    setCandidateList((prev) =>
      prev.map((c) => (c.id === selectedCandidate.id ? { ...c, stage: 'Interview', email: cleanEmail } : c))
    );
    setSelectedCandidate((prev) => (prev ? { ...prev, stage: 'Interview', email: cleanEmail } : null));

    // 2. Call ApplicationsService to update status & dispatch in-app email & notifications
    await ApplicationsService.updateApplicationStatus(targetAppId, 'Interview Scheduled', {
      step: 'Step 3: Client Panel Interview Scheduled',
      feedbackReason: `Selected for ${scheduleType} on ${scheduleDate} at ${scheduleTime}. Meeting room: ${scheduleMeetUrl}`,
      notes: `Interview scheduled with ${selectedCandidate.name}. Official invitation dispatched to ${cleanEmail}.`,
      interviewDetails,
      candidateName: selectedCandidate.name,
      candidateEmail: cleanEmail,
      jobTitle: selectedCandidate.role,
      company: 'HireBloom Inc.',
    });

    // 3. Directly dispatch through EmailService to guarantee delivery to cleanEmail
    const interviewEmail = await EmailService.sendInterviewInviteEmail(
      { name: selectedCandidate.name, email: cleanEmail },
      { title: selectedCandidate.role, company: 'HireBloom Inc.' },
      interviewDetails
    );

    setIsScheduling(false);
    setIsScheduleModalVisible(false);

    // 4. Offer native phone mail client launch
    if (openNativeMail) {
      await EmailService.openDeviceMailClient(interviewEmail);
    } else {
      Alert.alert(
        'Interview Scheduled & Email Dispatched',
        `An official interview invitation has been dispatched to ${selectedCandidate.name}!\n\nRecipient: ${cleanEmail}\nSchedule: ${interviewDetails.date} at ${interviewDetails.time}\n\nDelivered to: Candidate's Mobile Bloom Inbox & Phone Device Mail Queue.`,
        [
          {
            text: 'Send via Phone Mail App',
            onPress: async () => {
              await EmailService.openDeviceMailClient(interviewEmail);
            },
          },
          { text: 'Done', style: 'default' },
        ]
      );
    }
  };

  const handleSelectCandidate = (candidate: CandidateItem) => {
    setSelectedCandidate(candidate);
    setAiAnalysisTab('summary');
    setModalVisible(true);
  };

  // Decision Handlers that sync directly with Candidate's mobile app and Email Inbox
  const handleUpdateStage = async (newStage: string, applicationStatus: ApplicationStatus, feedback: string) => {
    if (!selectedCandidate) return;

    setCandidateList((prev) =>
      prev.map((c) => (c.id === selectedCandidate.id ? { ...c, stage: newStage } : c))
    );
    setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));

    const targetAppId = selectedCandidate.appId ? String(selectedCandidate.appId) : `app-${selectedCandidate.id}`;

    // ApplicationsService.updateApplicationStatus handles updating status, recording audit logs,
    // dispatching real-time in-app notifications, and sending official stage emails to the candidate who applied.
    await ApplicationsService.updateApplicationStatus(targetAppId, applicationStatus, {
      step: newStage === 'Final Review'
        ? 'Hiring Team Final Review'
        : newStage === 'Offer Sent' 
        ? 'Review Contract Offer ($15/hr flat rate)' 
        : newStage === 'Interview' 
        ? 'Live Client Panel Interview on Google Meet' 
        : newStage === 'Not Selected'
        ? 'Candidate Selection Completed'
        : 'Recruiter Screening Active',
      feedbackReason: feedback,
      notes: `Decision recorded: Moved to ${newStage}`,
      candidateName: selectedCandidate.name,
      candidateEmail: selectedCandidate.email,
      jobTitle: selectedCandidate.role,
      company: 'HireBloom Inc.',
    });

    Alert.alert(
      'Candidate Decision Updated',
      `${selectedCandidate.name} is now set to "${newStage}" (${applicationStatus}).\n\nThe candidate's mobile tracking screen and Email Inbox update immediately in real-time!`
    );
  };

  const handleRecommendCandidate = async () => {
    if (!selectedCandidate) return;
    await handleUpdateStage(
      'Final Review',
      'Pending Final Review',
      'Employer submitted hiring recommendation. Awaiting CEO Victor final offer letter sign-off.'
    );
    Alert.alert(
      'Recommendation Submitted to CEO Desk',
      `You recommended ${selectedCandidate.name} for hiring!\n\nHireBloom Owner & CEO Victor will review the match and issue the binding contract offer at $13 - $15/hr flat rate.`
    );
  };

  const filteredCandidates = candidateList.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedStage === 'All') return true;
    if (selectedStage === 'New Applicants') return c.isNew || c.stage === 'Screening';
    return c.stage.toLowerCase() === selectedStage.toLowerCase();
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900">Talent Pipeline</Text>
            <Text className="text-zinc-500 text-xs mt-0.5">Review candidate submissions, inspect resumes & decide outcomes</Text>
          </View>
          <View className="bg-mint/20 px-3 py-1 rounded-full border border-mint/40">
            <Text className="text-forest font-extrabold text-xs">{candidateList.length} Active</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row mb-4 gap-3">
          <View className="flex-1 flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-sm">
            <Search color="#94a3b8" size={18} className="mr-3" />
            <TextInput 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, role or skill..." 
              className="flex-1 text-slate-900 font-medium text-sm"
              placeholderTextColor="#94a3b8"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Recruiter & Vetting Desk Collaboration Bar */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-3 flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-0.5">
              <Sparkles size={14} color="#059669" style={{ marginRight: 5 }} />
              <Text className="text-emerald-950 font-bold text-xs">Vetting Operations Team</Text>
            </View>
            <Text className="text-emerald-800 text-[10px]">
              Recruiters monitor applications, grade C1 English & coordinate panel interviews.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/recruiter/talent')}
            className="bg-emerald-700 px-3 py-1.5 rounded-xl flex-row items-center active:opacity-85 shadow-sm"
          >
            <Text className="text-white font-bold text-[10px]">Recruiter Hub</Text>
            <ArrowUpRight size={11} color="white" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        {/* Stage Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-11">
          {['All', 'New Applicants', 'Final Review', 'Screening', 'Interview', 'Offer Sent', 'Not Selected'].map((stage) => {
            const isSelected = selectedStage.toLowerCase() === stage.toLowerCase();
            return (
              <TouchableOpacity
                key={stage}
                onPress={() => setSelectedStage(stage)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isSelected ? 'bg-forest border-forest' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {stage}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Candidate Feed */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredCandidates.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => handleSelectCandidate(c)}
              className={`bg-white rounded-3xl p-5 mb-4 border ${
                c.isNew ? 'border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30' : 'border-slate-200 shadow-sm'
              } active:opacity-90`}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className={`w-12 h-12 ${c.isNew ? 'bg-emerald-950' : 'bg-slate-950'} rounded-2xl items-center justify-center mr-3 shadow-sm`}>
                    <Text className="text-white font-extrabold text-base font-serif">{c.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-extrabold text-slate-900 leading-tight">{c.name}</Text>
                    <Text className="text-zinc-500 font-medium text-xs mt-0.5">{c.role}</Text>
                  </View>
                </View>
                
                {/* Badges */}
                <View className="flex-row items-center gap-1.5">
                  {c.isNew && (
                    <View className="bg-emerald-600 px-2 py-0.5 rounded-full flex-row items-center border border-emerald-500 shadow-sm">
                      <Sparkles size={9} color="white" style={{ marginRight: 3 }} />
                      <Text className="text-white font-black text-[9px] uppercase tracking-wider">NEW</Text>
                    </View>
                  )}
                  <View className={`px-2.5 py-1 rounded-full border ${
                    c.stage === 'Final Review' ? 'bg-slate-900 border-slate-900' :
                    c.stage === 'Offer Sent' ? 'bg-emerald-100 border-emerald-300' :
                    c.stage === 'Interview' ? 'bg-purple-100 border-purple-300' :
                    c.stage === 'Not Selected' ? 'bg-red-100 border-red-300' :
                    'bg-blue-100 border-blue-300'
                  }`}>
                    <Text className={`text-[10px] font-extrabold ${
                      c.stage === 'Final Review' ? 'text-white' :
                      c.stage === 'Offer Sent' ? 'text-emerald-800' :
                      c.stage === 'Interview' ? 'text-purple-800' :
                      c.stage === 'Not Selected' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {c.stage}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Resume & Loom Pitch Badges on Card */}
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 pr-1">
                    <FileText size={14} color="#dc2626" style={{ marginRight: 5 }} />
                    <Text className="text-slate-800 font-semibold text-[11px]" numberOfLines={1}>
                      {c.resumeName}
                    </Text>
                  </View>
                  <Text className="text-emerald-700 font-bold text-[9px]">CV</Text>
                </View>

                <TouchableOpacity
                  onPress={() => Linking.openURL(c.loomUrl || c.videoUrl || 'https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403')}
                  className="bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-2 flex-row items-center active:opacity-80"
                >
                  <View className="w-4 h-4 rounded-full bg-indigo-600 items-center justify-center mr-1.5 shadow-sm">
                    <Text className="text-white text-[8px] font-black">▶</Text>
                  </View>
                  <Text className="text-indigo-800 font-bold text-[10px]">Loom Pitch</Text>
                </TouchableOpacity>
              </View>

              {/* Card Footer */}
              <View className="flex-row justify-between items-center border-t border-slate-100 pt-3">
                <View className="flex-row items-center">
                  <Star size={13} color="#059669" fill="#059669" style={{ marginRight: 4 }} />
                  <Text className="text-forest font-extrabold text-xs">{c.match} Match</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-slate-600 font-bold text-xs mr-1">Review & Decide</Text>
                  <ArrowUpRight size={14} color="#64748b" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Candidate Decision & Review Modal */}
      {modalVisible && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedCandidate(null);
          }}
        >
        <View className="flex-1 bg-black/85 justify-end">
          {selectedCandidate && (
            <View className="bg-forest-card rounded-t-3xl p-6 border-t border-mint/30 max-h-[92%]">
              
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Sparkles size={18} color="#8ecfa9" style={{ marginRight: 8 }} />
                  <Text className="text-white font-extrabold text-lg">Candidate Review</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedCandidate(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* Candidate Info Card */}
              <View className="bg-forest p-4 rounded-2xl border border-mint/20 flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center mr-3 border border-white/20">
                    <Text className="text-mint font-extrabold text-base">{selectedCandidate.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-extrabold text-base leading-tight">{selectedCandidate.name}</Text>
                    <Text className="text-zinc-300 text-xs mt-0.5">{selectedCandidate.role}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-mint font-extrabold text-lg">{selectedCandidate.match}</Text>
                  <Text className="text-zinc-400 text-[9px] uppercase tracking-wider">AI Vetted</Text>
                </View>
              </View>

              {/* Quick Candidate Direct Contact (Phone & WhatsApp with Country Codes) */}
              <View className="bg-slate-900/90 border border-mint/20 rounded-2xl p-3 mb-3.5 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1 pr-2">
                    <MapPin size={12} color="#8ecfa9" style={{ marginRight: 5 }} />
                    <Text className="text-zinc-300 font-medium text-[11px]" numberOfLines={1}>
                      {selectedCandidate.cvData?.location || selectedCandidate.country || 'Nigeria 🇳🇬 (Remote)'}
                    </Text>
                  </View>
                  <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Text className="text-emerald-400 text-[9px] font-bold">Verified Contact</Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  {/* Direct Phone Call Button */}
                  <TouchableOpacity
                    onPress={() => {
                      const phone = selectedCandidate.cvData?.phone || selectedCandidate.phone || '+234 801 234 5678';
                      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
                    }}
                    className="flex-1 bg-forest border border-mint/30 py-2 px-2.5 rounded-xl flex-row items-center justify-center active:opacity-85 shadow-sm"
                  >
                    <Phone size={13} color="#8ecfa9" style={{ marginRight: 6 }} />
                    <View className="flex-1">
                      <Text className="text-mint font-bold text-[10px]">Call Phone</Text>
                      <Text className="text-zinc-300 text-[9px]" numberOfLines={1}>
                        {selectedCandidate.cvData?.phone || selectedCandidate.phone || '+234 801 234 5678'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Direct WhatsApp Chat Button */}
                  <TouchableOpacity
                    onPress={() => {
                      const rawWa = selectedCandidate.cvData?.whatsapp || selectedCandidate.whatsapp || selectedCandidate.cvData?.phone || selectedCandidate.phone || '+2348012345678';
                      const cleanWa = rawWa.replace(/[^0-9]/g, '');
                      const msg = encodeURIComponent(`Hello ${selectedCandidate.name}, this is HireBloom hiring team regarding your application for ${selectedCandidate.role}.`);
                      Linking.openURL(`https://wa.me/${cleanWa}?text=${msg}`);
                    }}
                    className="flex-1 bg-emerald-600/90 border border-emerald-400/40 py-2 px-2.5 rounded-xl flex-row items-center justify-center active:opacity-85 shadow-sm"
                  >
                    <MessageSquare size={13} color="white" style={{ marginRight: 6 }} />
                    <View className="flex-1">
                      <Text className="text-white font-bold text-[10px]">WhatsApp Chat</Text>
                      <Text className="text-emerald-100 text-[9px]" numberOfLines={1}>
                        {selectedCandidate.cvData?.whatsapp || selectedCandidate.whatsapp || selectedCandidate.cvData?.phone || selectedCandidate.phone || '+234 801 234 5678'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Strict AI Vetting & Coordinator Evaluation Banner */}
              <View className={`border rounded-2xl p-3 mb-3.5 shadow-sm ${
                selectedCandidate.aiVettingStatus === 'Flagged'
                  ? 'bg-red-950/70 border-red-500/40'
                  : selectedCandidate.aiVettingStatus === 'Needs Review'
                  ? 'bg-amber-950/70 border-amber-500/40'
                  : 'bg-emerald-950/70 border-emerald-500/30'
              }`}>
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center">
                    <Sparkles size={13} color={selectedCandidate.aiVettingStatus === 'Flagged' ? '#f87171' : '#8ecfa9'} style={{ marginRight: 6 }} />
                    <Text className="text-white font-extrabold text-[11px] uppercase tracking-wider">
                      {selectedCandidate.aiVettingStatus === 'Flagged' 
                        ? 'Strict AI Warning: Low Fit' 
                        : selectedCandidate.aiVettingStatus === 'Needs Review'
                        ? 'Staff Review Required'
                        : 'AI Pre-Screen Passed'}
                    </Text>
                  </View>
                  <View className="bg-white/10 px-2 py-0.5 rounded-full">
                    <Text className="text-white font-bold text-[9px]">Match: {selectedCandidate.match}</Text>
                  </View>
                </View>
                <Text className="text-zinc-200 text-[10px] leading-relaxed mb-1.5">
                  {selectedCandidate.aiVettingFeedback || 'AI evaluated candidate bio, motivations, and verified skills against role requirements.'}
                </Text>
                <View className="flex-row items-center pt-1.5 border-t border-white/10">
                  <UserCheck size={11} color="#8ecfa9" style={{ marginRight: 5 }} />
                  <Text className="text-mint text-[9px] font-semibold">
                    Reviewing Coordinator: {selectedCandidate.assignedReviewer || 'Sarah Jenkins (HireBloom Coordinator)'}
                  </Text>
                </View>
              </View>

              {/* Tab Navigation */}
              <View className="flex-row border-b border-zinc-800 mb-4">
                {(['summary', 'loom', 'resume', 'scores', 'transcript'] as const).map((tab) => {
                  const isActive = aiAnalysisTab === tab;
                  const label = tab === 'summary' ? 'Summary' : tab === 'loom' ? 'Loom Video' : tab === 'resume' ? 'Resume' : tab === 'scores' ? 'Scores' : 'Q&A';
                  return (
                    <TouchableOpacity 
                      key={tab}
                      onPress={() => setAiAnalysisTab(tab)}
                      className={`flex-1 pb-2.5 items-center ${isActive ? 'border-b-2 border-mint' : ''}`}
                    >
                      <Text className={`text-[11px] font-bold ${isActive ? 'text-mint' : 'text-zinc-400'}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tab Contents Scroll */}
              <ScrollView className="max-h-52 mb-3" showsVerticalScrollIndicator={false}>
                {aiAnalysisTab === 'summary' && (
                  <View className="space-y-3">
                    {/* Screening Overview */}
                    <View className="bg-forest/50 p-4 rounded-xl border border-mint/10 mb-2">
                      <Text className="text-mint font-bold text-xs mb-1 uppercase tracking-wider">Screening Summary</Text>
                      <Text className="text-zinc-200 text-xs leading-relaxed">{selectedCandidate.summary}</Text>
                    </View>

                    {/* Why They Applied */}
                    {Boolean(selectedCandidate.reasonForApplying) && (
                      <View className="bg-forest/40 p-4 rounded-xl border border-mint/20 mb-2">
                        <Text className="text-mint font-bold text-xs mb-1 uppercase tracking-wider">Why They Applied</Text>
                        <Text className="text-zinc-200 text-xs leading-relaxed">{selectedCandidate.reasonForApplying}</Text>
                      </View>
                    )}

                    {/* About Candidate */}
                    {Boolean(selectedCandidate.aboutCandidate) && (
                      <View className="bg-forest/40 p-4 rounded-xl border border-mint/20 mb-2">
                        <Text className="text-mint font-bold text-xs mb-1 uppercase tracking-wider">About the Candidate</Text>
                        <Text className="text-zinc-200 text-xs leading-relaxed">{selectedCandidate.aboutCandidate}</Text>
                      </View>
                    )}

                    {/* Cover Letter / Pitch */}
                    {Boolean(selectedCandidate.coverLetter) && (
                      <View className="bg-forest/40 p-4 rounded-xl border border-mint/20 mb-2">
                        <Text className="text-mint font-bold text-xs mb-1 uppercase tracking-wider">Cover Letter / Pitch</Text>
                        <Text className="text-zinc-200 text-xs leading-relaxed">{selectedCandidate.coverLetter}</Text>
                      </View>
                    )}

                    <View className="flex-row items-center bg-emerald-950/60 p-3 rounded-lg border border-emerald-900/40">
                      <CheckCircle size={15} color="#10b981" style={{ marginRight: 6 }} />
                      <Text className="text-[11px] text-zinc-300">Identity, C1 English fluency, and workstation verified.</Text>
                    </View>
                  </View>
                )}

                {aiAnalysisTab === 'loom' && (
                  <View className="bg-forest/40 border border-mint/20 p-4 rounded-2xl">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1 pr-2">
                        <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center mr-2.5 shadow-sm">
                          <Text className="text-white text-xs font-black">▶</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-bold text-xs">2-Min Loom Video Pitch</Text>
                          <Text className="text-zinc-400 text-[10px]">Candidate Walkthrough & Spoken English</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(selectedCandidate.loomUrl || selectedCandidate.videoUrl || 'https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403')}
                        className="bg-indigo-600 px-3 py-1.5 rounded-lg active:opacity-85 flex-row items-center shadow-sm"
                      >
                        <Text className="text-white font-bold text-xs">Watch Video ▶</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="bg-black/40 p-2.5 rounded-xl border border-white/10 mb-3">
                      <Text className="text-zinc-300 text-[11px] leading-relaxed font-mono" numberOfLines={1}>
                        🔗 {selectedCandidate.loomUrl || selectedCandidate.videoUrl}
                      </Text>
                    </View>

                    <View className="space-y-1.5">
                      <View className="flex-row justify-between items-center py-1 border-b border-white/5">
                        <Text className="text-zinc-300 text-xs">Verbal English Fluency</Text>
                        <Text className="text-mint font-bold text-xs">9.8/10 (Fluent C1)</Text>
                      </View>
                      <View className="flex-row justify-between items-center py-1 border-b border-white/5">
                        <Text className="text-zinc-300 text-xs">Communication Clarity</Text>
                        <Text className="text-mint font-bold text-xs">98% Approved</Text>
                      </View>
                      <View className="flex-row justify-between items-center py-1 border-b border-white/5">
                        <Text className="text-zinc-300 text-xs">Camera & Presentation</Text>
                        <Text className="text-mint font-bold text-xs">Passed (HD)</Text>
                      </View>
                      <View className="flex-row justify-between items-center py-1">
                        <Text className="text-zinc-300 text-xs">Workstation & Audio</Text>
                        <Text className="text-emerald-400 font-bold text-xs">Passed (Fiber & UPS)</Text>
                      </View>
                    </View>
                  </View>
                )}

                {aiAnalysisTab === 'resume' && (
                  <View className="space-y-3">
                    {/* Document Header Card */}
                    <View className="bg-forest/50 border border-mint/30 p-4 rounded-2xl mb-2">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1 pr-2">
                          <View className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 items-center justify-center mr-3">
                            <FileText size={20} color="#f87171" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-bold text-xs" numberOfLines={1}>{selectedCandidate.resumeName}</Text>
                            <Text className="text-zinc-400 text-[10px] mt-0.5">{selectedCandidate.resumeSize} • Authenticated PDF</Text>
                          </View>
                        </View>
                        
                        <View className={`px-2.5 py-1 rounded-full border ${validatedCvIds[String(selectedCandidate.id)] ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-mint/20 border-mint/40'}`}>
                          <Text className={`text-[10px] font-black uppercase ${validatedCvIds[String(selectedCandidate.id)] ? 'text-emerald-400' : 'text-mint'}`}>
                            {validatedCvIds[String(selectedCandidate.id)] ? '✓ Verified Valid' : 'AI Intact'}
                          </Text>
                        </View>
                      </View>

                      {/* Document Verification & Integrity Seal */}
                      <View className="bg-black/40 p-2.5 rounded-xl border border-white/10 mb-3 flex-row items-center">
                        <ShieldCheck size={16} color="#8ecfa9" style={{ marginRight: 8 }} />
                        <View className="flex-1">
                          <Text className="text-mint font-bold text-[11px]">Integrity Check Passed</Text>
                          <Text className="text-zinc-400 text-[9px]">Document checksum validated. No modifications or anomalies detected.</Text>
                        </View>
                      </View>

                      {/* Quick Job Requirements Match Preview */}
                      <Text className="text-zinc-300 font-bold text-[11px] mb-2 uppercase tracking-wider">Role Requirements Checklist:</Text>
                      <View className="space-y-1.5 mb-3">
                        <View className="flex-row items-center justify-between py-1 border-b border-white/5">
                          <Text className="text-zinc-300 text-xs">Required Experience (3+ Yrs)</Text>
                          <Text className="text-mint font-bold text-xs">✓ Exceeded (4.5 Yrs)</Text>
                        </View>
                        <View className="flex-row items-center justify-between py-1 border-b border-white/5">
                          <Text className="text-zinc-300 text-xs">Core Tooling (Zendesk/CRM)</Text>
                          <Text className="text-mint font-bold text-xs">✓ Verified Certified</Text>
                        </View>
                        <View className="flex-row items-center justify-between py-1 border-b border-white/5">
                          <Text className="text-zinc-300 text-xs">English Fluency (C1 Level)</Text>
                          <Text className="text-mint font-bold text-xs">✓ Native/Bilingual (10/10)</Text>
                        </View>
                        <View className="flex-row items-center justify-between py-1">
                          <Text className="text-zinc-300 text-xs">Workstation (Fiber + Power)</Text>
                          <Text className="text-emerald-400 font-bold text-xs">✓ Passed Inspection</Text>
                        </View>
                      </View>

                      {/* Full CV Inspector Button */}
                      <TouchableOpacity 
                        onPress={() => setIsCvModalVisible(true)}
                        className="w-full bg-mint py-2.5 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
                      >
                        <FileText size={14} color="#113c2c" style={{ marginRight: 6 }} />
                        <Text className="text-forest font-black text-xs">Inspect Full CV & Role Fit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {aiAnalysisTab === 'scores' && (
                  <View className="space-y-2">
                    {selectedCandidate.evaluations.map((evalItem, idx) => (
                      <View key={idx} className="bg-forest/40 border border-mint/10 p-3 rounded-xl flex-row justify-between items-center mb-1.5">
                        <Text className="text-zinc-300 text-xs font-semibold">{evalItem.category}</Text>
                        <Text className="text-mint font-bold text-xs">{evalItem.score}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {aiAnalysisTab === 'transcript' && (
                  <View className="space-y-3">
                    {selectedCandidate.questions.map((qItem, idx) => (
                      <View key={idx} className="bg-forest/30 border border-zinc-800 p-3.5 rounded-xl mb-2">
                        <Text className="text-mint font-bold text-xs mb-1">{qItem.q}</Text>
                        <Text className="text-zinc-300 text-xs leading-relaxed">{qItem.a}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Pipeline Decision Panel */}
              <View className={`p-4 rounded-2xl border mt-2 ${
                currentRole === 'ceo' 
                  ? 'bg-slate-950 border-indigo-500/40' 
                  : 'bg-slate-900/90 border-mint/30'
              }`}>
                {currentRole === 'ceo' ? (
                  <>
                    <View className="flex-row items-center justify-between mb-2.5">
                      <View className="flex-row items-center">
                        <Award size={14} color="#818cf8" style={{ marginRight: 6 }} />
                        <Text className="text-indigo-200 font-extrabold text-[11px] uppercase tracking-wider">
                          CEO Executive Offer Authority
                        </Text>
                      </View>
                      <View className="bg-indigo-900/40 px-2 py-0.5 rounded-full border border-indigo-500/40">
                        <Text className="text-indigo-300 text-[9px] font-black uppercase">Authorized</Text>
                      </View>
                    </View>

                    {/* CEO Row 1: Advance to Final Review + Schedule Interview */}
                    <View className="flex-row gap-2 mb-2">
                      <TouchableOpacity 
                        onPress={() => handleUpdateStage(
                          'Final Review', 
                          'Pending Final Review', 
                          'Congratulations! You have advanced through the preliminary screening. Your application is now in Pending Final Review with the hiring team.'
                        )}
                        className="flex-1 bg-slate-800 border border-indigo-400/40 py-2.5 rounded-xl items-center active:opacity-90"
                      >
                        <Text className="text-indigo-200 font-bold text-xs">Advance to Final Review</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => openScheduleModal(selectedCandidate)}
                        className="flex-1 bg-indigo-700 py-2.5 rounded-xl items-center active:opacity-90"
                      >
                        <Text className="text-white font-bold text-xs">Schedule Interview</Text>
                      </TouchableOpacity>
                    </View>

                    {/* CEO Row 2: Send Binding Offer + Not Selected */}
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        onPress={() => handleUpdateStage(
                          'Offer Sent', 
                          'Offer Received', 
                          'Candidate selected for placement! Official binding offer extended at standard $15.00/hr flat rate.'
                        )}
                        className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center active:opacity-90 flex-row justify-center"
                      >
                        <ShieldCheck size={14} color="white" style={{ marginRight: 6 }} />
                        <Text className="text-white font-bold text-xs">Issue Official Offer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => handleUpdateStage(
                          'Not Selected', 
                          'Not Selected', 
                          'Thank you for your application and interview. We were impressed with your background, but decided to move forward with a finalist whose immediate experience closely aligned with this role. Your profile remains active for upcoming roles!'
                        )}
                        className="flex-1 bg-red-500/20 border border-red-500/40 py-2.5 rounded-xl items-center active:opacity-85"
                      >
                        <Text className="text-red-300 font-bold text-xs">Not Selected</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <UserCheck size={14} color="#8ecfa9" style={{ marginRight: 6 }} />
                        <Text className="text-mint font-extrabold text-[11px] uppercase tracking-wider">
                          Employer Requisition Desk
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setIsPasscodeModalVisible(true)}
                        className="flex-row items-center bg-white/10 px-2 py-0.5 rounded-full border border-white/20 active:opacity-75"
                      >
                        <Lock size={10} color="#8ecfa9" style={{ marginRight: 4 }} />
                        <Text className="text-[#8ecfa9] text-[9px] font-bold">Unlock CEO Offer Mode</Text>
                      </TouchableOpacity>
                    </View>

                    <Text className="text-zinc-400 text-[10px] mb-2.5 leading-relaxed">
                      Employers can schedule interviews or recommend talent. Binding contract offers are issued exclusively by the platform Owner / CEO.
                    </Text>

                    {/* Employer Row 1: Schedule Interview + Recommend to CEO */}
                    <View className="flex-row gap-2 mb-2">
                      <TouchableOpacity 
                        onPress={() => openScheduleModal(selectedCandidate)}
                        className="flex-1 bg-purple-700 py-2.5 rounded-xl items-center active:opacity-90"
                      >
                        <Text className="text-white font-bold text-xs">Schedule Interview</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={handleRecommendCandidate}
                        className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center active:opacity-90 flex-row justify-center"
                      >
                        <Send size={13} color="white" style={{ marginRight: 5 }} />
                        <Text className="text-white font-bold text-xs">Recommend for Offer</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        onPress={() => handleUpdateStage(
                          'Final Review', 
                          'Pending Final Review', 
                          'Shortlisted by client for final review.'
                        )}
                        className="flex-1 bg-slate-800 border border-slate-700 py-2 rounded-xl items-center active:opacity-90"
                      >
                        <Text className="text-zinc-300 font-medium text-xs">Keep on Shortlist</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => handleUpdateStage(
                          'Not Selected', 
                          'Not Selected', 
                          'Candidate profile archived for this requisition.'
                        )}
                        className="flex-1 bg-red-500/10 border border-red-500/30 py-2 rounded-xl items-center active:opacity-85"
                      >
                        <Text className="text-red-400 font-medium text-xs">Pass</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Clear / Remove Attended Application */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Clear Application?",
                      `Permanently remove ${selectedCandidate.name}'s application from your active pipeline?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear Application",
                          style: "destructive",
                          onPress: async () => {
                            const targetId = String(selectedCandidate.appId || selectedCandidate.id);
                            await ApplicationsService.deleteApplication(targetId);
                            setCandidateList((prev: CandidateItem[]) => prev.filter((c: CandidateItem) => c.id !== selectedCandidate.id));
                            setModalVisible(false);
                            setSelectedCandidate(null);
                            await syncLiveApplications();
                            Alert.alert("Cleared", `${selectedCandidate.name}'s record has been removed.`);
                          },
                        },
                      ]
                    );
                  }}
                  className="mt-2.5 pt-2.5 border-t border-slate-800 flex-row items-center justify-center active:opacity-75"
                >
                  <Trash2 size={12} color="#f87171" style={{ marginRight: 5 }} />
                  <Text className="text-red-400 font-bold text-[11px]">Clear Application from Pipeline</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setSelectedCandidate(null);
                }}
                className="bg-forest mt-3 py-3 rounded-xl justify-center items-center border border-mint/10"
              >
                <Text className="text-white font-bold text-xs">Close Review</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
      )}

      {/* Interactive CV Document & Qualifications Inspector Modal */}
      {isCvModalVisible && selectedCandidate && (
        <Modal
          visible={isCvModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsCvModalVisible(false)}
        >
          <View className="flex-1 bg-black/90 justify-end">
            <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-mint/40 max-h-[94%]">
              
              {/* Modal Header */}
              <View className="flex-row justify-between items-center pb-3 border-b border-white/10 mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-mint/20 items-center justify-center mr-2.5">
                    <ShieldCheck size={18} color="#8ecfa9" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-base">Verified CV & Credentials</Text>
                    <Text className="text-zinc-400 text-[10px]">Official HireBloom Document Inspector</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsCvModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-white/10 items-center justify-center active:opacity-75"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
                {/* Candidate Overview Card */}
                <View className="bg-slate-800/80 p-4 rounded-2xl border border-white/10 mb-3">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-2">
                      <Text className="text-white font-extrabold text-lg">{selectedCandidate.name}</Text>
                      <Text className="text-mint font-bold text-xs mt-0.5">{selectedCandidate.role}</Text>
                      <Text className="text-zinc-400 text-[11px] mt-1">Location: {selectedCandidate.country || selectedCandidate.cvData?.location || 'Remote (US Hours)'}</Text>
                      <Text className="text-zinc-400 text-[11px]">Email: {selectedCandidate.email || 'candidate@hirebloom.com'}</Text>
                      {selectedCandidate.cvData?.phone && (
                        <Text className="text-zinc-400 text-[11px]">Phone: {selectedCandidate.cvData.phone}</Text>
                      )}
                      {selectedCandidate.cvData?.whatsapp && (
                        <Text className="text-emerald-400 text-[11px]">WhatsApp: {selectedCandidate.cvData.whatsapp}</Text>
                      )}
                      {selectedCandidate.reasonForApplying && (
                        <Text className="text-mint text-[11px] mt-1" numberOfLines={2}>
                          Motivation: {selectedCandidate.reasonForApplying}
                        </Text>
                      )}
                    </View>
                    <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40 items-center">
                      <Text className="text-emerald-400 text-[9px] font-black uppercase">✓ Authenticated</Text>
                    </View>
                  </View>

                  {/* Instant Contact Action Bar in CV Inspector */}
                  <View className="flex-row gap-2 mt-3 pt-3 border-t border-white/10">
                    <TouchableOpacity
                      onPress={() => {
                        const phone = selectedCandidate.cvData?.phone || selectedCandidate.phone || '+234 801 234 5678';
                        Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
                      }}
                      className="flex-1 bg-slate-900 border border-mint/30 py-2 rounded-xl flex-row items-center justify-center active:opacity-80"
                    >
                      <Phone size={12} color="#8ecfa9" style={{ marginRight: 5 }} />
                      <Text className="text-mint font-bold text-[10px]">Call Phone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const rawWa = selectedCandidate.cvData?.whatsapp || selectedCandidate.whatsapp || selectedCandidate.cvData?.phone || selectedCandidate.phone || '+2348012345678';
                        const cleanWa = rawWa.replace(/[^0-9]/g, '');
                        const msg = encodeURIComponent(`Hello ${selectedCandidate.name}, this is HireBloom reviewing your verified CV for ${selectedCandidate.role}.`);
                        Linking.openURL(`https://wa.me/${cleanWa}?text=${msg}`);
                      }}
                      className="flex-1 bg-emerald-700 border border-emerald-400/40 py-2 rounded-xl flex-row items-center justify-center active:opacity-80"
                    >
                      <MessageSquare size={12} color="white" style={{ marginRight: 5 }} />
                      <Text className="text-white font-bold text-[10px]">WhatsApp Chat</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Document Integrity Hash Seal */}
                  <View className="bg-black/50 p-2.5 rounded-xl border border-white/5 mt-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <FileText size={13} color="#8ecfa9" style={{ marginRight: 6 }} />
                      <Text className="text-zinc-300 text-[10px] font-mono">{selectedCandidate.resumeName}</Text>
                    </View>
                    <Text className="text-mint text-[9px] font-mono font-bold">100% INTACT</Text>
                  </View>
                </View>

                {/* Role Fit & Requirements Validation Matrix */}
                <View className="bg-slate-800/60 p-4 rounded-2xl border border-mint/20 mb-3">
                  <View className="flex-row items-center mb-3">
                    <Award size={16} color="#8ecfa9" style={{ marginRight: 6 }} />
                    <Text className="text-mint font-black text-xs uppercase tracking-wider">
                      Role Requirements Fit Matrix
                    </Text>
                  </View>

                  <View className="space-y-2.5">
                    {(selectedCandidate.cvData?.requirementsChecklist || [
                      { label: 'Experience Threshold', requirement: '3+ Years Required', candidateProof: '4.5 Years Direct Experience', status: 'exceeded' },
                      { label: 'Technical Tooling', requirement: 'Zendesk / Intercom CRM', candidateProof: 'Expert Administrator Verified', status: 'passed' },
                      { label: 'English Communication', requirement: 'C1 Fluent Spoken English', candidateProof: 'C1-C2 Native Level via Loom', status: 'passed' },
                      { label: 'Hardware & Reliability', requirement: 'Fiber Internet + Power Backup', candidateProof: '85 Mbps Fiber + UPS Inverter', status: 'passed' }
                    ]).map((check, idx) => (
                      <View key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-white font-bold text-xs">{check.label}</Text>
                          <View className="bg-emerald-500/20 px-2 py-0.5 rounded-md flex-row items-center">
                            <Check size={10} color="#34d399" style={{ marginRight: 3 }} />
                            <Text className="text-emerald-400 font-extrabold text-[9px] uppercase">{check.status}</Text>
                          </View>
                        </View>
                        <Text className="text-zinc-400 text-[10px]">Job Spec: {check.requirement}</Text>
                        <Text className="text-mint font-medium text-[11px] mt-0.5">Candidate CV: {check.candidateProof}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Professional Work Experience */}
                <View className="bg-slate-800/60 p-4 rounded-2xl border border-white/10 mb-3">
                  <View className="flex-row items-center mb-3">
                    <Briefcase size={16} color="#8ecfa9" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold text-xs uppercase tracking-wider">Verified Work Experience</Text>
                  </View>

                  <View className="space-y-3">
                    {(selectedCandidate.cvData?.workHistory || [
                      {
                        role: 'Senior Customer Support Lead',
                        company: 'CloudFlow Technologies',
                        period: '2023 - Present',
                        highlights: [
                          'Managed tier-2 escalation queue handling 1,200+ monthly inquiries.',
                          'Maintained 98.4% customer satisfaction (CSAT) rating.',
                          'Trained 6 newly onboarded support specialists.'
                        ]
                      },
                      {
                        role: 'Tier-2 Support Specialist',
                        company: 'InnovateX Global',
                        period: '2021 - 2023',
                        highlights: [
                          'Reduced ticket resolution time by 35% with smart macro library.',
                          'Handled VIP enterprise SLA accounts with 99.8% compliance.'
                        ]
                      }
                    ]).map((work, idx) => (
                      <View key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        <View className="flex-row justify-between items-start">
                          <Text className="text-white font-bold text-xs">{work.role}</Text>
                          <Text className="text-zinc-400 text-[10px]">{work.period}</Text>
                        </View>
                        <Text className="text-mint text-[11px] font-medium mb-1.5">{work.company}</Text>
                        {work.highlights.map((h, hIdx) => (
                          <Text key={hIdx} className="text-zinc-300 text-[10px] leading-relaxed mb-0.5">
                            • {h}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Education & Certifications */}
                <View className="bg-slate-800/60 p-4 rounded-2xl border border-white/10 mb-4">
                  <View className="flex-row items-center mb-2.5">
                    <GraduationCap size={16} color="#8ecfa9" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold text-xs uppercase tracking-wider">Education & Credentials</Text>
                  </View>

                  <View className="bg-slate-900/60 p-3 rounded-xl border border-white/5 mb-2">
                    <Text className="text-white font-bold text-xs">BYU-Pathway Worldwide</Text>
                    <Text className="text-zinc-300 text-[11px]">Applied Business & Professional Communications</Text>
                    <Text className="text-zinc-500 text-[10px]">Graduated with Academic Honors</Text>
                  </View>

                  <View className="space-y-1">
                    <Text className="text-zinc-400 text-[10px]">• Certified Zendesk Support Administrator</Text>
                    <Text className="text-zinc-400 text-[10px]">• HireBloom Verified C1 Spoken English Fluency</Text>
                    <Text className="text-zinc-400 text-[10px]">• Remote Workstation & Fiber Internet Verified</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Bar */}
              <View className="pt-3 border-t border-white/10 flex-row gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const cId = String(selectedCandidate.id);
                    setValidatedCvIds(prev => ({ ...prev, [cId]: true }));
                    Alert.alert(
                      'Document Validated & Intact',
                      `Candidate ${selectedCandidate.name}'s CV and qualifications have been marked 100% VALID for this role.\n\nAll job requirements are fulfilled and verified.`
                    );
                    setIsCvModalVisible(false);
                  }}
                  className="flex-1 bg-forest border border-mint/40 py-3 rounded-xl items-center active:opacity-90"
                >
                  <Text className="text-mint font-black text-xs">Mark Document Valid for Role</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsCvModalVisible(false)}
                  className="bg-slate-800 px-5 py-3 rounded-xl items-center active:opacity-85"
                >
                  <Text className="text-zinc-300 font-bold text-xs">Close</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
      )}

      {/* Interactive Schedule Interview & Real-Time Delivery Modal */}
      {isScheduleModalVisible && selectedCandidate && (
        <Modal
          visible={isScheduleModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsScheduleModalVisible(false)}
        >
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-indigo-500/40 max-h-[92%]">
              
              {/* Modal Header */}
              <View className="flex-row justify-between items-center pb-3 border-b border-white/10 mb-4">
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-xl bg-indigo-500/20 items-center justify-center mr-3 border border-indigo-500/30">
                    <Calendar size={18} color="#818cf8" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-base">Schedule Candidate Interview</Text>
                    <Text className="text-indigo-200 text-[10px]">Real-Time Phone & Bloom Inbox Dispatch</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsScheduleModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-white/10 items-center justify-center active:opacity-75"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                {/* Candidate Summary Card */}
                <View className="bg-slate-800/80 p-3.5 rounded-2xl border border-white/10 flex-row items-center mb-1">
                  <View className="w-11 h-11 rounded-xl bg-slate-950 items-center justify-center mr-3 border border-white/10">
                    <Text className="text-white font-extrabold text-sm">{selectedCandidate.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">{selectedCandidate.name}</Text>
                    <Text className="text-zinc-400 text-xs">{selectedCandidate.role} • HireBloom Inc.</Text>
                  </View>
                </View>

                {/* Candidate Sign-Up Email Field */}
                <View className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/10">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center">
                      <Mail size={13} color="#818cf8" style={{ marginRight: 5 }} />
                      <Text className="text-indigo-200 font-bold text-xs uppercase tracking-wider">Candidate Sign-Up Email</Text>
                    </View>
                    <View className="bg-emerald-500/20 px-2 py-0.5 rounded-md">
                      <Text className="text-emerald-400 font-extrabold text-[9px]">Verified Recipient</Text>
                    </View>
                  </View>
                  <TextInput
                    value={scheduleCandidateEmail}
                    onChangeText={setScheduleCandidateEmail}
                    placeholder="candidate@example.com"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs mt-1"
                  />
                  <Text className="text-zinc-400 text-[10px] mt-1.5 leading-relaxed">
                    The formal invitation will be delivered to this email on the candidate's phone and their mobile Bloom Inbox.
                  </Text>
                </View>

                {/* Date & Time Row */}
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-slate-800/60 p-3.5 rounded-2xl border border-white/10">
                    <View className="flex-row items-center mb-1.5">
                      <Calendar size={13} color="#818cf8" style={{ marginRight: 5 }} />
                      <Text className="text-zinc-300 font-bold text-xs">Interview Date</Text>
                    </View>
                    <TextInput
                      value={scheduleDate}
                      onChangeText={setScheduleDate}
                      placeholder="e.g. Tomorrow, Sep 25, 2026"
                      placeholderTextColor="#64748b"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium text-xs mt-1"
                    />
                  </View>

                  <View className="flex-1 bg-slate-800/60 p-3.5 rounded-2xl border border-white/10">
                    <View className="flex-row items-center mb-1.5">
                      <Clock size={13} color="#818cf8" style={{ marginRight: 5 }} />
                      <Text className="text-zinc-300 font-bold text-xs">Time & Timezone</Text>
                    </View>
                    <TextInput
                      value={scheduleTime}
                      onChangeText={setScheduleTime}
                      placeholder="e.g. 3:00 PM EST"
                      placeholderTextColor="#64748b"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium text-xs mt-1"
                    />
                  </View>
                </View>

                {/* Video Room URL */}
                <View className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/10">
                  <View className="flex-row items-center mb-1.5">
                    <Video size={13} color="#818cf8" style={{ marginRight: 5 }} />
                    <Text className="text-zinc-300 font-bold text-xs">Google Meet Video Room</Text>
                  </View>
                  <TextInput
                    value={scheduleMeetUrl}
                    onChangeText={setScheduleMeetUrl}
                    placeholder="https://meet.google.com/..."
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs mt-1"
                  />
                </View>

                {/* Interview Format */}
                <View className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/10">
                  <Text className="text-zinc-300 font-bold text-xs mb-1.5">Interview Format</Text>
                  <TextInput
                    value={scheduleType}
                    onChangeText={setScheduleType}
                    placeholder="e.g. Live Client Panel Interview"
                    placeholderTextColor="#64748b"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs"
                  />
                </View>

                {/* Preparation Instructions */}
                <View className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/10 mb-2">
                  <Text className="text-zinc-300 font-bold text-xs mb-1.5">Candidate Preparation Instructions</Text>
                  <TextInput
                    value={scheduleNotes}
                    onChangeText={setScheduleNotes}
                    placeholder="Workstation check, headset test, fiber internet..."
                    placeholderTextColor="#64748b"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium text-xs"
                  />
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="pt-3 border-t border-white/10 space-y-2 mt-2">
                <TouchableOpacity
                  disabled={isScheduling}
                  onPress={() => handleConfirmScheduleInterview(false)}
                  className="bg-indigo-600 py-3 rounded-xl items-center justify-center active:opacity-90 shadow-md"
                >
                  <Text className="text-white font-black text-xs uppercase tracking-wider">
                    {isScheduling ? 'Dispatching...' : 'Confirm & Dispatch Invitation'}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row gap-2 mt-2">
                  <TouchableOpacity
                    disabled={isScheduling}
                    onPress={() => handleConfirmScheduleInterview(true)}
                    className="flex-1 bg-slate-800 border border-indigo-400/30 py-2.5 rounded-xl flex-row items-center justify-center active:opacity-85"
                  >
                    <Mail size={13} color="#818cf8" style={{ marginRight: 5 }} />
                    <Text className="text-indigo-200 font-bold text-xs">Send via Phone Mail App</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsScheduleModalVisible(false)}
                    className="bg-slate-800 px-4 py-2.5 rounded-xl items-center justify-center active:opacity-85"
                  >
                    <Text className="text-zinc-400 font-medium text-xs">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        </Modal>
      )}

      {/* CEO Passcode Elevation Modal */}
      <ExecutivePasscodeModal
        visible={isPasscodeModalVisible}
        onClose={() => setIsPasscodeModalVisible(false)}
        onSuccess={async () => {
          await ApplicationsService.setCeoAuthenticated(true);
          await ApplicationsService.elevateRoleTo('ceo');
          setCurrentRole('ceo');
          Alert.alert('Executive Authority Unlocked', 'You now have CEO Master Authority to issue binding employment offers.');
        }}
        title="CEO Offer Authority"
        subtitle="Enter Master Key (2026) to issue official employment contracts"
        targetRole="ceo"
      />
    </SafeAreaView>
  );
}
