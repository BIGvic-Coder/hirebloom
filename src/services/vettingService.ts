import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface VettingCheckpoint {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'passed' | 'in_review' | 'failed';
  score?: string;
  notes?: string;
  verifiedAt?: string;
}

export interface CandidateVettingRecord {
  candidateId: string;
  candidateName: string;
  overallStatus: 'Approved (~9% Vetted)' | 'Under Review' | 'Needs Evidence' | 'Declined';
  englishLevel: 'C1 Fluent' | 'C2 Bilingual / Native' | 'B2 Conversational';
  approvalScore: string;
  checkpoints: VettingCheckpoint[];
  reviewerName: string;
  reviewedAt: string;
}

const VETTING_STORAGE_KEY = '@hirebloom_vetting_cache';

export const SIX_LAYER_CHECKPOINTS: VettingCheckpoint[] = [
  {
    id: 'check-1',
    name: 'Verbal English & Pronunciation Assessment',
    category: 'Layer 1: Language',
    description: 'Face-to-face spoken English interview verifying C1/C2 conversational fluency and active listening.',
    status: 'passed',
    score: '9.8 / 10',
    notes: 'Native-level cadence, natural comprehension, flawless phone/video communication.',
    verifiedAt: 'Sep 06, 2026',
  },
  {
    id: 'check-2',
    name: 'Technical & Domain Skills Assessment',
    category: 'Layer 2: Domain Skills',
    description: 'Simulated customer support escalation scenario with Zendesk ticket resolution and macro writing.',
    status: 'passed',
    score: '98 / 100',
    notes: 'Outstanding technical writing and de-escalation skills demonstrated.',
    verifiedAt: 'Sep 07, 2026',
  },
  {
    id: 'check-3',
    name: 'Dedicated Workstation & Camera Quality',
    category: 'Layer 3: Hardware',
    description: 'Inspection of dual-screen capability, high-definition 1080p webcam, and noise-canceling headset.',
    status: 'passed',
    score: 'Pass (Verified)',
    notes: 'Professional quiet home office environment with zero background ambient noise.',
    verifiedAt: 'Sep 07, 2026',
  },
  {
    id: 'check-4',
    name: 'Fiber Internet Speed & Power Backup Setup',
    category: 'Layer 4: Reliability',
    description: 'Live speed test verifying 50+ Mbps download/upload and uninterrupted battery backup (UPS).',
    status: 'passed',
    score: '95 Mbps (Pass)',
    notes: 'Dedicated UPS power backup tested with 4-hour runtime rating.',
    verifiedAt: 'Sep 08, 2026',
  },
  {
    id: 'check-5',
    name: 'Identity & Educational Credential Verification',
    category: 'Layer 5: Compliance',
    description: 'Government ID KYC check and accredited university degree verification (74% US-college/BYU-Pathway educated talent).',
    status: 'passed',
    score: 'Verified KYC',
    notes: 'BYU-Pathway Worldwide accredited program credentials authenticated.',
    verifiedAt: 'Sep 08, 2026',
  },
  {
    id: 'check-6',
    name: 'Work Ethics & Cultural Alignment Review',
    category: 'Layer 6: Culture Fit',
    description: 'Scenario-based evaluation of proactive accountability, US business hours alignment, and remote reliability.',
    status: 'passed',
    score: '10 / 10',
    notes: 'Demonstrated high integrity, punctual attendance, and commitment to long-term client retention.',
    verifiedAt: 'Sep 08, 2026',
  },
];

const DEFAULT_VETTING_RECORDS: Record<string, CandidateVettingRecord> = {
  'demo-candidate-1': {
    candidateId: 'demo-candidate-1',
    candidateName: 'Victor Taiwo',
    overallStatus: 'Approved (~9% Vetted)',
    englishLevel: 'C1 Fluent',
    approvalScore: '97%',
    checkpoints: SIX_LAYER_CHECKPOINTS,
    reviewerName: 'Sarah Jenkins (Hire Bloom Operations)',
    reviewedAt: 'Sep 08, 2026',
  },
};

export const VettingService = {
  async getCandidateVetting(candidateId: string): Promise<CandidateVettingRecord> {
    try {
      if (!IS_MOCK_FIREBASE && db) {
        const snap = await getDoc(doc(db, 'vetting', candidateId));
        if (snap.exists()) {
          return snap.data() as CandidateVettingRecord;
        }
      }

      const localStr = await AsyncStorage.getItem(VETTING_STORAGE_KEY);
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (parsed[candidateId]) return parsed[candidateId];
      }

      const fallback = DEFAULT_VETTING_RECORDS[candidateId] || {
        candidateId,
        candidateName: 'Candidate',
        overallStatus: 'Approved (~9% Vetted)',
        englishLevel: 'C1 Fluent',
        approvalScore: '95%',
        checkpoints: SIX_LAYER_CHECKPOINTS,
        reviewerName: 'Hire Bloom Vetting Desk',
        reviewedAt: 'Recent',
      };

      return fallback;
    } catch {
      return DEFAULT_VETTING_RECORDS['demo-candidate-1'];
    }
  },

  async updateCheckpoint(
    candidateId: string,
    checkpointId: string,
    status: 'passed' | 'in_review' | 'failed',
    notes?: string
  ): Promise<boolean> {
    try {
      const record = await this.getCandidateVetting(candidateId);
      const updatedCheckpoints = record.checkpoints.map((c) =>
        c.id === checkpointId ? { ...c, status, ...(notes ? { notes } : {}) } : c
      );

      const updatedRecord: CandidateVettingRecord = {
        ...record,
        checkpoints: updatedCheckpoints,
      };

      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'vetting', candidateId), updatedRecord);
      }

      const localStr = await AsyncStorage.getItem(VETTING_STORAGE_KEY);
      const local = localStr ? JSON.parse(localStr) : {};
      local[candidateId] = updatedRecord;
      await AsyncStorage.setItem(VETTING_STORAGE_KEY, JSON.stringify(local));

      return true;
    } catch {
      return false;
    }
  },
};
