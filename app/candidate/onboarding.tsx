import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  FileText, 
  Wifi, 
  MessageSquare, 
  Calendar, 
  HelpCircle,
  Mail,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { OffersService, OfferItem } from '@/services/offersService';
import { ApplicationsService } from '@/services/applicationsService';

export default function CandidateOnboarding() {
  const router = useRouter() as any;
  const [offer, setOffer] = useState<OfferItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const user = await ApplicationsService.getCurrentUser();
      const offers = await OffersService.getOffers();
      const userEmail = user?.email?.toLowerCase().trim();
      const userName = user?.name?.toLowerCase().trim();

      const matchedOffer = offers.find(
        (o) =>
          (userEmail && o.candidateEmail && o.candidateEmail.toLowerCase().trim() === userEmail) ||
          (userName && o.candidateName && o.candidateName.toLowerCase().trim() === userName)
      );

      if (matchedOffer) {
        setOffer(matchedOffer);
      } else if (offers.length > 0) {
        setOffer(offers[0]);
      }
    } catch (e) {
      console.warn('Error loading onboarding:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOnboardingData();
    setRefreshing(false);
  };

  const handleToggleTask = async (taskId: string) => {
    if (!offer) return;
    await OffersService.toggleOnboardingTask(offer.id, taskId);
    await loadOnboardingData();
  };

  const completedCount = offer?.onboardingTasks.filter((t) => t.completed).length || 0;
  const totalCount = offer?.onboardingTasks.length || 4;
  const isAllComplete = completedCount === totalCount;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Navigation Header */}
      <View className="px-5 py-4 bg-white border-b border-border flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center active:opacity-70"
        >
          <ArrowLeft size={18} color="#17352D" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-sm font-bold text-ink">Placement Onboarding</Text>
          <Text className="text-[10px] text-inkMuted">Step 4 of Hiring Process</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/help')}
          className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center active:opacity-70"
        >
          <HelpCircle size={18} color="#17352D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-5 pt-6">
          {/* Placement Summary Card */}
          {offer && (
            <View className="bg-forest rounded-3xl p-5 mb-6 text-white shadow-md">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-semibold text-mintLight uppercase tracking-wider">
                    Confirmed Role Placement
                  </Text>
                  <Text className="text-xl font-bold text-white mt-0.5">
                    {offer.role}
                  </Text>
                  <Text className="text-xs font-medium text-zinc-300">
                    {offer.company}
                  </Text>
                </View>
                <View className="bg-mint px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-extrabold text-forest uppercase">
                    {offer.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-3 pt-3 border-t border-white/10 mt-3">
                <View className="flex-1">
                  <Text className="text-[9px] uppercase font-bold text-zinc-300">Rate</Text>
                  <Text className="text-sm font-extrabold text-white">{offer.salary}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[9px] uppercase font-bold text-zinc-300">Target Start</Text>
                  <Text className="text-sm font-extrabold text-mint">{offer.startDate}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[9px] uppercase font-bold text-zinc-300">Schedule</Text>
                  <Text className="text-xs font-bold text-white">US Hours</Text>
                </View>
              </View>
            </View>
          )}

          {/* Hire Bloom Model Explainer Banner */}
          <View className="bg-mintLight/30 border border-mint/40 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-1.5">
              <ShieldCheck size={16} color="#113C2C" style={{ marginRight: 6 }} />
              <Text className="text-xs font-bold text-forest">How Placement Works</Text>
            </View>
            <Text className="text-[11px] text-inkMuted leading-relaxed">
              HireBloom administers your direct contractor agreement, payroll distributions, and workstation compliance. Your hiring client provides daily workflow tools, Slack access, and project orientation.
            </Text>
          </View>

          {/* Tasks Progress Bar */}
          <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-sm font-bold text-ink">Onboarding Checklist</Text>
                <Text className="text-[11px] text-inkMuted">Complete requirements to launch your placement</Text>
              </View>
              <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <Text className="text-xs font-extrabold text-forest">
                  {completedCount} of {totalCount} completed
                </Text>
              </View>
            </View>

            <View className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden my-3">
              <View
                className="h-full bg-forest rounded-full"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </View>

            {/* Checklist items with clear Actor Badges */}
            <View className="space-y-3 mt-1">
              {offer?.onboardingTasks.map((task) => {
                const isCandidateTask = task.category === 'contracts' || task.category === 'hardware';
                return (
                  <TouchableOpacity
                    key={task.id}
                    onPress={() => handleToggleTask(task.id)}
                    activeOpacity={0.8}
                    className={`p-4 rounded-2xl border flex-row items-start transition-all ${
                      task.completed ? 'bg-mintLight/15 border-mint/30' : 'bg-canvas border-border'
                    }`}
                  >
                    <View className="mr-3 mt-0.5">
                      {task.completed ? (
                        <CheckCircle2 size={20} color="#059669" />
                      ) : (
                        <Circle size={20} color="#94A39B" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className={`px-2 py-0.5 rounded-full ${
                          isCandidateTask ? 'bg-emerald-100/80 border border-emerald-300' : 'bg-purple-100/80 border border-purple-300'
                        }`}>
                          <Text className={`text-[9px] font-extrabold uppercase ${
                            isCandidateTask ? 'text-emerald-900' : 'text-purple-900'
                          }`}>
                            {isCandidateTask ? 'Candidate Task' : 'HireBloom & Client Setup'}
                          </Text>
                        </View>
                        {task.completed && (
                          <Text className="text-[10px] font-bold text-forest">Verified</Text>
                        )}
                      </View>
                      <Text
                        className={`text-xs font-bold mb-0.5 ${
                          task.completed ? 'text-forest line-through opacity-85' : 'text-ink'
                        }`}
                      >
                        {task.title}
                      </Text>
                      <Text className="text-[11px] text-inkMuted leading-snug">
                        {task.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* What's Next: Placement Active & Day-One Launch Card */}
            {isAllComplete ? (
              <View className="mt-6 bg-emerald-50/90 border-2 border-emerald-500 rounded-3xl p-5 shadow-sm">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-xl bg-forest items-center justify-center mr-2.5">
                    <Award size={18} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-emerald-950 font-extrabold text-sm">
                      Placement Cleared • Ready for Day One!
                    </Text>
                    <Text className="text-emerald-800 text-[11px]">
                      All contract, hardware, and client workspace prerequisites are confirmed.
                    </Text>
                  </View>
                </View>

                {/* Dedicated Coordinator Section */}
                <View className="bg-white rounded-2xl p-3.5 my-3 border border-emerald-200">
                  <Text className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-2">
                    Dedicated Placement Coordinator
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 pr-2">
                      <View className="w-9 h-9 rounded-full bg-purple-700 items-center justify-center mr-2.5">
                        <Text className="text-white text-xs font-bold">SJ</Text>
                      </View>
                      <View>
                        <Text className="text-slate-900 font-bold text-xs">Sarah Jenkins</Text>
                        <Text className="text-zinc-500 text-[10px]">Senior Placement & Onboarding Specialist</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => Linking.openURL('mailto:sarah.jenkins@hirebloom.com?subject=Placement%20Kickoff%20Sync')}
                      className="bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-xl flex-row items-center"
                    >
                      <Mail size={12} color="#6b21a8" style={{ marginRight: 4 }} />
                      <Text className="text-purple-900 text-xs font-bold">Email</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* What Happens Next Summary */}
                <View className="bg-white/80 rounded-2xl p-3.5 mb-4 border border-emerald-100 space-y-2">
                  <Text className="text-[10px] text-forest font-extrabold uppercase tracking-wider">
                    Day-One Kickoff Schedule:
                  </Text>
                  <Text className="text-slate-700 text-xs leading-relaxed">
                    1. <Text className="font-bold text-slate-900">Slack & Email Access:</Text> Check your inbox for the client workspace invitation.
                  </Text>
                  <Text className="text-slate-700 text-xs leading-relaxed">
                    2. <Text className="font-bold text-slate-900">Orientation Sync:</Text> Your kickoff Google Meet calendar invite is scheduled for {offer?.startDate || 'Day One'}.
                  </Text>
                  <Text className="text-slate-700 text-xs leading-relaxed">
                    3. <Text className="font-bold text-slate-900">Payroll Setup:</Text> HireBloom will administer bi-weekly USD contractor direct deposits.
                  </Text>
                </View>

                {/* Primary Action Buttons */}
                <View className="space-y-2">
                  <TouchableOpacity
                    onPress={() => router.push('/candidate')}
                    className="w-full bg-forest py-3.5 rounded-xl items-center justify-center shadow-sm active:opacity-90 flex-row"
                  >
                    <Text className="text-white font-bold text-xs mr-1">Return to Talent Dashboard</Text>
                    <ChevronRight size={14} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Confirmed Placement Agreement",
                        `Role: ${offer?.role || 'Technical Specialist'}\nCompany: ${offer?.company || 'Partner Client'}\nRate: ${offer?.salary || '$15.00 / hr'}\nSchedule: Full-time (US Hours)\nStart Date: ${offer?.startDate || 'Within 2 weeks'}\nStatus: Active & Cleared\n\nHireBloom administers all international service agreements and payroll compliance.`
                      );
                    }}
                    className="w-full bg-white border border-emerald-300 py-3 rounded-xl items-center justify-center active:opacity-85"
                  >
                    <Text className="text-emerald-900 font-bold text-xs">View Placement Contract Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
