import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Briefcase, Users, TrendingUp, ChevronRight, Sparkles, ShieldCheck, DollarSign, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import { ApplicationsService, JobApplication } from '@/services/applicationsService';
import { JobsService } from '@/services/jobsService';

export default function EmployerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
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

  const pendingReviewCount = applications.filter((a) => a.status === 'Pending Review' || a.status === 'Pending Final Review').length;
  const scheduledCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const offerCount = applications.filter((a) => a.status === 'Offer Received').length;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Unified Professional Header */}
      <HireBloomHeader portalTitle="hirebloom" portalBadge="Employer Portal" userInitials="TN" />

      <ScrollView 
        className="flex-1 px-5 pt-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
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

        {/* Recent Candidate Applicants */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-bold text-ink">Recent Candidates</Text>
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
                  <Text className="text-ink font-bold text-xs mb-0.5">{app.candidateName}</Text>
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
