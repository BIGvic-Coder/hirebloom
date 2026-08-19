import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { CheckCircle2, AlertCircle, ShieldAlert, Award, Star, Check } from 'lucide-react-native';

const mockAssessments = [
  {
    id: 1,
    name: 'Ana Vasquez',
    tests: [
      { name: 'US English Verbal Assessment', score: '96%', icon: Award, status: 'Passed' },
      { name: 'Hardware Setup & Camera Quality', score: '94%', icon: Star, status: 'Passed' },
      { name: 'Internet Speed & Power Backup', score: '95%', icon: CheckCircle2, status: 'Passed' },
    ],
  },
];

export default function RecruiterAssessments() {
  const [selectedCandidate, setSelectedCandidate] = useState(mockAssessments[0]);
  const [notes, setNotes] = useState('');
  const [approved, setApproved] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-extrabold text-forest mb-2">Vetting Desk</Text>
        <Text className="text-zinc-500 text-sm mb-6">Verify verbal English skills, equipment specs, and local backups.</Text>

        <View className="bg-white rounded-3xl border border-zinc-200/60 p-5 shadow-sm mb-6">
          <Text className="text-forest font-bold text-base mb-1">{selectedCandidate.name}</Text>
          <Text className="text-zinc-400 font-bold text-xs mb-4">BYU-Pathway Support Program</Text>

          {/* Tests List */}
          <View className="space-y-3 mb-6">
            {selectedCandidate.tests.map((test, index) => {
              const Icon = test.icon;
              return (
                <View key={index} className="flex-row items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200/60 rounded-2xl mb-2">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 rounded-lg bg-mint/15 items-center justify-center mr-3">
                      <Icon color="#113c2c" size={16} />
                    </View>
                    <Text className="text-forest font-semibold text-xs leading-tight flex-1">{test.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-forest font-extrabold text-xs">{test.score}</Text>
                    <Text className="text-emerald-600 font-extrabold text-[8px] uppercase mt-0.5">{test.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Form Grading Panel */}
          <View className="border-t border-zinc-100 pt-5">
            <Text className="text-forest font-bold text-xs uppercase tracking-wider mb-3">Add Quality Review Comments</Text>
            
            <TextInput
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              placeholder="Record pronunciation accents, connection ping responses, or camera framing notes..."
              placeholderTextColor="#94a3b8"
              className="w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4 text-xs font-semibold text-forest mb-4"
              textAlignVertical="top"
            />

            <View className="flex-row space-x-2">
              <TouchableOpacity 
                onPress={() => setApproved(!approved)}
                className={`flex-1 py-3.5 rounded-xl border flex-row justify-center items-center ${
                  approved ? 'bg-mintLight/40 border-mint' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <Check color={approved ? '#113c2c' : '#94a3b8'} size={16} style={{ marginRight: 6 }} />
                <Text className={`font-bold text-xs ${approved ? 'text-forest' : 'text-zinc-400'}`}>
                  Approve Vetting
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  setNotes('');
                  setApproved(false);
                }}
                className="bg-forest py-3.5 px-6 rounded-xl justify-center items-center active:opacity-90 shadow-sm"
              >
                <Text className="text-white font-bold text-xs">Save File</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security warning banner */}
        <View className="bg-forestDark rounded-3xl p-5 border border-white/5 mb-12 flex-row items-center">
          <View className="w-10 h-10 bg-mint/10 rounded-full items-center justify-center mr-4">
            <ShieldAlert color="#8ecfa9" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-xs mb-0.5">Strict KYC Screening</Text>
            <Text className="text-zinc-300 text-[10px] leading-normal">
              Any deviations in identity verification or speed thresholds must be flagged immediately for review.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
