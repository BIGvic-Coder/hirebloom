import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { Building2, Calendar, FileText, ChevronRight, CheckCircle2, Clock, X, AlertCircle, Sparkles, Check, ExternalLink } from 'lucide-react-native';
import { ApplicationsService, JobApplication, ApplicationStatus } from '@/services/applicationsService';

export default function CandidateApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Interview' | 'Offers' | 'Not Selected'>('All');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadApplications = async () => {
    const apps = await ApplicationsService.getCandidateApplications();
    setApplications(apps);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'Offers') return app.status === 'Offer Received';
    if (filter === 'Interview') return app.status === 'Interview Scheduled';
    if (filter === 'Not Selected') return app.status === 'Not Selected';
    if (filter === 'Active') return app.status !== 'Offer Received' && app.status !== 'Not Selected';
    return true;
  });

  const getStepProgressIndex = (status: ApplicationStatus): number => {
    switch (status) {
      case 'Pending Review':
        return 1;
      case 'Screening':
        return 2;
      case 'Interview Scheduled':
        return 3;
      case 'Offer Received':
        return 4;
      case 'Not Selected':
        return 4; // Final outcome
      default:
        return 1;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-5 pt-8">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-3xl font-extrabold text-forest">Application Tracker</Text>
          <View className="bg-mint/20 px-3 py-1 rounded-full border border-mint/40">
            <Text className="text-forest font-extrabold text-xs">{applications.length} Total</Text>
          </View>
        </View>
        <Text className="text-zinc-500 text-xs mb-6">Real-time status updates for all your submitted job applications.</Text>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-12">
          {(['All', 'Active', 'Interview', 'Offers', 'Not Selected'] as const).map((tab) => {
            const isActive = filter === tab;
            const count = applications.filter((app) => {
              if (tab === 'Offers') return app.status === 'Offer Received';
              if (tab === 'Interview') return app.status === 'Interview Scheduled';
              if (tab === 'Not Selected') return app.status === 'Not Selected';
              if (tab === 'Active') return app.status !== 'Offer Received' && app.status !== 'Not Selected';
              return true;
            }).length;

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                className={`px-4 py-2 rounded-full mr-2.5 border flex-row items-center ${
                  isActive ? 'bg-forest border-forest' : 'bg-white border-zinc-200'
                }`}
              >
                <Text className={`text-xs font-bold mr-1.5 ${isActive ? 'text-white' : 'text-forest'}`}>
                  {tab}
                </Text>
                <View className={`px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-zinc-100'}`}>
                  <Text className={`text-[10px] font-extrabold ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Applications List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredApps.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl border border-zinc-200/60 items-center justify-center mt-4">
              <FileText color="#94a3b8" size={36} style={{ marginBottom: 12 }} />
              <Text className="text-forest font-bold text-sm">No applications in this category</Text>
              <Text className="text-zinc-400 text-xs text-center mt-1">
                {filter === 'Not Selected' 
                  ? 'Great news! None of your applications have been declined.' 
                  : 'Check other tabs or apply to new open roles.'}
              </Text>
            </View>
          ) : (
            filteredApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() => setSelectedApp(app)}
                className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-5 mb-4 active:opacity-90"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-11 h-11 bg-mint/10 rounded-2xl items-center justify-center mr-3 border border-mint/25">
                      <Building2 color="#113c2c" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-forest leading-tight">{app.jobTitle}</Text>
                      <Text className="text-zinc-400 font-bold text-xs mt-0.5">{app.company}</Text>
                    </View>
                  </View>
                  <View
                    style={{ backgroundColor: app.statusBg }}
                    className="px-2.5 py-1 rounded-lg border border-black/5"
                  >
                    <Text style={{ color: app.statusColor }} className="text-[10px] font-extrabold uppercase">
                      {app.status}
                    </Text>
                  </View>
                </View>

                {/* Subinfo */}
                <View className="border-t border-zinc-100 pt-3.5 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Clock color="#94a3b8" size={13} style={{ marginRight: 6 }} />
                    <Text className="text-zinc-400 text-[11px] font-medium">Applied: {app.appliedDate}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-forest font-extrabold text-[11px] mr-1">Status Details</Text>
                    <ChevronRight color="#113c2c" size={13} />
                  </View>
                </View>

                {/* Current Next Step / Outcome Badge */}
                <View className={`mt-3 p-3 rounded-2xl flex-row items-center border ${
                  app.status === 'Not Selected' 
                    ? 'bg-rose-50/70 border-rose-200/60' 
                    : app.status === 'Offer Received'
                    ? 'bg-emerald-50/70 border-emerald-200/60'
                    : 'bg-zinc-50 border-zinc-100'
                }`}>
                  {app.status === 'Offer Received' ? (
                    <CheckCircle2 color="#059669" size={15} style={{ marginRight: 6 }} />
                  ) : app.status === 'Not Selected' ? (
                    <AlertCircle color="#dc2626" size={15} style={{ marginRight: 6 }} />
                  ) : (
                    <Calendar color="#d97706" size={15} style={{ marginRight: 6 }} />
                  )}
                  <Text className="text-zinc-600 text-[11px] font-semibold flex-1 leading-snug">
                    <Text className={`font-bold ${
                      app.status === 'Not Selected' 
                        ? 'text-red-700' 
                        : app.status === 'Offer Received' 
                        ? 'text-emerald-700' 
                        : 'text-forest'
                    }`}>
                      {app.status === 'Not Selected' ? 'Outcome: ' : 'Next step: '}
                    </Text>
                    {app.step}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Application Detail Tracking Modal */}
      <Modal
        visible={!!selectedApp}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedApp(null)}
      >
        <View className="flex-1 bg-black/75 justify-end">
          {selectedApp && (
            <View className="bg-white rounded-t-3xl p-6 border-t border-zinc-200 max-h-[90%]">
              {/* Modal Header */}
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center mb-1">
                    <View 
                      style={{ backgroundColor: selectedApp.statusBg }}
                      className="px-2.5 py-0.5 rounded-full mr-2"
                    >
                      <Text style={{ color: selectedApp.statusColor }} className="text-[10px] font-extrabold uppercase">
                        {selectedApp.status}
                      </Text>
                    </View>
                    <Text className="text-zinc-400 text-xs font-semibold">Applied {selectedApp.appliedDate}</Text>
                  </View>
                  <Text className="text-xl font-bold text-forest">{selectedApp.jobTitle}</Text>
                  <Text className="text-zinc-500 font-medium text-xs">{selectedApp.company}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedApp(null)}
                  className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center"
                >
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Status Timeline Stepper */}
              <View className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60 mb-6">
                <Text className="text-forest font-bold text-xs uppercase tracking-wider mb-4">Pipeline Stages</Text>
                
                {[
                  { step: 1, title: 'Application Submitted', desc: `Received on ${selectedApp.appliedDate}` },
                  { step: 2, title: 'Screening & Vetting', desc: 'Verbal English & tech setup checks' },
                  { step: 3, title: 'Client Interview', desc: 'Panel evaluation sync' },
                  { 
                    step: 4, 
                    title: selectedApp.status === 'Not Selected' ? 'Selection Completed' : 'Final Offer', 
                    desc: selectedApp.status === 'Not Selected' ? 'Another candidate chosen' : 'Contract & onboarding' 
                  },
                ].map((s, idx) => {
                  const currentProg = getStepProgressIndex(selectedApp.status);
                  const isComplete = currentProg >= s.step;
                  const isCurrent = currentProg === s.step;
                  const isRejectedEnd = selectedApp.status === 'Not Selected' && s.step === 4;

                  return (
                    <View key={s.step} className="flex-row items-start mb-3 last:mb-0">
                      <View className="items-center mr-3">
                        <View className={`w-7 h-7 rounded-full items-center justify-center ${
                          isRejectedEnd 
                            ? 'bg-red-500' 
                            : isComplete 
                            ? 'bg-forest' 
                            : 'bg-zinc-200'
                        }`}>
                          {isRejectedEnd ? (
                            <X size={14} color="white" />
                          ) : isComplete ? (
                            <Check size={14} color="white" />
                          ) : (
                            <Text className="text-zinc-500 text-[10px] font-bold">{s.step}</Text>
                          )}
                        </View>
                        {idx !== 3 && (
                          <View className={`w-0.5 h-6 my-1 ${isComplete && currentProg > s.step ? 'bg-forest' : 'bg-zinc-200'}`} />
                        )}
                      </View>
                      <View className="flex-1 pt-0.5">
                        <Text className={`text-xs font-bold ${
                          isRejectedEnd ? 'text-red-600' : isComplete ? 'text-forest' : 'text-zinc-400'
                        }`}>
                          {s.title}
                        </Text>
                        <Text className="text-zinc-400 text-[10px] leading-tight mt-0.5">{s.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Status Outcome Callouts */}
              {selectedApp.status === 'Not Selected' ? (
                <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <View className="flex-row items-center mb-1.5">
                    <AlertCircle size={16} color="#dc2626" style={{ marginRight: 6 }} />
                    <Text className="text-red-700 font-bold text-xs">Application Status: Not Chosen</Text>
                  </View>
                  <Text className="text-red-900/80 text-xs leading-relaxed mb-3">
                    {selectedApp.feedbackReason || 'We appreciate your interest in this role. The hiring team has decided to proceed with another finalist whose specific background was an exact match.'}
                  </Text>
                  <View className="bg-white/80 p-2.5 rounded-xl border border-red-100">
                    <Text className="text-forest text-[11px] font-semibold">
                      💡 Your BYU-Pathway accredited profile is kept active in the Hirebloom talent pool for new incoming client roles!
                    </Text>
                  </View>
                </View>
              ) : selectedApp.status === 'Offer Received' ? (
                <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                  <View className="flex-row items-center mb-1.5">
                    <Sparkles size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text className="text-emerald-800 font-bold text-xs">Congratulations! Offer Received</Text>
                  </View>
                  <Text className="text-emerald-950/80 text-xs leading-relaxed mb-3">
                    The client has completed evaluations and extended an offer. Please review your compensation details and start date with your Placement Coordinator.
                  </Text>
                  <TouchableOpacity className="bg-emerald-700 py-2.5 rounded-xl items-center flex-row justify-center active:opacity-90">
                    <Text className="text-white font-bold text-xs mr-2">Review Contract Offer</Text>
                    <ExternalLink size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-6">
                  <Text className="text-forest font-bold text-xs uppercase tracking-wider mb-1">Current Action</Text>
                  <Text className="text-zinc-600 text-xs leading-relaxed">{selectedApp.step}</Text>
                  {selectedApp.notes ? (
                    <Text className="text-zinc-400 text-[11px] mt-2 italic">Note: {selectedApp.notes}</Text>
                  ) : null}
                </View>
              )}

              <TouchableOpacity
                onPress={() => setSelectedApp(null)}
                className="w-full bg-forest py-3.5 rounded-xl items-center justify-center active:opacity-90"
              >
                <Text className="text-white font-bold text-xs">Close Tracker</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
