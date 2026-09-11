import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CheckCircle2, AlertCircle, ShieldAlert, Award, Star, Check, ShieldCheck, Clock, XCircle } from 'lucide-react-native';
import HireBloomHeader from '@/components/ui/HireBloomHeader';
import { VettingService, SIX_LAYER_CHECKPOINTS, VettingCheckpoint } from '@/services/vettingService';

export default function RecruiterAssessments() {
  const [candidateName, setCandidateName] = useState('Victor Taiwo');
  const [candidateRole, setCandidateRole] = useState('Senior Customer Support Lead');
  const [checkpoints, setCheckpoints] = useState<VettingCheckpoint[]>(SIX_LAYER_CHECKPOINTS);
  const [reviewNotes, setReviewNotes] = useState('');
  const [overallApproved, setOverallApproved] = useState(true);

  const toggleCheckpointStatus = (id: string) => {
    setCheckpoints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextStatus = c.status === 'passed' ? 'in_review' : c.status === 'in_review' ? 'failed' : 'passed';
        return { ...c, status: nextStatus };
      })
    );
  };

  const handleSaveVetting = () => {
    Alert.alert(
      "Vetting Record Saved",
      `${candidateName}'s 6-layer vetting record has been updated and recorded in the audit trail. Status: ${overallApproved ? 'Approved (~9% Vetted Pool)' : 'Under Review'}.`
    );
  };

  const passedCount = checkpoints.filter((c) => c.status === 'passed').length;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Header */}
      <HireBloomHeader portalTitle="hirebloom" portalBadge="Vetting Desk" userInitials="RD" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Desk Title */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-inkMuted uppercase tracking-wider mb-1">
            Quality Assurance & Vetting
          </Text>
          <Text className="text-2xl font-bold text-ink font-serif">
            6-Layer Screening Desk
          </Text>
          <Text className="text-xs text-inkMuted mt-1">
            Only ~9% of reviewed applicants meet Hire Bloom placement standards
          </Text>
        </View>

        {/* Candidate Summary Card */}
        <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-12 h-12 rounded-2xl bg-mintLight/40 items-center justify-center mr-3 border border-mint/25">
                <Text className="text-forest font-extrabold text-base">VT</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{candidateName}</Text>
                <Text className="text-xs text-emerald-800 font-medium">{candidateRole}</Text>
              </View>
            </View>
            <View className="bg-mintLight/60 border border-mint/40 px-2.5 py-1 rounded-full">
              <Text className="text-forest font-extrabold text-[10px] uppercase">
                {passedCount}/6 Checks Passed
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-3 border-t border-border">
            <View>
              <Text className="text-[9px] uppercase font-bold text-inkMuted">English Proficiency</Text>
              <Text className="text-xs font-bold text-forest">C1 Fluent (Accredited)</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase font-bold text-inkMuted">Program Background</Text>
              <Text className="text-xs font-bold text-ink">BYU-Pathway Worldwide</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase font-bold text-inkMuted">Hardware</Text>
              <Text className="text-xs font-bold text-forest">Pass (Verified)</Text>
            </View>
          </View>
        </View>

        {/* 6-Layer Screening Checklist */}
        <Text className="text-sm font-bold text-ink mb-3">Configurable Vetting Layers</Text>
        <View className="space-y-3 mb-6">
          {checkpoints.map((cp, idx) => (
            <TouchableOpacity
              key={cp.id}
              onPress={() => toggleCheckpointStatus(cp.id)}
              className="bg-white rounded-2xl p-4 border border-border shadow-sm active:opacity-85"
            >
              <View className="flex-row justify-between items-start mb-1.5">
                <View className="flex-1 pr-2">
                  <Text className="text-[10px] font-bold text-forest uppercase tracking-wider">
                    {cp.category}
                  </Text>
                  <Text className="text-xs font-bold text-ink mt-0.5">{cp.name}</Text>
                </View>
                <View
                  className={`px-2 py-0.5 rounded-md border ${
                    cp.status === 'passed'
                      ? 'bg-emerald-50 border-emerald-300'
                      : cp.status === 'in_review'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <Text
                    className={`text-[9px] font-extrabold uppercase ${
                      cp.status === 'passed'
                        ? 'text-emerald-800'
                        : cp.status === 'in_review'
                        ? 'text-amber-800'
                        : 'text-red-800'
                    }`}
                  >
                    {cp.status}
                  </Text>
                </View>
              </View>

              <Text className="text-[11px] text-inkMuted leading-relaxed mb-2">
                {cp.description}
              </Text>

              {cp.notes ? (
                <View className="bg-canvas p-2.5 rounded-xl border border-border">
                  <Text className="text-[10px] text-inkMuted">
                    <Text className="font-bold text-ink">Verifier Note: </Text>
                    {cp.notes}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviewer Grading & Decision Box */}
        <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-6">
          <Text className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Vetting Desk Decision & Comments
          </Text>

          <TextInput
            multiline
            numberOfLines={3}
            value={reviewNotes}
            onChangeText={setReviewNotes}
            placeholder="Record notes on verbal pacing, camera framing, or backup battery runtime..."
            placeholderTextColor="#94A39B"
            textAlignVertical="top"
            className="w-full bg-canvas border border-border rounded-xl p-3.5 text-xs text-ink mb-4 min-h-[80px]"
          />

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setOverallApproved(!overallApproved)}
              className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center ${
                overallApproved ? 'bg-mintLight/50 border-mint' : 'bg-canvas border-border'
              }`}
            >
              <CheckCircle2 size={16} color={overallApproved ? '#113C2C' : '#94A39B'} style={{ marginRight: 6 }} />
              <Text className={`text-xs font-bold ${overallApproved ? 'text-forest' : 'text-inkMuted'}`}>
                {overallApproved ? 'Approved (~9% Pool)' : 'Hold in Review'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveVetting}
              className="bg-forest px-5 py-3 rounded-xl items-center justify-center active:opacity-90 shadow-sm"
            >
              <Text className="text-white text-xs font-bold">Save Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
