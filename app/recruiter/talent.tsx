import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Search,
  Sparkles,
  MapPin,
  ShieldCheck,
  FileText,
  Check,
  Eye,
  Send,
  Calendar,
  DollarSign,
  UserCheck,
  X,
  ChevronRight,
  Clock,
  Video,
  XCircle,
  MessageSquare,
  Award,
  SlidersHorizontal,
} from 'lucide-react-native';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import WorkflowStepper from '@/components/ui/WorkflowStepper';
import { ApplicationsService, JobApplication, ApplicationStatus } from '@/services/applicationsService';
import { WorkflowService } from '@/services/workflowService';

export default function RecruiterTalent() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Review' | 'Match' | 'Interview' | 'Offer' | 'Declined'>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Modal states for Admin Reviewer Desk
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule Interview fields
  const [interviewDate, setInterviewDate] = useState('Wednesday, Sep 16, 2026');
  const [interviewTime, setInterviewTime] = useState('2:00 PM - 2:30 PM (EST)');
  const [interviewMeetUrl, setInterviewMeetUrl] = useState('https://meet.google.com/hbm-intr-vct');

  // Offer fields
  const [offerSalary, setOfferSalary] = useState('$15 - $18 / hr');
  const [offerStartDate, setOfferStartDate] = useState('Within 2 weeks');

  // Reviewer identity
  const reviewerName = 'Sarah Jenkins (Hire Bloom Vetting Desk)';

  useEffect(() => {
    loadAllApplications();
  }, []);

  const loadAllApplications = async () => {
    try {
      const list = await ApplicationsService.getAllApplications();
      setApplications(list);
    } catch (e) {
      console.warn('Error loading applications in recruiter desk:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllApplications();
    setRefreshing(false);
  };

  const openReviewModal = (app: JobApplication) => {
    setSelectedApp(app);
    setFeedbackText(app.feedbackReason || app.notes || '');
    setReviewModalVisible(true);
  };

  // 1. Advance to Step 2: Match
  const handleAdvanceToMatch = async () => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    const feedback = feedbackText.trim() || 'Candidate passed 6-layer vetting and English proficiency assessment. Shortlisted for client partner requisition.';
    const success = await ApplicationsService.advanceToFinalReview(selectedApp.id, feedback, reviewerName);
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        'Candidate Matched (Step 2)',
        `${selectedApp.candidateName} has been advanced to Step 2: Match & Shortlist.\n\nAn official update email with your feedback has been sent to ${selectedApp.candidateEmail}!`
      );
      setReviewModalVisible(false);
      await loadAllApplications();
    }
  };

  // 2. Advance to Step 3: Interview
  const handleScheduleInterview = async () => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    const success = await ApplicationsService.scheduleInterview(
      selectedApp.id,
      {
        date: interviewDate,
        time: interviewTime,
        meetUrl: interviewMeetUrl,
        type: 'Panel Video Interview',
      },
      reviewerName
    );
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        'Interview Scheduled (Step 3)',
        `Interview invitation confirmed for ${selectedApp.candidateName}.\n\nAn official calendar invitation and meeting link have been dispatched to ${selectedApp.candidateEmail}!`
      );
      setReviewModalVisible(false);
      await loadAllApplications();
    }
  };

  // 3. Advance to Step 4: Offer
  const handleMakeOffer = async () => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    const success = await ApplicationsService.makeOffer(
      selectedApp.id,
      {
        salary: offerSalary,
        startDate: offerStartDate,
        role: selectedApp.jobTitle,
      },
      reviewerName
    );
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        'Offer Extended (Step 4)',
        `Formal placement offer extended to ${selectedApp.candidateName} at ${offerSalary}.\n\nOffer letter email has been sent to ${selectedApp.candidateEmail}!`
      );
      setReviewModalVisible(false);
      await loadAllApplications();
    }
  };

  // 4. Send Reviewer Feedback Only
  const handleSendFeedbackOnly = async () => {
    if (!selectedApp || !feedbackText.trim()) {
      Alert.alert('Feedback Required', 'Please enter your reviewer feedback before sending.');
      return;
    }
    setIsSubmitting(true);
    const success = await ApplicationsService.sendFeedbackOnly(selectedApp.id, feedbackText.trim(), reviewerName);
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        'Feedback Sent',
        `Your personalized feedback has been saved and sent via official email to ${selectedApp.candidateEmail}!`
      );
      setReviewModalVisible(false);
      await loadAllApplications();
    }
  };

  // 5. Mark as Not Selected with Feedback
  const handleMarkNotSelected = async () => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    const feedback = feedbackText.trim() || 'While we selected another candidate whose immediate domain experience aligned more closely with current team needs, your vetted profile remains active in the Bloom talent network.';
    const success = await ApplicationsService.markNotSelected(selectedApp.id, feedback, reviewerName);
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        'Decision Recorded',
        `Candidate selection concluded. A thoughtful notification and retention in the Bloom talent network has been sent to ${selectedApp.candidateEmail}.`
      );
      setReviewModalVisible(false);
      await loadAllApplications();
    }
  };

  // Quick feedback template inserter
  const insertTemplate = (text: string) => {
    setFeedbackText(text);
  };

  // Filter application list
  const filteredApps = applications.filter((app) => {
    const term = search.toLowerCase();
    const matchesSearch =
      app.candidateName.toLowerCase().includes(term) ||
      app.jobTitle.toLowerCase().includes(term) ||
      app.company.toLowerCase().includes(term) ||
      app.candidateEmail.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filter === 'Review') return app.status === 'Pending Review' || app.status === 'Screening';
    if (filter === 'Match') return app.status === 'Pending Final Review';
    if (filter === 'Interview') return app.status === 'Interview Scheduled';
    if (filter === 'Offer') return app.status === 'Offer Received';
    if (filter === 'Declined') return app.status === 'Not Selected';

    return true;
  });

  const getStageBadge = (status: ApplicationStatus) => {
    const info = WorkflowService.getPublicStageInfo(status);
    return (
      <View
        style={{ backgroundColor: info.bg, borderColor: info.border }}
        className="px-2.5 py-0.5 rounded-full border flex-row items-center"
      >
        <Text style={{ color: info.color }} className="text-[10px] font-extrabold uppercase">
          {info.badgeLabel}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Header */}
      <HireBloomHeader portalTitle="hirebloom" portalBadge="Admin Vetting Desk" userInitials="SJ" />

      <View className="flex-1 px-5 pt-4">
        {/* Desk Title & Live Stats */}
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-xs font-bold text-inkMuted uppercase tracking-wider">
              Talent Operations
            </Text>
            <Text className="text-2xl font-extrabold text-ink font-serif">
              Application & Resume Desk
            </Text>
          </View>
          <View className="bg-mintLight/60 border border-mint/40 px-3 py-1 rounded-full">
            <Text className="text-forest font-bold text-xs">
              {applications.length} Applicants Active
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-border rounded-2xl px-3.5 py-2.5 shadow-sm mb-3">
          <Search color="#94a3b8" size={17} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search candidate, role, or email..."
            className="flex-1 text-ink text-xs font-medium"
            placeholderTextColor="#94a3b8"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={15} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stage Filter Pills */}
        <View className="mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['All', 'Review', 'Match', 'Interview', 'Offer', 'Declined'] as const).map((tab) => {
              const isActive = filter === tab;
              const count = applications.filter((a) => {
                if (tab === 'All') return true;
                if (tab === 'Review') return a.status === 'Pending Review' || a.status === 'Screening';
                if (tab === 'Match') return a.status === 'Pending Final Review';
                if (tab === 'Interview') return a.status === 'Interview Scheduled';
                if (tab === 'Offer') return a.status === 'Offer Received';
                if (tab === 'Declined') return a.status === 'Not Selected';
                return true;
              }).length;

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setFilter(tab)}
                  className={`mr-2 px-3.5 py-1.5 rounded-full border flex-row items-center ${
                    isActive ? 'bg-forest border-forest' : 'bg-white border-border'
                  }`}
                >
                  <Text className={`text-xs font-bold mr-1.5 ${isActive ? 'text-white' : 'text-forest'}`}>
                    {tab === 'Review' ? 'Step 1: Review' : tab === 'Match' ? 'Step 2: Match' : tab === 'Interview' ? 'Step 3: Interview' : tab === 'Offer' ? 'Step 4: Offer' : tab}
                  </Text>
                  <View className={`px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-canvas'}`}>
                    <Text className={`text-[10px] font-extrabold ${isActive ? 'text-white' : 'text-inkMuted'}`}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Applications List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredApps.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl border border-border items-center justify-center mt-6">
              <FileText size={36} color="#cbd5e1" style={{ marginBottom: 10 }} />
              <Text className="text-ink font-bold text-sm">No applications in this category</Text>
              <Text className="text-inkMuted text-xs text-center mt-1">
                When candidates submit applications from the mobile portal, they will appear here for review.
              </Text>
            </View>
          ) : (
            filteredApps.map((app) => {
              const stageInfo = WorkflowService.getPublicStageInfo(app.status);

              return (
                <View
                  key={app.id}
                  className="bg-white rounded-3xl border border-border p-4 mb-4 shadow-sm"
                >
                  {/* Candidate Header Row */}
                  <View className="flex-row items-start mb-3">
                    <View className="w-12 h-12 rounded-2xl bg-forest items-center justify-center mr-3 shadow-sm">
                      <Text className="text-white font-extrabold text-sm">
                        {app.candidateInitials || app.candidateName.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-base font-bold text-ink mb-0.5">{app.candidateName}</Text>
                        {getStageBadge(app.status)}
                      </View>

                      <Text className="text-emerald-800 font-semibold text-xs mb-1">
                        {app.jobTitle} • <Text className="text-inkMuted">{app.company}</Text>
                      </Text>

                      <View className="flex-row items-center flex-wrap gap-2">
                        <Text className="text-[11px] text-inkMuted">{app.candidateEmail}</Text>
                        <Text className="text-[11px] text-zinc-300">•</Text>
                        <Text className="text-[11px] text-inkMuted">Applied {app.appliedDate}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Attached Resume Bar */}
                  <View className="bg-canvas border border-border rounded-xl p-2.5 flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 pr-2">
                      <FileText size={16} color="#dc2626" style={{ marginRight: 6 }} />
                      <Text className="text-slate-800 font-semibold text-xs" numberOfLines={1}>
                        {app.resumeName || 'candidate_resume.pdf'}
                      </Text>
                      <Text className="text-zinc-400 text-[10px] ml-1.5">
                        ({app.resumeSize || '1.4 MB'})
                      </Text>
                    </View>
                    <View className="bg-emerald-100 px-2 py-0.5 rounded flex-row items-center">
                      <Check size={10} color="#059669" strokeWidth={3} style={{ marginRight: 3 }} />
                      <Text className="text-[9px] font-bold text-emerald-800">C1 Verified</Text>
                    </View>
                  </View>

                  {/* Applicant Pitch Note (if any) */}
                  {app.notes ? (
                    <View className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
                      <Text className="text-[11px] text-slate-700 leading-relaxed">
                        <Text className="font-bold text-slate-900">Note: </Text>
                        {app.notes}
                      </Text>
                    </View>
                  ) : null}

                  {/* Hiring Team Feedback (if previously entered) */}
                  {app.feedbackReason ? (
                    <View className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 mb-3">
                      <Text className="text-[11px] text-emerald-950 leading-relaxed">
                        <Text className="font-bold text-emerald-900">Desk Feedback: </Text>
                        "{app.feedbackReason}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Decision Action Toolbar */}
                  <View className="border-t border-border pt-3 flex-row items-center justify-between">
                    <View>
                      <Text className="text-[9px] text-inkMuted uppercase font-bold">Current Step</Text>
                      <Text className="text-xs font-bold text-forest">{stageInfo.badgeLabel}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => openReviewModal(app)}
                      className="bg-forest px-4 py-2 rounded-xl flex-row items-center active:opacity-90 shadow-sm"
                    >
                      <Eye size={13} color="white" style={{ marginRight: 5 }} />
                      <Text className="text-white font-bold text-xs">Review & Evaluate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* ===================== ADMIN APPLICATION & RESUME REVIEW MODAL ===================== */}
      {selectedApp && (
        <Modal
          visible={reviewModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setReviewModalVisible(false)}
        >
          <SafeAreaView className="flex-1 bg-white">
            {/* Modal Header */}
            <View className="px-5 py-4 bg-white border-b border-zinc-200 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-forest items-center justify-center mr-3 shadow-sm">
                  <UserCheck size={20} color="white" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-slate-900">Application Evaluation</Text>
                  <Text className="text-xs text-emerald-800 font-semibold">
                    {selectedApp.candidateName} • {selectedApp.jobTitle}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center active:opacity-70"
              >
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
            >
              {/* Stepper Status Preview */}
              <View className="bg-canvas border border-border rounded-2xl p-4 mb-6">
                <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Public Candidate Journey
                </Text>
                <WorkflowStepper
                  currentStep={WorkflowService.getPublicStageInfo(selectedApp.status).stepNumber}
                  isDeclined={selectedApp.status === 'Not Selected'}
                />
              </View>

              {/* Candidate Credentials & Resume Details */}
              <View className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 mb-6 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-lg font-extrabold text-slate-900">
                      {selectedApp.candidateName}
                    </Text>
                    <Text className="text-xs text-zinc-500 font-medium">{selectedApp.candidateEmail}</Text>
                  </View>
                  <View className="bg-emerald-100 px-3 py-1 rounded-full">
                    <Text className="text-emerald-800 text-[10px] font-extrabold">Top 9% Vetted</Text>
                  </View>
                </View>

                {/* 6-Layer Vetting Checkpoints Grid */}
                <View className="flex-row flex-wrap gap-2 pt-3 border-t border-zinc-200 mb-4">
                  <View className="bg-white border border-zinc-200 px-2.5 py-1 rounded-lg flex-row items-center">
                    <ShieldCheck size={12} color="#059669" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-semibold text-slate-800">English: C1 Fluent</Text>
                  </View>
                  <View className="bg-white border border-zinc-200 px-2.5 py-1 rounded-lg flex-row items-center">
                    <Check size={12} color="#059669" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-semibold text-slate-800">BYU-Pathway Worldwide</Text>
                  </View>
                  <View className="bg-white border border-zinc-200 px-2.5 py-1 rounded-lg flex-row items-center">
                    <Check size={12} color="#059669" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-semibold text-slate-800">Fiber Speed: 50+ Mbps</Text>
                  </View>
                  <View className="bg-white border border-zinc-200 px-2.5 py-1 rounded-lg flex-row items-center">
                    <Check size={12} color="#059669" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-semibold text-slate-800">Battery Backup: Pass</Text>
                  </View>
                </View>

                {/* Submitted Resume Document Card */}
                <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Attached Resume
                </Text>
                <View className="bg-white border border-zinc-200 rounded-2xl p-3.5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 items-center justify-center mr-3">
                      <FileText size={18} color="#dc2626" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold text-xs" numberOfLines={1}>
                        {selectedApp.resumeName || 'victor_resume_2026.pdf'}
                      </Text>
                      <Text className="text-zinc-500 text-[10px]">
                        {selectedApp.resumeSize || '1.4 MB'} • Verified PDF Document
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Resume PDF Content Verified',
                        `Candidate: ${selectedApp.candidateName}\nRole: ${selectedApp.jobTitle}\n\nExperience Summary:\n• 4+ years Customer Support Leadership\n• Native-level English (C1 Accredited)\n• Zendesk, Intercom, CRM automation\n• Hardware workstation verified`
                      )
                    }
                    className="bg-zinc-100 px-3 py-1.5 rounded-lg flex-row items-center"
                  >
                    <Eye size={12} color="#334155" style={{ marginRight: 4 }} />
                    <Text className="text-slate-700 text-xs font-bold">Inspect</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reviewer Feedback Input Box */}
              <View className="bg-white border border-zinc-200 rounded-3xl p-5 mb-6 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <MessageSquare size={16} color="#113c2c" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Reviewer Feedback to Candidate
                    </Text>
                  </View>
                  <Text className="text-[10px] text-zinc-400 font-semibold">Sent via Email</Text>
                </View>

                <Text className="text-xs text-zinc-500 mb-3">
                  This personalized feedback will be emailed to {selectedApp.candidateEmail} and visible on their mobile talent portal.
                </Text>

                <TextInput
                  multiline
                  numberOfLines={4}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder="Type specific evaluation notes, assessment feedback, or encouragement for candidate..."
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-xs text-slate-900 leading-relaxed mb-3 text-start min-h-[90px]"
                  placeholderTextColor="#94a3b8"
                />

                {/* Quick Feedback Template Chips */}
                <Text className="text-[11px] font-bold text-slate-600 mb-2">Quick Feedback Presets:</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  <TouchableOpacity
                    onPress={() =>
                      insertTemplate(
                        'Candidate passed 6-layer screening with excellent C1 English fluency and verified hardware setup. Shortlisted for client matching.'
                      )
                    }
                    className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                  >
                    <Text className="text-[10px] font-bold text-emerald-800">
                      ✓ Pass Screening & C1 Fluent
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      insertTemplate(
                        'Client partner team was very impressed with previous SaaS tier-2 support experience. Moving candidate to panel interview.'
                      )
                    }
                    className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg"
                  >
                    <Text className="text-[10px] font-bold text-purple-800">
                      ✓ Advance to Client Interview
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      insertTemplate(
                        'Candidate successfully demonstrated strong problem solving. Extending formal employment placement offer.'
                      )
                    }
                    className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg"
                  >
                    <Text className="text-[10px] font-bold text-blue-800">
                      ✓ Extend Placement Offer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      insertTemplate(
                        'While we have selected another candidate whose immediate domain experience aligned more closely with current team needs, your vetted profile remains active in the Bloom talent network for matching opportunities.'
                      )
                    }
                    className="bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg"
                  >
                    <Text className="text-[10px] font-bold text-slate-700">
                      ✓ Network Retention
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Button to dispatch feedback email directly */}
                <TouchableOpacity
                  onPress={handleSendFeedbackOnly}
                  disabled={isSubmitting}
                  className="bg-zinc-100 border border-zinc-300 py-2.5 px-4 rounded-xl flex-row items-center justify-center active:opacity-80"
                >
                  <Send size={13} color="#334155" style={{ marginRight: 6 }} />
                  <Text className="text-slate-700 font-bold text-xs">
                    Send Feedback Email (Without Changing Stage)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pipeline Progression Controls */}
              <View className="bg-forest rounded-3xl p-5 mb-6 shadow-sm">
                <Text className="text-white font-extrabold text-base mb-1">
                  Advance Candidate Pipeline
                </Text>
                <Text className="text-mint font-medium text-xs mb-4">
                  Moving the candidate updates their live portal timeline and dispatches an official status email.
                </Text>

                {/* Action 1: Advance to Step 2 (Match) */}
                <TouchableOpacity
                  onPress={handleAdvanceToMatch}
                  disabled={isSubmitting}
                  className="bg-emerald-500 py-3.5 px-4 rounded-2xl flex-row items-center justify-between mb-3 active:opacity-90 shadow-sm"
                >
                  <View className="flex-row items-center">
                    <Check size={18} color="#064e3b" strokeWidth={3} style={{ marginRight: 8 }} />
                    <View>
                      <Text className="text-emerald-950 font-extrabold text-xs">
                        Move to Step 2: Match & Shortlist
                      </Text>
                      <Text className="text-emerald-900 text-[10px]">
                        Notifies candidate of passing initial screening
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#064e3b" />
                </TouchableOpacity>

                {/* Action 2: Schedule Interview (Step 3) */}
                <TouchableOpacity
                  onPress={handleScheduleInterview}
                  disabled={isSubmitting}
                  className="bg-purple-600 py-3.5 px-4 rounded-2xl flex-row items-center justify-between mb-3 active:opacity-90 shadow-sm"
                >
                  <View className="flex-row items-center">
                    <Video size={18} color="white" style={{ marginRight: 8 }} />
                    <View>
                      <Text className="text-white font-extrabold text-xs">
                        Move to Step 3: Schedule Interview
                      </Text>
                      <Text className="text-purple-200 text-[10px]">
                        Dispatches calendar invite & Meet room URL
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="white" />
                </TouchableOpacity>

                {/* Action 3: Make Formal Offer (Step 4) */}
                <TouchableOpacity
                  onPress={handleMakeOffer}
                  disabled={isSubmitting}
                  className="bg-white py-3.5 px-4 rounded-2xl flex-row items-center justify-between mb-4 active:opacity-90 shadow-sm"
                >
                  <View className="flex-row items-center">
                    <DollarSign size={18} color="#113c2c" strokeWidth={2.5} style={{ marginRight: 8 }} />
                    <View>
                      <Text className="text-forest font-extrabold text-xs">
                        Move to Step 4: Extend Formal Offer
                      </Text>
                      <Text className="text-zinc-500 text-[10px]">
                        Sends placement offer ({offerSalary}) & triggers onboarding
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#113c2c" />
                </TouchableOpacity>

                {/* Decline Option */}
                <TouchableOpacity
                  onPress={handleMarkNotSelected}
                  disabled={isSubmitting}
                  className="bg-red-950/60 border border-red-500/40 py-3 px-4 rounded-2xl flex-row items-center justify-center active:opacity-80"
                >
                  <XCircle size={15} color="#fca5a5" style={{ marginRight: 6 }} />
                  <Text className="text-red-200 font-bold text-xs">
                    Mark as Not Selected (Send Thoughtful Closure Email)
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}
