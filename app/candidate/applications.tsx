import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Building2, 
  Calendar, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  X, 
  Sparkles, 
  Check, 
  Download,
  Eye,
  Video,
  ArrowRight,
  ClipboardList,
  Mail,
  MessageSquare
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import WorkflowStepper from '@/components/ui/WorkflowStepper';
import EmailInboxModal from '@/components/ui/EmailInboxModal';
import { WorkflowService, PublicStageInfo } from '@/services/workflowService';
import { ApplicationsService, JobApplication, ApplicationStatus, UserSession } from '@/services/applicationsService';
import { EmailService } from '@/services/emailService';

export default function CandidateApplications() {
  const router = useRouter() as any;
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const loadApplications = async () => {
    const user = await ApplicationsService.getCurrentUser();
    setCurrentUser(user);
    const targetId = user?.uid || user?.email;
    const apps = await ApplicationsService.getCandidateApplications(targetId);
    setApplications(apps);
    if (apps.length > 0) {
      const match = selectedApp ? apps.find(a => a.id === selectedApp.id) : null;
      setSelectedApp(match || apps[0]);
    } else {
      setSelectedApp(null);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const currentApp = applications[activeAppIndex] || selectedApp || applications[0];
  const userInitials = currentUser?.initials || currentApp?.candidateInitials || 'VT';
  const stageInfo = WorkflowService.getPublicStageInfo(currentApp?.status);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Unified Professional Header */}
      <HireBloomHeader
        portalTitle="hirebloom"
        portalBadge="Talent Portal"
        userInitials={userInitials}
        userEmail={currentUser?.email || currentApp?.candidateEmail}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Talent Portal Sub-Header Navigation */}
        <View className="px-6 pt-5 pb-3">
          <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Talent Portal
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-zinc-100 px-3.5 py-1.5 rounded-lg">
              <FileText size={16} color="#0f172a" style={{ marginRight: 6 }} />
              <Text className="text-slate-900 font-bold text-sm">Application status</Text>
            </View>

            <TouchableOpacity
              onPress={() => setEmailModalVisible(true)}
              className="flex-row items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg active:opacity-75"
            >
              <Mail size={13} color="#065f46" style={{ marginRight: 5 }} />
              <Text className="text-emerald-900 font-bold text-xs">Email Inbox</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Multi-Application Selector Pill Bar */}
        {applications.length > 1 && (
          <View className="px-6 pt-2 pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {applications.map((app, idx) => {
                const isSelected = idx === activeAppIndex;
                return (
                  <TouchableOpacity
                    key={app.id}
                    onPress={() => {
                      setActiveAppIndex(idx);
                      setSelectedApp(app);
                    }}
                    className={`mr-2.5 px-3.5 py-2 rounded-xl border flex-row items-center ${
                      isSelected ? 'bg-slate-900 border-slate-900' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <Building2 size={13} color={isSelected ? 'white' : '#64748b'} style={{ marginRight: 6 }} />
                    <Text className={`text-xs font-bold mr-1.5 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {app.jobTitle}
                    </Text>
                    <View className={`px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20' : 'bg-zinc-200'}`}>
                      <Text className={`text-[9px] font-bold ${isSelected ? 'text-white' : 'text-zinc-600'}`}>
                        {app.company}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Main Talent Portal Status Area matching screenshot layout */}
        {currentApp ? (
          <View className="px-6 pt-4">
            
            {/* STATUS Subtitle, Badge & Large Title */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  APPLICATION STATUS
                </Text>
                <View 
                  style={{ backgroundColor: stageInfo.bg, borderColor: stageInfo.border }}
                  className="px-2.5 py-0.5 rounded-full border"
                >
                  <Text style={{ color: stageInfo.color }} className="text-[10px] font-bold uppercase tracking-wider">
                    {stageInfo.badgeLabel}
                  </Text>
                </View>
              </View>
              
              <Text className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {currentApp.status}
              </Text>
              
              <Text className="text-sm font-semibold text-emerald-700 mt-1 mb-4">
                {currentApp.jobTitle} • <Text className="text-zinc-500 font-normal">{currentApp.company}</Text>
              </Text>

              {/* 4-Step Public Hiring Journey Stepper */}
              <View className="bg-canvas border border-border rounded-2xl p-3">
                <WorkflowStepper currentStep={stageInfo.stepNumber} isDeclined={stageInfo.stage === 'Declined'} />
              </View>
            </View>

            {/* Hiring Team Official Reviewer Feedback Card */}
            {currentApp.feedbackReason ? (
              <View className="bg-emerald-50/80 border border-emerald-300 rounded-3xl p-4 mb-6 shadow-sm">
                <View className="flex-row justify-between items-center mb-1.5">
                  <View className="flex-row items-center">
                    <View className="w-7 h-7 rounded-xl bg-forest items-center justify-center mr-2">
                      <MessageSquare size={13} color="#8ecfa9" />
                    </View>
                    <Text className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Hiring Team Evaluation & Feedback
                    </Text>
                  </View>
                  <View className="bg-emerald-200/80 px-2 py-0.5 rounded-full">
                    <Text className="text-emerald-950 text-[9px] font-extrabold">Verified</Text>
                  </View>
                </View>

                <Text className="text-slate-800 text-xs italic leading-relaxed mb-3">
                  "{currentApp.feedbackReason}"
                </Text>

                <View className="pt-2 border-t border-emerald-200/60 flex-row justify-between items-center">
                  <Text className="text-[10px] text-emerald-800 font-semibold">
                    Review Desk • Hire Bloom Talent Operations
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEmailModalVisible(true)}
                    className="flex-row items-center bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm"
                  >
                    <Mail size={11} color="#065f46" style={{ marginRight: 4 }} />
                    <Text className="text-[10px] text-emerald-900 font-bold">View Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Status-specific Phrasing */}
            {currentApp.status === 'Pending Final Review' && (
              <View className="space-y-4 mb-8">
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  You’ve made it through the initial screening. Your application is now being reviewed by our hiring team for final consideration.
                </Text>

                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  This stage may take a little time as we align your experience with current openings. If we move forward, we’ll reach out to schedule next steps such as an interview or skills assessment.
                </Text>

                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  We’ll notify you as soon as a decision has been made.
                </Text>
              </View>
            )}

            {currentApp.status === 'Interview Scheduled' && (
              <View className="space-y-4 mb-8">
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  Congratulations! You have been selected for an interview with the hiring panel.
                </Text>
                
                {/* Interview Action Card */}
                <View className="bg-purple-50 border border-purple-200 p-5 rounded-2xl">
                  <View className="flex-row items-center mb-2">
                    <Video size={18} color="#7c3aed" style={{ marginRight: 8 }} />
                    <Text className="text-purple-900 font-bold text-sm">
                      {currentApp.interviewDetails?.type || 'Live Panel Interview'}
                    </Text>
                  </View>
                  <Text className="text-purple-800 text-xs mb-1">
                    Date & Time: <Text className="font-bold">{currentApp.interviewDetails?.date || 'Upcoming'} at {currentApp.interviewDetails?.time || 'Confirmed'}</Text>
                  </Text>
                  <Text className="text-purple-700 text-xs mb-3">
                    Meet Link: {currentApp.interviewDetails?.meetUrl || 'meet.google.com/hbm-intr'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => Alert.alert("Join Interview", "Launching your video interview meeting room...")}
                    className="bg-purple-700 py-2.5 px-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-xs">Join Meeting Room</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {currentApp.status === 'Offer Received' && (
              <View className="space-y-4 mb-8">
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  Great news! You have been extended a formal offer for this position.
                </Text>

                <View className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                  <View className="flex-row items-center mb-2">
                    <Sparkles size={18} color="#059669" style={{ marginRight: 8 }} />
                    <Text className="text-emerald-950 font-bold text-sm">Offer Extended</Text>
                  </View>
                  <Text className="text-emerald-900 text-xs mb-1">
                    Compensation: <Text className="font-bold">{currentApp.offerDetails?.salary || '$15 - $18 / hr'}</Text>
                  </Text>
                  <Text className="text-emerald-800 text-xs mb-4">
                    Target Start Date: {currentApp.offerDetails?.startDate || 'Within 2 weeks'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      Alert.alert(
                        "Offer Accepted",
                        "Your placement offer has been confirmed! We are now launching your onboarding checklist.",
                        [
                          { text: "Open Onboarding Checklist", onPress: () => router.push('/candidate/onboarding') }
                        ]
                      );
                    }}
                    className="bg-emerald-700 py-3 px-4 rounded-xl items-center flex-row justify-center active:opacity-90"
                  >
                    <ClipboardList size={15} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold text-xs">Accept Offer & Start Onboarding</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {currentApp.status === 'Not Selected' && (
              <View className="space-y-4 mb-8">
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  {currentApp.feedbackReason || "Thank you for taking the time to interview with our team. While we have selected another candidate for this specific role, your profile remains active in the Bloom talent network for matching openings."}
                </Text>
              </View>
            )}

            {(currentApp.status === 'Pending Review' || currentApp.status === 'Screening') && (
              <View className="space-y-4 mb-8">
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  Your application has been received and is currently undergoing initial candidate assessment.
                </Text>
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  We verify experience, communication proficiency, and background requirements before advancing to hiring team review.
                </Text>
              </View>
            )}

            {/* Visual Stage Progress Tracker (Intro -> Match -> Interview -> Onboard) */}
            <View className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 mb-6">
              <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                4-Stage Hiring Journey
              </Text>

              {/* Step 1: Intro */}
              <View className="flex-row items-start mb-4">
                <View className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-500 items-center justify-center mr-3 mt-0.5">
                  <Check size={14} color="#059669" strokeWidth={3} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Step 1: Intro & Screening</Text>
                  <Text className="text-xs text-zinc-500">Credentials & preliminary English assessment passed ({currentApp.appliedDate})</Text>
                </View>
              </View>

              {/* Step 2: Match */}
              <View className="flex-row items-start mb-4">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  stageInfo.stepNumber >= 2 ? 'bg-emerald-100 border border-emerald-500' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {stageInfo.stepNumber >= 2 ? (
                    <Check size={14} color="#059669" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Step 2: Candidate Match</Text>
                  <Text className="text-xs text-zinc-500">
                    {stageInfo.stepNumber >= 2 ? 'Shortlisted with client partner hiring team' : 'Matching in progress'}
                  </Text>
                </View>
              </View>

              {/* Step 3: Interview */}
              <View className="flex-row items-start mb-4">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  stageInfo.stepNumber >= 3 ? 'bg-purple-100 border border-purple-600' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {stageInfo.stepNumber >= 3 ? (
                    <Check size={14} color="#7c3aed" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Step 3: Client Panel Interview</Text>
                  <Text className="text-xs text-zinc-500">
                    {stageInfo.stepNumber >= 3 ? 'Live interview with hiring team completed or scheduled' : 'Awaiting finalist interview invitation'}
                  </Text>
                </View>
              </View>

              {/* Step 4: Onboard */}
              <View className="flex-row items-start">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  stageInfo.stepNumber >= 4 ? 'bg-emerald-600 border border-emerald-600' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {stageInfo.stepNumber >= 4 ? (
                    <Check size={14} color="white" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Step 4: Onboard & Placement</Text>
                  <Text className="text-xs text-zinc-500">
                    {stageInfo.stepNumber >= 4 ? 'Offer accepted — contracts, equipment, and channel onboarding active' : 'Final placement & welcome kickoff'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Attached Resume Card */}
            <View className="bg-white border border-zinc-200 rounded-3xl p-5 mb-8 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Submitted Documents
                </Text>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Text className="text-[10px] font-bold text-emerald-800">Verified</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setResumeModalVisible(true)}
                className="flex-row items-center justify-between bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200"
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3 border border-red-200">
                    <FileText size={20} color="#dc2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-bold text-xs" numberOfLines={1}>
                      {currentApp.resumeName || 'victor_resume_2026.pdf'}
                    </Text>
                    <Text className="text-zinc-500 text-[10px]">
                      {currentApp.resumeSize || '1.4 MB'} • Uploaded {currentApp.appliedDate}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Eye size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Text className="text-emerald-700 font-bold text-xs">Preview</Text>
                </View>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <View className="px-6 py-12 items-center justify-center">
            <FileText size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <Text className="text-slate-900 font-bold text-base">No active applications</Text>
            <Text className="text-zinc-400 text-xs text-center mt-1">
              Apply to roles in the Find Jobs tab to track your status here.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Resume Preview Modal */}
      <Modal
        visible={resumeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setResumeModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-white rounded-t-3xl p-6 border-t border-zinc-200 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <FileText size={20} color="#dc2626" style={{ marginRight: 8 }} />
                <Text className="text-slate-900 font-bold text-base">Resume Preview</Text>
              </View>
              <TouchableOpacity onPress={() => setResumeModalVisible(false)} className="p-1">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 mb-5">
              <Text className="text-slate-900 font-extrabold text-base mb-1">
                {currentApp?.candidateName || 'Victor Taiwo'}
              </Text>
              <Text className="text-emerald-700 font-bold text-xs mb-3">
                {currentApp?.jobTitle || 'Customer Support Specialist'}
              </Text>
              
              <Text className="text-zinc-600 text-xs leading-relaxed mb-3">
                • Vetted talent network member with C1 Fluent English certification.
              </Text>
              <Text className="text-zinc-600 text-xs leading-relaxed mb-3">
                • 4+ years of proven remote customer operations, ticketing systems (Zendesk, Intercom), and client communication.
              </Text>
              <Text className="text-zinc-600 text-xs leading-relaxed">
                • Workstation hardware, fiber internet speed, and power backup verified by HireBloom onboarding team.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert("Resume Download", "Downloading resume to device storage...");
                  setResumeModalVisible(false);
                }}
                className="flex-1 bg-slate-900 py-3.5 rounded-xl flex-row items-center justify-center active:opacity-90"
              >
                <Download size={16} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-xs">Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setResumeModalVisible(false)}
                className="px-5 py-3.5 rounded-xl border border-zinc-300 bg-white items-center justify-center"
              >
                <Text className="text-slate-700 font-bold text-xs">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Official Email Inbox Modal */}
      <EmailInboxModal
        visible={emailModalVisible}
        onClose={() => {
          setEmailModalVisible(false);
          loadApplications();
        }}
        userEmail={currentUser?.email || currentApp?.candidateEmail || 'victor@hirebloom.com'}
      />
    </SafeAreaView>
  );
}
