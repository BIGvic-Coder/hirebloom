import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, Users, TrendingUp, ChevronRight, Sparkles, ShieldCheck, DollarSign, Calendar, CheckCircle2, Award, Zap } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import ExecutivePasscodeModal from '@/components/ui/ExecutivePasscodeModal';
import { ApplicationsService, JobApplication } from '@/services/applicationsService';
import { JobsService } from '@/services/jobsService';

export default function EmployerDashboard() {
  const router = useRouter() as any;
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'employer' | 'ceo'>('employer');
  const [signedOfferId, setSignedOfferId] = useState<string | null>(null);
  const [isPasscodeModalVisible, setIsPasscodeModalVisible] = useState(false);

  // Android Watchdog: Ensure pull-to-refresh spinner never stays stuck on screen
  useEffect(() => {
    if (refreshing) {
      const timer = setTimeout(() => {
        setRefreshing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [refreshing]);

  // Sync authentication and view mode on every screen focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const isAuth = await ApplicationsService.isCeoAuthenticated();
      const user = await ApplicationsService.getCurrentUser();
      if (isAuth || user?.role === 'ceo') {
        setViewMode('ceo');
      } else {
        setViewMode('employer');
      }

      const apps = await ApplicationsService.getAllApplications();
      setApplications(apps);
    } catch (e) {
      console.warn('Error loading employer dashboard data:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.race([
        loadDashboardData(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (e) {
      console.warn('Error during employer dashboard refresh:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSwitchMode = async (mode: 'employer' | 'ceo') => {
    // 1. Immediately toggle the active tab synchronously for zero UI latency
    setViewMode(mode);
    try {
      if (mode === 'ceo') {
        await ApplicationsService.setCeoAuthenticated(true);
      }
      await ApplicationsService.elevateRoleTo(mode);
    } catch (e) {
      console.warn('Error elevating perspective role:', e);
    }
  };

  const navigateTo = (path: string) => {
    try {
      router.navigate(path);
    } catch {
      router.push(path);
    }
  };

  const handleCeoOfferSignOff = async (app: JobApplication) => {
    try {
      const success = await ApplicationsService.makeOffer(app.id, {
        salary: '$15 - $16 / hr',
        startDate: 'Within 2 weeks',
        role: app.jobTitle
      }, 'Victor Taiwo (CEO)');

      if (success) {
        setSignedOfferId(app.id);
        await loadDashboardData();
        Alert.alert(
          "Offer Approved & Extended!",
          `Executive offer signed off for ${app.candidateName} as ${app.jobTitle}.\n\nAn official offer notification & contract notice has been dispatched to the candidate's mobile portal and email inbox!`
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign offer.");
    }
  };

  const pendingReviewCount = applications.filter((a) => a.status === 'Pending Review' || a.status === 'Pending Final Review').length;
  const scheduledCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const offerCount = applications.filter((a) => a.status === 'Offer Received').length;

  const topMatchCandidate = applications.find(a => a.status === 'Pending Final Review') || applications[0];

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Unified Professional Header */}
      <HireBloomHeader 
        portalTitle="hirebloom" 
        portalBadge={viewMode === 'ceo' ? "CEO Executive Suite" : "Employer Portal"} 
        userInitials={viewMode === 'ceo' ? "CEO" : "TN"} 
      />

      {/* Pinned Perspective Mode Switcher: Native Pressable with pure StyleSheet for 100% reliable Android touch dispatch */}
      <View style={styles.switcherContainer}>
        <View style={styles.switcherTrack}>
          <Pressable
            onPress={() => handleSwitchMode('employer')}
            hitSlop={10}
            style={({ pressed }) => [
              styles.tabBtn,
              viewMode === 'employer' ? styles.tabBtnEmployerActive : styles.tabBtnInactive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Briefcase size={15} color={viewMode === 'employer' ? '#113C2C' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={viewMode === 'employer' ? styles.tabTextActive : styles.tabTextInactive}>
              Employer Workspace
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSwitchMode('ceo')}
            hitSlop={10}
            style={({ pressed }) => [
              styles.tabBtn,
              viewMode === 'ceo' ? styles.tabBtnCeoActive : styles.tabBtnInactive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Award size={15} color={viewMode === 'ceo' ? '#A5B4FC' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={viewMode === 'ceo' ? styles.tabTextCeoActive : styles.tabTextInactive}>
              CEO Executive Suite
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 bg-canvas" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120, paddingHorizontal: 20 }}
      >

        {/* ======================= VIEW A: CEO EXECUTIVE SUITE ======================= */}
        {viewMode === 'ceo' && (
          <View>
            {/* CEO Executive Identity Card in Royal Slate & Indigo */}
            <View className="flex-row justify-between items-center mb-5 bg-slate-900 p-5 rounded-3xl border border-indigo-500/40 shadow-md">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Award size={15} color="#818cf8" style={{ marginRight: 6 }} />
                  <Text className="text-indigo-300 font-extrabold text-[10px] uppercase tracking-widest">
                    Chief Executive Console
                  </Text>
                </View>
                <Text className="text-2xl font-extrabold text-white font-serif">Victor Taiwo</Text>
                <Text className="text-indigo-200 text-xs mt-0.5">App Owner & Founder • Full Authority</Text>
              </View>
              <View className="bg-indigo-950/80 border border-indigo-500/50 px-3 py-1.5 rounded-2xl items-center">
                <Text className="text-indigo-200 font-extrabold text-xs">Executive Access</Text>
                <Text className="text-indigo-400 text-[9px]">Platform Admin</Text>
              </View>
            </View>

            {/* CEO Action Quick Row */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity 
                onPress={() => navigateTo('/employer/jobs')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                className="flex-1 bg-indigo-950 border border-indigo-800/80 py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm"
              >
                <Briefcase color="#a5b4fc" size={16} style={{ marginRight: 6 }} />
                <Text className="text-indigo-100 font-bold text-xs">Post Executive Requisition</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigateTo('/employer/candidates')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                className="flex-1 bg-white border border-border py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm"
              >
                <Users color="#113C2C" size={16} style={{ marginRight: 6 }} />
                <Text className="text-forest font-bold text-xs">Inspect Loom Pitches</Text>
              </TouchableOpacity>
            </View>

            {/* CEO Strategic Metrics (Capital Saved, Velocity, Retention) */}
            <Text className="text-sm font-bold text-ink mb-3">Executive Capital & Velocity Metrics</Text>
            <View className="bg-white border border-border rounded-3xl p-5 mb-6 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-inkMuted text-[10px] uppercase font-bold tracking-wider">Estimated Client Savings</Text>
                  <Text className="text-3xl font-extrabold text-forest font-serif mt-0.5">$24,800 / yr</Text>
                </View>
                <View className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <Text className="text-emerald-800 font-extrabold text-xs">vs Legacy Headhunters</Text>
                </View>
              </View>

              <View className="flex-row justify-between pt-3 border-t border-slate-100">
                <View>
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase">Time to Fill</Text>
                  <Text className="text-sm font-extrabold text-ink">5.2 Days</Text>
                  <Text className="text-emerald-600 text-[9px] font-semibold">88% Faster</Text>
                </View>
                <View>
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase">Headcount Velocity</Text>
                  <Text className="text-sm font-extrabold text-ink">+18% Monthly</Text>
                  <Text className="text-forest text-[9px] font-semibold">Scaling Fast</Text>
                </View>
                <View>
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase">1-Yr Retention</Text>
                  <Text className="text-sm font-extrabold text-forest">70% Target</Text>
                  <Text className="text-mint text-[9px] font-semibold">Verified</Text>
                </View>
              </View>
            </View>

            {/* CEO 1-Tap Offer Approval & Sign-Off Desk */}
            {topMatchCandidate && (
              <View className="bg-gradient-to-br bg-white border-2 border-forest rounded-3xl p-5 mb-6 shadow-md">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <Sparkles size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text className="text-forest font-extrabold text-xs uppercase tracking-wider">
                      CEO Final Offer Sign-Off Desk
                    </Text>
                  </View>
                  <View className="bg-mint/30 px-2.5 py-0.5 rounded-full border border-mint/50">
                    <Text className="text-forest font-bold text-[10px]">Top Matched Candidate</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mb-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-forest items-center justify-center mr-3 shadow-sm">
                      <Text className="text-white font-extrabold text-sm">{topMatchCandidate.candidateInitials || 'VT'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-extrabold text-sm leading-tight">{topMatchCandidate.candidateName}</Text>
                      <Text className="text-slate-500 text-xs">{topMatchCandidate.jobTitle}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-emerald-700 font-extrabold text-xs">97% Match</Text>
                    <Text className="text-slate-400 text-[9px]">{topMatchCandidate.status}</Text>
                  </View>
                </View>

                <View className="flex-row gap-2 mb-3">
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(topMatchCandidate.loomUrl || 'https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403')}
                    activeOpacity={0.7}
                    className="flex-1 bg-indigo-50 border border-indigo-200 py-2 rounded-xl flex-row items-center justify-center"
                  >
                    <Text className="text-indigo-800 font-bold text-xs">📹 Play Loom Pitch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => navigateTo('/employer/candidates')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    className="flex-1 bg-slate-100 border border-slate-200 py-2.5 rounded-xl flex-row items-center justify-center"
                  >
                    <Text className="text-slate-700 font-bold text-xs">📄 Inspect Resume</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => handleCeoOfferSignOff(topMatchCandidate)}
                  disabled={signedOfferId === topMatchCandidate.id || topMatchCandidate.status === 'Offer Received'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                  className={`w-full py-4 rounded-2xl items-center justify-center shadow-sm flex-row ${
                    signedOfferId === topMatchCandidate.id || topMatchCandidate.status === 'Offer Received'
                      ? 'bg-emerald-700'
                      : 'bg-forest'
                  }`}
                >
                  <Award size={16} color="#c7d2fe" style={{ marginRight: 6 }} />
                  <Text className="text-white font-extrabold text-xs tracking-wider">
                    {signedOfferId === topMatchCandidate.id || topMatchCandidate.status === 'Offer Received'
                      ? '✓ Executive Offer Extended ($15/hr flat rate)'
                      : 'Executive Sign-Off: Extend Employment Offer'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Talent Operations & Recruiter Team Section */}
            <View className="bg-white border border-border rounded-3xl p-5 mb-6 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <ShieldCheck size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Text className="text-forest font-bold text-xs uppercase tracking-wider">
                    Talent Operations & Recruiter Desk
                  </Text>
                </View>
                <View className="bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <Text className="text-emerald-900 text-[9px] font-extrabold">Active Team</Text>
                </View>
              </View>

              <Text className="text-zinc-500 text-xs leading-relaxed mb-4">
                Our recruitment specialists and vetting coordinators monitor incoming applications, verify verbal English, and schedule client panel interviews so the CEO and executives only need to sign off on final contract offers.
              </Text>

              {/* Team Members List */}
              <View className="space-y-2 mb-4">
                <View className="flex-row items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <View className="w-8 h-8 rounded-lg bg-purple-700 items-center justify-center mr-2.5">
                    <Text className="text-white text-xs font-bold">SJ</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 text-xs font-bold">Sarah Jenkins</Text>
                    <Text className="text-zinc-500 text-[10px]">Lead Vetting Specialist • C1 Proficiency & Resume Review</Text>
                  </View>
                </View>

                <View className="flex-row items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <View className="w-8 h-8 rounded-lg bg-emerald-700 items-center justify-center mr-2.5">
                    <Text className="text-white text-xs font-bold">DV</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 text-xs font-bold">David Vance</Text>
                    <Text className="text-zinc-500 text-[10px]">Placement Coordinator • Client Panel Interview Scheduling</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/recruiter/talent')}
                className="w-full bg-forest py-3 rounded-xl items-center justify-center flex-row active:opacity-90 shadow-sm"
              >
                <Text className="text-white font-bold text-xs mr-1">Open Recruiter Vetting Desk</Text>
                <ChevronRight size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ======================= VIEW B: EMPLOYER WORKSPACE ======================= */}
        {viewMode === 'employer' && (
          <View>
            {/* Company Title */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-inkMuted font-medium text-xs mb-0.5">Employer Workspace</Text>
                <Text className="text-2xl font-bold text-ink font-serif">TechNova Inc.</Text>
              </View>
              <View className="bg-mintLight/60 border border-mint/40 px-3 py-1 rounded-full">
                <Text className="text-forest font-bold text-xs">Verified Partner</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity 
                onPress={() => navigateTo('/employer/jobs')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                className="flex-1 bg-forest py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm"
              >
                <Briefcase color="white" size={16} style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-xs">Post Requisition</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigateTo('/employer/candidates')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                className="flex-1 bg-white border border-border py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm"
              >
                <Users color="#113C2C" size={16} style={{ marginRight: 6 }} />
                <Text className="text-forest font-bold text-xs">View Pipeline</Text>
              </TouchableOpacity>
            </View>

            {/* Verified Business Standard Metric Card (70% retention, $13/hr standard) */}
            <View className="w-full bg-forest p-5 rounded-3xl mb-6 shadow-md">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-mintLight font-bold text-xs uppercase tracking-wider">
                  Verified Hiring Standard
                </Text>
                <View className="bg-mint px-2 py-0.5 rounded-full">
                  <Text className="text-forest font-extrabold text-[9px]">OFFICIAL MODEL</Text>
                </View>
              </View>

              <View className="flex-row items-baseline mb-3">
                <Text className="text-4xl font-extrabold text-white mr-1 font-serif">70%</Text>
                <Text className="text-mint font-bold text-sm">First-Year Retention</Text>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-white/10">
                <View>
                  <Text className="text-[10px] text-zinc-300 font-bold uppercase">Starting Rate</Text>
                  <Text className="text-sm font-extrabold text-white">$13.00 / hour</Text>
                </View>
                <View>
                  <Text className="text-[10px] text-zinc-300 font-bold uppercase">Pre-Vetted Pool</Text>
                  <Text className="text-sm font-extrabold text-white">1,000+ Candidates</Text>
                </View>
                <View>
                  <Text className="text-[10px] text-zinc-300 font-bold uppercase">Screening Pass</Text>
                  <Text className="text-sm font-extrabold text-mint">~9% Approved</Text>
                </View>
              </View>
            </View>

            {/* Hiring Pipeline Stats Grid */}
            <Text className="text-sm font-bold text-ink mb-3">Pipeline Activity</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              <TouchableOpacity 
                onPress={() => navigateTo('/employer/jobs')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.8}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-mintLight/40 rounded-xl items-center justify-center mb-2">
                  <Briefcase color="#113C2C" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">4</Text>
                <Text className="text-inkMuted font-medium text-xs">Open Requisitions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigateTo('/employer/candidates')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.8}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-amber-50 rounded-xl items-center justify-center mb-2">
                  <Users color="#D97706" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">{pendingReviewCount || 18}</Text>
                <Text className="text-inkMuted font-medium text-xs">Awaiting Review</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigateTo('/employer/candidates')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.8}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-purple-50 rounded-xl items-center justify-center mb-2">
                  <Calendar color="#7C3AED" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">{scheduledCount || 2}</Text>
                <Text className="text-inkMuted font-medium text-xs">Interviews Scheduled</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigateTo('/employer/candidates')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.8}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-emerald-50 rounded-xl items-center justify-center mb-2">
                  <TrendingUp color="#059669" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">{offerCount || 1}</Text>
                <Text className="text-inkMuted font-medium text-xs">Active Offers</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Candidate Applicants with Loom Pitch indicator */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-bold text-ink">Recent Candidates & Loom Submissions</Text>
          <TouchableOpacity 
            onPress={() => navigateTo('/employer/candidates')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text className="text-forest font-bold text-xs">View All Pipeline</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl border border-border shadow-sm mb-10 overflow-hidden">
          {applications.slice(0, 3).map((app, i) => (
            <TouchableOpacity 
              key={app.id} 
              onPress={() => navigateTo('/employer/candidates')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.75}
              className={`flex-row items-center justify-between p-4 active:opacity-75 ${i !== 2 ? 'border-b border-border' : ''}`}
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-10 h-10 bg-canvas border border-border rounded-full items-center justify-center mr-3">
                  <Text className="text-forest font-bold text-sm">{app.candidateInitials || 'VT'}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-ink font-bold text-xs mb-0.5 mr-2">{app.candidateName}</Text>
                    {app.loomUrl && (
                      <View className="bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                        <Text className="text-indigo-800 text-[8px] font-bold">📹 Loom</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-inkMuted text-[11px]">{app.jobTitle}</Text>
                </View>
              </View>
              <View className="items-end">
                <View className="bg-canvas border border-border px-2 py-0.5 rounded-full mb-1">
                  <Text className="text-forest font-bold text-[9px]">{app.status}</Text>
                </View>
                <Text className="text-inkMuted text-[9px]">{app.appliedDate}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CEO Executive Passcode Modal */}
      {isPasscodeModalVisible && (
        <ExecutivePasscodeModal
          visible={isPasscodeModalVisible}
          onClose={() => setIsPasscodeModalVisible(false)}
          onSuccess={async () => {
            await ApplicationsService.setCeoAuthenticated(true);
            await ApplicationsService.elevateRoleTo('ceo');
            setViewMode('ceo');
            setIsPasscodeModalVisible(false);
          }}
          title="CEO Executive Suite"
          subtitle="Enter Master Key (2026) to unlock Owner Mode"
          targetRole="ceo"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  switcherContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FAF9F6',
    zIndex: 10,
  },
  switcherTrack: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 5,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnEmployerActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  tabBtnCeoActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#4338CA',
    borderWidth: 1,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabBtnInactive: {
    backgroundColor: 'transparent',
  },
  tabTextActive: {
    color: '#113C2C',
    fontWeight: '800',
    fontSize: 12,
  },
  tabTextCeoActive: {
    color: '#C7D2FE',
    fontWeight: '800',
    fontSize: 12,
  },
  tabTextInactive: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
});
