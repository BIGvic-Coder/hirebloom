import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Sparkles, 
  ArrowRight, 
  Video, 
  Briefcase, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  ChevronRight,
  ClipboardList,
  Mail
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import WorkflowStepper from '@/components/ui/WorkflowStepper';
import EmailInboxModal from '@/components/ui/EmailInboxModal';
import { ApplicationsService, JobApplication, UserSession } from '@/services/applicationsService';
import { JobsService, JobItem } from '@/services/jobsService';
import { InterviewsService, InterviewItem } from '@/services/interviewsService';
import { WorkflowService, PublicStageInfo } from '@/services/workflowService';
import { EmailService } from '@/services/emailService';

export default function CandidateHome() {
  const router = useRouter() as any;
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);
  const [stageInfo, setStageInfo] = useState<PublicStageInfo | null>(null);
  const [upcomingInterview, setUpcomingInterview] = useState<InterviewItem | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<JobItem[]>([]);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const user = await ApplicationsService.getCurrentUser();
      setCurrentUser(user);

      // Load unread emails
      const emailCount = await EmailService.getUnreadCount(user?.email || 'victor@hirebloom.com');
      setUnreadEmailsCount(emailCount);

      // Load applications
      const apps = await ApplicationsService.getCandidateApplications(user?.uid || user?.email);
      if (apps.length > 0) {
        const top = apps[0];
        setActiveApp(top);
        setStageInfo(WorkflowService.getPublicStageInfo(top.status));
      } else {
        setActiveApp(null);
        setStageInfo(null);
      }

      // Load upcoming interview
      const interviews = await InterviewsService.getInterviews();
      const scheduled = interviews.find((i) => i.status === 'Scheduled');
      if (scheduled) {
        setUpcomingInterview(scheduled);
      }

      // Load curated jobs
      const jobs = await JobsService.getJobs();
      setRecommendedJobs(jobs.slice(0, 3));
    } catch (e) {
      console.warn('Error loading candidate home data:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const displayName = currentUser?.name || 'Victor Taiwo';
  const displayInitials = currentUser?.initials || 'VT';

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Unified Professional Header */}
      <HireBloomHeader
        portalTitle="hirebloom"
        portalBadge="Talent Portal"
        userInitials={displayInitials}
        userEmail={currentUser?.email}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-5 pt-6">
          {/* Candidate Greeting */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-inkMuted uppercase tracking-wider mb-1">
              Welcome Back
            </Text>
            <Text className="text-2xl font-bold text-ink font-serif">
              {displayName}
            </Text>
            <View className="flex-row items-center mt-1.5 space-x-2">
              <View className="flex-row items-center bg-mintLight/60 px-2.5 py-0.5 rounded-full border border-mint/40">
                <ShieldCheck size={12} color="#113C2C" style={{ marginRight: 4 }} />
                <Text className="text-[10px] font-bold text-forest">C1 Fluent • Vetted ~9% Pool</Text>
              </View>
              <View className="flex-row items-center bg-white px-2 py-0.5 rounded-full border border-border">
                <Text className="text-[10px] text-inkMuted font-semibold">Remote US Hours</Text>
              </View>
            </View>
          </View>

          {/* Hero Card: Current Application Workflow State */}
          {activeApp && stageInfo && (
            <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-6">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-[10px] font-bold text-inkMuted uppercase tracking-wider">
                    Active Application
                  </Text>
                  <Text className="text-base font-bold text-ink mt-0.5">
                    {activeApp.jobTitle}
                  </Text>
                  <Text className="text-xs font-semibold text-emerald-800">
                    {activeApp.company}
                  </Text>
                </View>
                <View
                  style={{ backgroundColor: stageInfo.bg, borderColor: stageInfo.border }}
                  className="px-2.5 py-1 rounded-full border"
                >
                  <Text style={{ color: stageInfo.color }} className="text-[10px] font-bold uppercase tracking-wider">
                    {stageInfo.badgeLabel}
                  </Text>
                </View>
              </View>

              {/* Workflow Stepper: Intro -> Match -> Interview -> Onboard */}
              <View className="my-3">
                <WorkflowStepper currentStep={stageInfo.stepNumber} isDeclined={stageInfo.stage === 'Declined'} />
              </View>

              <Text className="text-xs text-inkMuted leading-relaxed mb-3">
                {stageInfo.description}
              </Text>

              {/* Reviewer Feedback Callout (if entered by Admin / Recruiter) */}
              {activeApp.feedbackReason ? (
                <View className="bg-emerald-50/80 border-l-4 border-emerald-600 p-3.5 rounded-r-2xl mb-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider">
                      Official Reviewer Feedback
                    </Text>
                    <Text className="text-[10px] text-emerald-700 font-medium">Verified</Text>
                  </View>
                  <Text className="text-xs text-slate-800 italic leading-relaxed">
                    "{activeApp.feedbackReason}"
                  </Text>
                </View>
              ) : null}

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => router.push('/candidate/applications')}
                className="w-full bg-forest py-3 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
              >
                <Text className="text-white text-xs font-bold mr-1.5">View Application Timeline</Text>
                <ChevronRight size={14} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Bloom Email Inbox Quick Access Card (matching Image 1 & 2) */}
          <TouchableOpacity
            onPress={() => setEmailModalVisible(true)}
            className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm mb-6 flex-row items-center justify-between active:opacity-85"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-11 h-11 rounded-2xl bg-[#121815] items-center justify-center mr-3 shadow-sm border border-emerald-900">
                <Mail size={18} color="#8ecfa9" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-slate-900 mr-2">Bloom Email Inbox</Text>
                  {unreadEmailsCount > 0 && (
                    <View className="bg-red-500 px-1.5 py-0.5 rounded-md">
                      <Text className="text-[9px] font-extrabold text-white">{unreadEmailsCount} New</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[11px] text-zinc-500" numberOfLines={1}>
                  Confirmation emails & reviewer feedback sent to {currentUser?.email || 'victor@hirebloom.com'}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#94a3b8" />
          </TouchableOpacity>

          {/* Upcoming Interview Card (if scheduled) */}
          {upcomingInterview && (
            <View className="bg-purple-50 border border-purple-200 rounded-3xl p-5 mb-6 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-purple-200/60 items-center justify-center mr-2.5">
                    <Video size={16} color="#6D28D9" />
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                      Upcoming Client Sync
                    </Text>
                    <Text className="text-sm font-bold text-purple-950">
                      {upcomingInterview.company}
                    </Text>
                  </View>
                </View>
                <View className="bg-purple-200 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-extrabold text-purple-900">CONFIRMED</Text>
                </View>
              </View>

              <Text className="text-xs text-purple-900 font-medium mb-1">
                📅 {upcomingInterview.date} at {upcomingInterview.time} ({upcomingInterview.timezone})
              </Text>
              <Text className="text-[11px] text-purple-800 mb-3">
                Host: {upcomingInterview.interviewer}
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/candidate/interviews')}
                className="bg-purple-700 py-2.5 rounded-xl items-center active:opacity-90"
              >
                <Text className="text-white text-xs font-bold">Open Interview Room</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Profile Readiness & BYU-Pathway Accreditation Badge */}
          <View className="bg-white rounded-3xl p-5 border border-border mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Award size={18} color="#113C2C" style={{ marginRight: 8 }} />
                <Text className="text-sm font-bold text-ink">Candidate Readiness</Text>
              </View>
              <Text className="text-xs font-extrabold text-forest">85% Complete</Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
              <View className="h-full bg-forest rounded-full" style={{ width: '85%' }} />
            </View>

            <View className="space-y-1.5">
              <View className="flex-row items-center">
                <CheckCircle2 size={13} color="#059669" style={{ marginRight: 6 }} />
                <Text className="text-xs text-inkMuted">C1 Verbal English & Fluency Assessment Verified</Text>
              </View>
              <View className="flex-row items-center">
                <CheckCircle2 size={13} color="#059669" style={{ marginRight: 6 }} />
                <Text className="text-xs text-inkMuted">50+ Mbps Fiber & Battery Backup Tested</Text>
              </View>
              <View className="flex-row items-center">
                <CheckCircle2 size={13} color="#059669" style={{ marginRight: 6 }} />
                <Text className="text-xs text-inkMuted">Standard CV (PDF) Attached to Profile</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/candidate/profile')}
              className="mt-4 pt-3 border-t border-border flex-row justify-between items-center"
            >
              <Text className="text-xs font-bold text-forest">Manage Profile & CV</Text>
              <ChevronRight size={14} color="#113C2C" />
            </TouchableOpacity>
          </View>

          {/* Onboarding Quick Link (if offer received or accepted) */}
          <TouchableOpacity
            onPress={() => router.push('/candidate/onboarding')}
            className="bg-mintLight/30 border border-mint/40 rounded-3xl p-4 flex-row items-center justify-between mb-6 active:opacity-80"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-mint/30 items-center justify-center mr-3">
                <ClipboardList size={18} color="#113C2C" />
              </View>
              <View>
                <Text className="text-xs font-bold text-ink">Onboarding Checklist</Text>
                <Text className="text-[10px] text-inkMuted">
                  Contracts, equipment confirmation, and kickoff sync
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#113C2C" />
          </TouchableOpacity>

          {/* Curated Opportunities Section ($13/hr+ starting) */}
          <View className="mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-base font-bold text-ink">Curated Roles</Text>
              <Text className="text-[11px] text-inkMuted">Starting at $13/hr • US Business Hours</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/candidate')}>
              <Text className="text-xs font-bold text-forest">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3 mb-8">
            {recommendedJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                onPress={() => router.push('/candidate')}
                className="bg-white rounded-2xl p-4 border border-border shadow-sm active:opacity-85"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-ink leading-snug">{job.title}</Text>
                    <Text className="text-xs font-semibold text-emerald-800">{job.company}</Text>
                  </View>
                  <View className="bg-canvas border border-border px-2 py-0.5 rounded-md">
                    <Text className="text-[10px] font-bold text-forest">{job.salary}</Text>
                  </View>
                </View>

                <View className="flex-row items-center space-x-3 mb-3">
                  <View className="flex-row items-center">
                    <Clock size={11} color="#66736D" style={{ marginRight: 4 }} />
                    <Text className="text-[10px] text-inkMuted">{job.timezone}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Building2 size={11} color="#66736D" style={{ marginRight: 4 }} />
                    <Text className="text-[10px] text-inkMuted">{job.type}</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-1.5">
                  {job.tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      <Text className="text-[9px] font-semibold text-slate-600">{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Official Email Inbox Modal (Screenshots 1 & 2) */}
      <EmailInboxModal
        visible={emailModalVisible}
        onClose={() => {
          setEmailModalVisible(false);
          loadHomeData();
        }}
        userEmail={currentUser?.email || 'victor@hirebloom.com'}
      />
    </SafeAreaView>
  );
}
