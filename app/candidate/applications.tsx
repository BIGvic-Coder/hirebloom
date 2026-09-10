import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, RefreshControl, Alert } from 'react-native';
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
  Video
} from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { ApplicationsService, JobApplication, ApplicationStatus } from '@/services/applicationsService';

// Official HireBloom Logo mark
const HireBloomLogo = () => (
  <View className="flex-row items-center">
    <View className="w-8 h-8 justify-center items-center mr-2">
      <Svg width="28" height="28" viewBox="0 0 50 50">
        <Path
          d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
          fill="none"
          stroke="#059669"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M 12 40 L 4 46"
          stroke="#059669"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <Path d="M 16 34 L 16 26" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="16" cy="20" r="3.5" fill="#059669" />
        
        <Path d="M 25 34 L 25 20" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="25" cy="14" r="3.5" fill="#059669" />

        <Path d="M 34 34 L 34 24" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="34" cy="18" r="3.5" fill="#059669" />
      </Svg>
    </View>
    <Text className="text-xl font-bold text-slate-900 tracking-tight">
      hire bloom
    </Text>
  </View>
);

export default function CandidateApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);

  const loadApplications = async () => {
    const apps = await ApplicationsService.getCandidateApplications();
    setApplications(apps);
    if (apps.length > 0 && !selectedApp) {
      setSelectedApp(apps[0]);
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
  const userInitials = currentApp?.candidateInitials || 'VT';

  // Determine stage progress number (1-5)
  const getProgressStageNumber = (status?: ApplicationStatus): number => {
    switch (status) {
      case 'Pending Review':
        return 1;
      case 'Screening':
        return 2;
      case 'Pending Final Review':
        return 3;
      case 'Interview Scheduled':
        return 4;
      case 'Offer Received':
        return 5;
      case 'Not Selected':
        return 3; // Closed
      default:
        return 3;
    }
  };

  const currentStage = getProgressStageNumber(currentApp?.status);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header Bar matching web portal: Logo on left, Avatar VT on right */}
      <View className="px-6 py-4 border-b border-zinc-100 flex-row justify-between items-center bg-white">
        <HireBloomLogo />
        
        {/* Candidate Avatar Circle matching VT from screenshot */}
        <View className="w-10 h-10 rounded-full bg-slate-950 items-center justify-center shadow-sm">
          <Text className="text-white font-bold text-sm tracking-wide">
            {userInitials}
          </Text>
        </View>
      </View>

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

            {/* Application Count indicator */}
            {applications.length > 1 && (
              <Text className="text-xs text-zinc-400">
                {activeAppIndex + 1} of {applications.length} applications
              </Text>
            )}
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
            
            {/* STATUS Subtitle & Large Title */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                STATUS
              </Text>
              
              <Text className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {currentApp.status}
              </Text>
              
              <Text className="text-sm font-semibold text-emerald-700 mt-1">
                {currentApp.jobTitle} • <Text className="text-zinc-500 font-normal">{currentApp.company}</Text>
              </Text>
            </View>

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
                    onPress={() => Alert.alert("Accept Offer", "Offer accepted! Our onboarding coordinator will reach out with contract paperwork.")}
                    className="bg-emerald-700 py-2.5 px-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-xs">Accept Offer & Onboard</Text>
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

            {currentApp.status === 'Pending Review' || currentApp.status === 'Screening' && (
              <View className="space-y-4 mb-8">
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  Your application has been received and is currently undergoing initial candidate assessment.
                </Text>
                <Text className="text-base text-slate-700 leading-relaxed font-normal">
                  We verify experience, communication proficiency, and background requirements before advancing to hiring team review.
                </Text>
              </View>
            )}

            {/* Visual Stage Progress Tracker */}
            <View className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 mb-6">
              <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Application Timeline
              </Text>

              {/* Step 1 */}
              <View className="flex-row items-start mb-4">
                <View className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-500 items-center justify-center mr-3 mt-0.5">
                  <Check size={14} color="#059669" strokeWidth={3} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Application Submitted</Text>
                  <Text className="text-xs text-zinc-500">Submitted on {currentApp.appliedDate}</Text>
                </View>
              </View>

              {/* Step 2 */}
              <View className="flex-row items-start mb-4">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  currentStage >= 2 ? 'bg-emerald-100 border border-emerald-500' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {currentStage >= 2 ? (
                    <Check size={14} color="#059669" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Initial Screening</Text>
                  <Text className="text-xs text-zinc-500">
                    {currentStage >= 2 ? 'Preliminary skills, English & workstation verified' : 'In queue for evaluation'}
                  </Text>
                </View>
              </View>

              {/* Step 3 */}
              <View className="flex-row items-start mb-4">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  currentStage >= 3 ? 'bg-slate-900 border border-slate-900' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {currentStage >= 3 ? (
                    <Check size={14} color="white" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${currentApp.status === 'Pending Final Review' ? 'text-forest' : 'text-slate-900'}`}>
                    Pending Final Review
                  </Text>
                  <Text className="text-xs text-zinc-500">Hiring team evaluation for opening match</Text>
                </View>
              </View>

              {/* Step 4 */}
              <View className="flex-row items-start mb-4">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  currentStage >= 4 ? 'bg-purple-100 border border-purple-600' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {currentStage >= 4 ? (
                    <Check size={14} color="#7c3aed" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Interview & Assessment</Text>
                  <Text className="text-xs text-zinc-500">
                    {currentStage >= 4 ? 'Live interview scheduled / completed' : 'Scheduled if advanced from final review'}
                  </Text>
                </View>
              </View>

              {/* Step 5 */}
              <View className="flex-row items-start">
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  currentStage >= 5 ? 'bg-emerald-600 border border-emerald-600' : 'bg-zinc-200 border border-zinc-300'
                }`}>
                  {currentStage >= 5 ? (
                    <Check size={14} color="white" strokeWidth={3} />
                  ) : (
                    <Clock size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Final Decision & Offer</Text>
                  <Text className="text-xs text-zinc-500">
                    {currentStage >= 5 ? 'Offer extended to candidate' : 'Placement notification'}
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
    </SafeAreaView>
  );
}
