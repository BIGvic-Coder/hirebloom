import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, Users, TrendingUp, ChevronRight, Sparkles, ShieldCheck, DollarSign, Calendar, Crown, CheckCircle2, Award, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import { ApplicationsService, JobApplication } from '@/services/applicationsService';
import { JobsService } from '@/services/jobsService';

export default function EmployerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'employer' | 'ceo'>('employer');
  const [signedOfferId, setSignedOfferId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await ApplicationsService.getCurrentUser();
      if (user?.role === 'ceo') {
        setViewMode('ceo');
      }

      const apps = await ApplicationsService.getAllApplications();
      setApplications(apps);
    } catch (e) {
      console.warn('Error loading employer dashboard data:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSwitchMode = async (mode: 'employer' | 'ceo') => {
    setViewMode(mode);
    await ApplicationsService.elevateRoleTo(mode);
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
          "👑 Offer Approved & Extended!",
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
        portalBadge={viewMode === 'ceo' ? "👑 CEO Executive" : "Employer Portal"} 
        userInitials={viewMode === 'ceo' ? "CEO" : "TN"} 
      />

      <ScrollView 
        className="flex-1 px-5 pt-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Perspective Mode Switcher: Employer Workspace vs CEO Executive Suite */}
        <View className="flex-row bg-slate-200/70 p-1 rounded-2xl mb-5">
          <TouchableOpacity
            onPress={() => handleSwitchMode('employer')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
              viewMode === 'employer' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
          >
            <Briefcase size={14} color={viewMode === 'employer' ? '#113c2c' : '#64748b'} style={{ marginRight: 6 }} />
            <Text className={`font-bold text-xs ${viewMode === 'employer' ? 'text-forest' : 'text-slate-500'}`}>
              Employer Workspace
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSwitchMode('ceo')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
              viewMode === 'ceo' ? 'bg-forest shadow-sm' : 'bg-transparent'
            }`}
          >
            <Crown size={14} color={viewMode === 'ceo' ? '#8ecfa9' : '#64748b'} style={{ marginRight: 6 }} />
            <Text className={`font-bold text-xs ${viewMode === 'ceo' ? 'text-mint' : 'text-slate-500'}`}>
              👑 CEO Executive Suite
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================= VIEW A: CEO EXECUTIVE SUITE ======================= */}
        {viewMode === 'ceo' && (
          <View>
            {/* CEO Executive Identity Card */}
            <View className="flex-row justify-between items-center mb-5 bg-[#0d281e] p-5 rounded-3xl border border-mint/30 shadow-md">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Crown size={15} color="#8ecfa9" style={{ marginRight: 6 }} />
                  <Text className="text-mint font-extrabold text-[10px] uppercase tracking-widest">
                    Chief Executive Console
                  </Text>
                </View>
                <Text className="text-2xl font-extrabold text-white font-serif">Victor Taiwo</Text>
                <Text className="text-zinc-300 text-xs mt-0.5">App Owner & Founder • Full Authority</Text>
              </View>
              <View className="bg-mint/20 border border-mint/40 px-3 py-1.5 rounded-2xl items-center">
                <Text className="text-mint font-extrabold text-xs">👑 All Access</Text>
                <Text className="text-zinc-300 text-[9px]">Platform Admin</Text>
              </View>
            </View>

            {/* CEO Action Quick Row */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity 
                onPress={() => router.push('/employer/jobs')}
                className="flex-1 bg-forest py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
              >
                <Briefcase color="#8ecfa9" size={16} style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-xs">👑 Post CEO Requisition</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/employer/candidates')}
                className="flex-1 bg-white border border-border py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
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
                    className="flex-1 bg-indigo-50 border border-indigo-200 py-2 rounded-xl flex-row items-center justify-center active:opacity-80"
                  >
                    <Text className="text-indigo-800 font-bold text-xs">📹 Play Loom Pitch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => router.push('/employer/candidates')}
                    className="flex-1 bg-slate-100 border border-slate-200 py-2 rounded-xl flex-row items-center justify-center active:opacity-80"
                  >
                    <Text className="text-slate-700 font-bold text-xs">📄 Inspect Resume</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => handleCeoOfferSignOff(topMatchCandidate)}
                  disabled={signedOfferId === topMatchCandidate.id || topMatchCandidate.status === 'Offer Received'}
                  className={`w-full py-3.5 rounded-2xl items-center justify-center shadow-sm flex-row ${
                    signedOfferId === topMatchCandidate.id || topMatchCandidate.status === 'Offer Received'
                      ? 'bg-emerald-700'
                      : 'bg-forest active:opacity-90'
                  }`}
                >
                  <Crown size={15} color="#8ecfa9" style={{ marginRight: 6 }} />
                  <Text className="text-white font-extrabold text-xs tracking-wider">
                    {signedOfferId === topMatchCandidate.id || topMatchCandidate.status === 'Offer Received'
                      ? '✓ Executive Offer Extended ($15/hr flat rate)'
                      : '👑 Executive Sign-Off: Extend Employment Offer'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
                onPress={() => router.push('/employer/jobs')}
                className="flex-1 bg-forest py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
              >
                <Briefcase color="white" size={16} style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-xs">Post Requisition</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/employer/candidates')}
                className="flex-1 bg-white border border-border py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
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
                onPress={() => router.push('/employer/jobs')}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-mintLight/40 rounded-xl items-center justify-center mb-2">
                  <Briefcase color="#113C2C" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">4</Text>
                <Text className="text-inkMuted font-medium text-xs">Open Requisitions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/employer/candidates')}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-amber-50 rounded-xl items-center justify-center mb-2">
                  <Users color="#D97706" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">{pendingReviewCount || 18}</Text>
                <Text className="text-inkMuted font-medium text-xs">Awaiting Review</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/employer/candidates')}
                className="w-[48%] bg-white p-4 rounded-2xl border border-border shadow-sm active:opacity-85"
              >
                <View className="w-8 h-8 bg-purple-50 rounded-xl items-center justify-center mb-2">
                  <Calendar color="#7C3AED" size={16} />
                </View>
                <Text className="text-2xl font-bold text-ink mb-0.5">{scheduledCount || 2}</Text>
                <Text className="text-inkMuted font-medium text-xs">Interviews Scheduled</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/employer/candidates')}
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
          <TouchableOpacity onPress={() => router.push('/employer/candidates')}>
            <Text className="text-forest font-bold text-xs">View All Pipeline</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl border border-border shadow-sm mb-10 overflow-hidden">
          {applications.slice(0, 3).map((app, i) => (
            <TouchableOpacity 
              key={app.id} 
              onPress={() => router.push('/employer/candidates')}
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
    </SafeAreaView>
  );
}
