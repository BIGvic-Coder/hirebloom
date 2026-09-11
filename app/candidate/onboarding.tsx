import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { ArrowLeft, CheckCircle2, Circle, ShieldCheck, FileText, Wifi, MessageSquare, Calendar, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { OffersService, OfferItem } from '@/services/offersService';

export default function CandidateOnboarding() {
  const router = useRouter() as any;
  const [offer, setOffer] = useState<OfferItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const offers = await OffersService.getOffers();
      if (offers.length > 0) {
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
              Hire Bloom administers your international contractor agreement, payroll distributions, and workstation compliance. Your hiring partner provides daily tools, Slack access, and team coordination.
            </Text>
          </View>

          {/* Tasks Progress Bar */}
          <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-bold text-ink">Onboarding Checklist</Text>
              <Text className="text-xs font-extrabold text-forest">
                {completedCount} of {totalCount} completed
              </Text>
            </View>

            <View className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-5">
              <View
                className="h-full bg-forest rounded-full"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </View>

            {/* Checklist items */}
            <View className="space-y-3">
              {offer?.onboardingTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => handleToggleTask(task.id)}
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
                    <Text
                      className={`text-xs font-bold mb-0.5 ${
                        task.completed ? 'text-forest line-through opacity-80' : 'text-ink'
                      }`}
                    >
                      {task.title}
                    </Text>
                    <Text className="text-[11px] text-inkMuted leading-snug">
                      {task.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {isAllComplete ? (
              <View className="mt-5 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl items-center">
                <Text className="text-emerald-900 font-bold text-xs mb-0.5">
                  🎉 Ready to Launch!
                </Text>
                <Text className="text-emerald-800 text-[10px] text-center">
                  All requirements confirmed. Your dedicated coordinator will send the day-one calendar invite.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
