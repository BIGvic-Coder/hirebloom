import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Search, Star, X, Sparkles, CheckCircle, FileText, ArrowUpRight } from 'lucide-react-native';
import { ApplicationsService, ApplicationStatus } from '@/services/applicationsService';

interface CandidateItem {
  id: string | number;
  appId?: string;
  name: string;
  role: string;
  stage: string;
  match: string;
  image: string;
  videoUrl: string;
  summary: string;
  resumeName: string;
  resumeSize: string;
  appliedDate?: string;
  evaluations: { category: string; score: string }[];
  questions: { q: string; a: string }[];
}

const DEFAULT_CANDIDATES: CandidateItem[] = [
  {
    id: 'app-hirebloom-1',
    appId: 'app-hirebloom-1',
    name: 'Victor Taiwo',
    role: 'Senior Customer Support Lead',
    stage: 'Final Review',
    match: '97%',
    image: 'VT',
    videoUrl: 'https://youtu.be/HO4sLYt4xE4',
    resumeName: 'victor_resume_2026.pdf',
    resumeSize: '1.4 MB',
    appliedDate: 'Sep 08, 2026',
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
    ]
  },
  { 
    id: 1, 
    appId: 'app-1',
    name: 'Sarah Jenkins', 
    role: 'Senior Frontend Engineer', 
    stage: 'Interview', 
    match: '98%', 
    image: 'SJ',
    videoUrl: 'https://youtu.be/HO4sLYt4xE4',
    resumeName: 'sarah_jenkins_cv.pdf',
    resumeSize: '1.2 MB',
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
    ]
  },
  { 
    id: 2, 
    appId: 'app-2',
    name: 'Michael Chen', 
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
  const [candidateList, setCandidateList] = useState<CandidateItem[]>(DEFAULT_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiAnalysisTab, setAiAnalysisTab] = useState<'summary' | 'scores' | 'transcript' | 'resume'>('summary');
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with ApplicationsService on mount
  useEffect(() => {
    syncLiveApplications();
  }, []);

  const syncLiveApplications = async () => {
    try {
      const allApps = await ApplicationsService.getAllApplications();
      if (allApps.length > 0) {
        // Merge applications into candidate list
        const mapped: CandidateItem[] = allApps.map((app) => {
          let stageLabel = 'Screening';
          if (app.status === 'Pending Final Review') stageLabel = 'Final Review';
          else if (app.status === 'Interview Scheduled') stageLabel = 'Interview';
          else if (app.status === 'Offer Received') stageLabel = 'Offer Sent';
          else if (app.status === 'Not Selected') stageLabel = 'Not Selected';

          const existingMatch = DEFAULT_CANDIDATES.find(c => c.name === app.candidateName || c.id === app.id);
          return {
            id: app.id,
            appId: app.id,
            name: app.candidateName || 'Applicant',
            role: app.jobTitle || 'Role',
            stage: stageLabel,
            match: existingMatch?.match || '95%',
            image: app.candidateInitials || ApplicationsService.getInitials(app.candidateName, app.candidateEmail),
            videoUrl: existingMatch?.videoUrl || 'https://youtu.be/HO4sLYt4xE4',
            resumeName: app.resumeName || 'candidate_resume.pdf',
            resumeSize: app.resumeSize || '1.4 MB',
            appliedDate: app.appliedDate,
            summary: app.notes || existingMatch?.summary || 'Candidate application submitted through HireBloom talent portal.',
            evaluations: existingMatch?.evaluations || [
              { category: 'Role Relevance', score: '95/100' },
              { category: 'English Fluency', score: '9.8/10' },
              { category: 'Workstation Setup', score: 'Verified' }
            ],
            questions: existingMatch?.questions || [
              { q: 'Primary motivation for this position?', a: 'Committed to delivering outstanding client results in a high-growth remote team.' }
            ]
          };
        });

        // Ensure unique by name or id
        const merged = [...mapped];
        DEFAULT_CANDIDATES.forEach(def => {
          if (!merged.some(m => m.name === def.name)) {
            merged.push(def);
          }
        });

        setCandidateList(merged);
      }
    } catch (e) {
      console.warn('Error loading live apps:', e);
    }
  };

  const handleSelectCandidate = (candidate: CandidateItem) => {
    setSelectedCandidate(candidate);
    setAiAnalysisTab('summary');
    setModalVisible(true);
  };

  // Decision Handlers that sync directly with Candidate's mobile app
  const handleUpdateStage = async (newStage: string, applicationStatus: ApplicationStatus, feedback: string) => {
    if (!selectedCandidate) return;

    setCandidateList((prev) =>
      prev.map((c) => (c.id === selectedCandidate.id ? { ...c, stage: newStage } : c))
    );
    setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));

    const targetAppId = selectedCandidate.appId ? String(selectedCandidate.appId) : `app-${selectedCandidate.id}`;

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
      notes: `Decision recorded by hiring team: Moved to ${newStage}`
    });

    Alert.alert(
      'Candidate Decision Updated',
      `${selectedCandidate.name} is now set to "${newStage}" (${applicationStatus}).\n\nThe candidate's mobile tracking screen updates immediately in real-time!`
    );
  };

  const filteredCandidates = candidateList.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedStage === 'All') return matchesSearch;
    return matchesSearch && c.stage.toLowerCase() === selectedStage.toLowerCase();
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

        {/* Stage Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-11">
          {['All', 'Final Review', 'Screening', 'Interview', 'Offer Sent', 'Not Selected'].map((stage) => {
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredCandidates.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => handleSelectCandidate(c)}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-200 shadow-sm active:opacity-90"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-12 h-12 bg-slate-950 rounded-2xl items-center justify-center mr-3 shadow-sm">
                    <Text className="text-white font-extrabold text-base font-serif">{c.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-extrabold text-slate-900 leading-tight">{c.name}</Text>
                    <Text className="text-zinc-500 font-medium text-xs mt-0.5">{c.role}</Text>
                  </View>
                </View>
                
                {/* Stage Badge */}
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

              {/* Resume Badge Preview on Card */}
              <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 pr-2">
                  <FileText size={15} color="#dc2626" style={{ marginRight: 6 }} />
                  <Text className="text-slate-800 font-semibold text-xs" numberOfLines={1}>
                    {c.resumeName}
                  </Text>
                  <Text className="text-zinc-400 text-[10px] ml-2">({c.resumeSize})</Text>
                </View>
                <Text className="text-emerald-700 font-bold text-[10px]">Attached</Text>
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

              {/* Tab Navigation */}
              <View className="flex-row border-b border-zinc-800 mb-4">
                {(['summary', 'resume', 'scores', 'transcript'] as const).map((tab) => {
                  const isActive = aiAnalysisTab === tab;
                  const label = tab === 'summary' ? 'Summary' : tab === 'resume' ? 'Resume / CV' : tab === 'scores' ? 'Scores' : 'Questions';
                  return (
                    <TouchableOpacity 
                      key={tab}
                      onPress={() => setAiAnalysisTab(tab)}
                      className={`flex-1 pb-2.5 items-center ${isActive ? 'border-b-2 border-mint' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${isActive ? 'text-mint' : 'text-zinc-400'}`}>
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
                    <View className="bg-forest/50 p-4 rounded-xl border border-mint/10 mb-2">
                      <Text className="text-mint font-bold text-xs mb-1 uppercase tracking-wider">Screening Summary</Text>
                      <Text className="text-zinc-200 text-xs leading-relaxed">{selectedCandidate.summary}</Text>
                    </View>
                    <View className="flex-row items-center bg-emerald-950/60 p-3 rounded-lg border border-emerald-900/40">
                      <CheckCircle size={15} color="#10b981" style={{ marginRight: 6 }} />
                      <Text className="text-[11px] text-zinc-300">Identity, C1 English fluency, and workstation verified.</Text>
                    </View>
                  </View>
                )}

                {aiAnalysisTab === 'resume' && (
                  <View className="bg-forest/40 border border-mint/20 p-4 rounded-2xl">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <FileText size={18} color="#dc2626" style={{ marginRight: 8 }} />
                        <View>
                          <Text className="text-white font-bold text-xs">{selectedCandidate.resumeName}</Text>
                          <Text className="text-zinc-400 text-[10px]">{selectedCandidate.resumeSize} • Submitted by candidate</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => Alert.alert("Resume Document", `Opening full document preview for ${selectedCandidate.name}...`)}
                        className="bg-mint/20 px-3 py-1 rounded-lg border border-mint/40"
                      >
                        <Text className="text-mint font-bold text-[10px]">Open PDF</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <Text className="text-zinc-300 text-xs leading-relaxed">
                        • Verified talent profile with deep experience in customer operations, ticketing systems & client escalation.
                      </Text>
                      <Text className="text-zinc-300 text-xs leading-relaxed mt-1">
                        • Candidate has attached full employment history and references.
                      </Text>
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
              <View className="bg-slate-900/90 p-4 rounded-2xl border border-mint/30 mt-2">
                <Text className="text-mint font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
                  Make Pipeline Decision (Syncs to Candidate App)
                </Text>
                
                {/* Row 1: Advance to Final Review + Schedule Interview */}
                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity 
                    onPress={() => handleUpdateStage(
                      'Final Review', 
                      'Pending Final Review', 
                      'Congratulations! You have advanced through the preliminary screening. Your application is now in Pending Final Review with the hiring team.'
                    )}
                    className="flex-1 bg-slate-800 border border-mint/40 py-2.5 rounded-xl items-center active:opacity-90"
                  >
                    <Text className="text-mint font-bold text-xs">Advance to Final Review</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => handleUpdateStage(
                      'Interview', 
                      'Interview Scheduled', 
                      'Selected for live panel interview on Google Meet. Interview invitation sent.'
                    )}
                    className="flex-1 bg-purple-700 py-2.5 rounded-xl items-center active:opacity-90"
                  >
                    <Text className="text-white font-bold text-xs">Schedule Interview</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Send Offer + Not Selected */}
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => handleUpdateStage(
                      'Offer Sent', 
                      'Offer Received', 
                      'Candidate selected for placement! Contract extended at standard $15/hr flat rate.'
                    )}
                    className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center active:opacity-90"
                  >
                    <Text className="text-white font-bold text-xs">Make Offer</Text>
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
    </SafeAreaView>
  );
}
