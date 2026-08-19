import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Building2, Calendar, FileText, ChevronRight, CheckCircle2, Clock } from 'lucide-react-native';

const mockApplications = [
  {
    id: 1,
    role: 'Lead Support Specialist',
    company: 'InnovateX',
    status: 'Interview Scheduled',
    statusColor: '#d97706',
    statusBg: '#fef3c7',
    appliedDate: 'Aug 10, 2026',
    step: 'Live Client Panel Interview',
  },
  {
    id: 2,
    role: 'Customer Success Manager',
    company: 'DesignFlow',
    status: 'Offer Received',
    statusColor: '#059669',
    statusBg: '#d1fae5',
    appliedDate: 'Aug 04, 2026',
    step: 'Review Contract Offer',
  },
  {
    id: 3,
    role: 'Technical Support Executive',
    company: 'CloudCore Corp',
    status: 'Application Review',
    statusColor: '#1e3a8a',
    statusBg: '#dbeafe',
    appliedDate: 'Jul 28, 2026',
    step: 'Awaiting Recruiter Screening Feedback',
  },
];

export default function CandidateApplications() {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Offers'>('All');

  const filteredApps = mockApplications.filter((app) => {
    if (filter === 'Offers') return app.status === 'Offer Received';
    if (filter === 'Active') return app.status !== 'Offer Received';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-3xl font-extrabold text-forest mb-2">My Applications</Text>
        <Text className="text-zinc-500 text-sm mb-6">Track the status of your client applications.</Text>

        {/* Filter Tabs */}
        <View className="flex-row space-x-2 mb-6">
          {(['All', 'Active', 'Offers'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                className={`px-4 py-2.5 rounded-full border ${
                  isActive ? 'bg-forest border-forest' : 'bg-white border-zinc-200'
                }`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-forest'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Applications List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredApps.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl border border-zinc-200/60 items-center justify-center">
              <FileText color="#94a3b8" size={32} style={{ marginBottom: 12 }} />
              <Text className="text-forest font-bold text-sm">No applications found</Text>
              <Text className="text-zinc-400 text-xs text-center mt-1">Try changing your filters.</Text>
            </View>
          ) : (
            filteredApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-5 mb-4 active:opacity-90"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-10 h-10 bg-mint/10 rounded-xl items-center justify-center mr-3 border border-mint/25">
                      <Building2 color="#113c2c" size={18} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-forest leading-tight">{app.role}</Text>
                      <Text className="text-zinc-400 font-bold text-xs mt-0.5">{app.company}</Text>
                    </View>
                  </View>
                  <View
                    style={{ backgroundColor: app.statusBg }}
                    className="px-2.5 py-1 rounded-lg"
                  >
                    <Text style={{ color: app.statusColor }} className="text-[10px] font-extrabold">
                      {app.status}
                    </Text>
                  </View>
                </View>

                {/* Subinfo */}
                <View className="border-t border-zinc-100 pt-4 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Clock color="#94a3b8" size={12} style={{ marginRight: 6 }} />
                    <Text className="text-zinc-400 text-[11px] font-medium">Applied: {app.appliedDate}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-forest font-extrabold text-[11px] mr-1">Details</Text>
                    <ChevronRight color="#113c2c" size={12} />
                  </View>
                </View>

                {/* Current Next Step */}
                <View className="mt-3 bg-zinc-50 p-3 rounded-2xl flex-row items-center border border-zinc-100">
                  {app.status === 'Offer Received' ? (
                    <CheckCircle2 color="#059669" size={14} style={{ marginRight: 6 }} />
                  ) : (
                    <Calendar color="#d97706" size={14} style={{ marginRight: 6 }} />
                  )}
                  <Text className="text-zinc-500 text-[11px] font-semibold flex-1 leading-snug">
                    <Text className="font-bold text-forest">Next step: </Text>
                    {app.step}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
