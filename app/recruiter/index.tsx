import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Users, FileCheck, CheckCircle, Search, Star, MoreVertical, ArrowRight, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import { ApplicationsService, JobApplication } from '@/services/applicationsService';

export default function RecruiterDashboard() {
  const router = useRouter() as any;
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const all = await ApplicationsService.getAllApplications();
      setApplications(all);
    } catch (e) {
      console.warn('Error loading recruiter dashboard data:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pendingApps = applications.filter(
    (a) => a.status === 'Pending Review' || a.status === 'Screening' || a.status === 'Pending Final Review'
  );

  const matchedCount = applications.filter((a) => a.status === 'Pending Final Review').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview Scheduled').length;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <HireBloomHeader portalTitle="hirebloom" portalBadge="Recruiter Hub" userInitials="SJ" />

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-inkMuted uppercase tracking-wider mb-1">
            Talent Operations
          </Text>
          <Text className="text-3xl font-extrabold text-ink font-serif">
            Reviewer Dashboard
          </Text>
          <Text className="text-xs text-inkMuted mt-1">
            Review incoming candidate resumes, write feedback & manage client matching.
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="w-[47%] bg-white p-4 rounded-3xl border border-border shadow-sm">
            <View className="w-10 h-10 bg-mintLight/50 rounded-2xl items-center justify-center mb-2 border border-mint/20">
              <Users color="#113c2c" size={20} />
            </View>
            <Text className="text-2xl font-bold text-forest mb-0.5">{applications.length}</Text>
            <Text className="text-inkMuted text-xs font-semibold">Total Applicants</Text>
          </View>

          <View className="w-[47%] bg-white p-4 rounded-3xl border border-border shadow-sm">
            <View className="w-10 h-10 bg-amber-100 rounded-2xl items-center justify-center mb-2 border border-amber-200">
              <FileCheck color="#d97706" size={20} />
            </View>
            <Text className="text-2xl font-bold text-amber-700 mb-0.5">{pendingApps.length}</Text>
            <Text className="text-inkMuted text-xs font-semibold">Pending Reviews</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/recruiter/talent')}
            className="w-full bg-forest border border-mint/20 p-5 rounded-3xl flex-row items-center justify-between shadow-sm active:opacity-90"
          >
            <View className="flex-1 pr-3">
              <View className="flex-row items-center mb-1">
                <Sparkles size={14} color="#8ecfa9" style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-base">Vetting & Review Desk</Text>
              </View>
              <Text className="text-mint font-medium text-xs">
                {matchedCount} matched to client requisitions • {interviewCount} in interviews
              </Text>
            </View>
            <ArrowRight color="#8ecfa9" size={22} />
          </TouchableOpacity>
        </View>

        {/* Action Required: Pending Reviews */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-bold text-ink">Action Required: New Submissions</Text>
          <TouchableOpacity onPress={() => router.push('/recruiter/talent')}>
            <Text className="text-forest font-bold text-xs">Open Review Desk</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-3xl border border-border shadow-sm p-2 mb-8">
          {pendingApps.length === 0 ? (
            <View className="p-6 items-center">
              <Text className="text-ink font-semibold text-xs">All applications reviewed</Text>
              <Text className="text-inkMuted text-[11px] mt-1">No pending reviews in queue.</Text>
            </View>
          ) : (
            pendingApps.slice(0, 5).map((candidate, i) => (
              <TouchableOpacity
                key={candidate.id}
                onPress={() => router.push('/recruiter/talent')}
                className={`flex-row items-center p-3 active:opacity-75 ${
                  i !== pendingApps.length - 1 ? 'border-b border-zinc-100' : ''
                }`}
              >
                <View className="w-11 h-11 bg-forest rounded-2xl items-center justify-center mr-3">
                  <Text className="text-white font-extrabold text-sm">
                    {candidate.candidateInitials || candidate.candidateName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 pr-2">
                  <Text className="font-bold text-slate-900 text-sm">{candidate.candidateName}</Text>
                  <Text className="text-zinc-500 text-xs">{candidate.jobTitle}</Text>
                  <Text className="text-[10px] text-emerald-800 font-medium">{candidate.company}</Text>
                </View>
                <View className="items-end">
                  <View className="bg-amber-50 px-2 py-0.5 rounded-md mb-1 border border-amber-200">
                    <Text className="text-amber-800 font-extrabold text-[9px] uppercase">
                      {candidate.status === 'Pending Final Review' ? 'Step 2: Match' : 'Step 1: Review'}
                    </Text>
                  </View>
                  <Text className="text-forest font-bold text-xs">Review &rarr;</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
