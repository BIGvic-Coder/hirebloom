import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Search, Sparkles, MapPin, ShieldCheck, FileText, Check } from 'lucide-react-native';
import { ApplicationsService } from '@/services/applicationsService';

const initialTalent = [
  { 
    id: 'talent-1', 
    appId: 'app-hirebloom-1',
    name: 'Victor Taiwo', 
    country: 'Remote (US Hours)', 
    role: 'Customer Support Lead', 
    english: 'C1 Fluent', 
    score: '97%', 
    avatar: 'VT',
    resumeName: 'victor_resume_2026.pdf',
    resumeSize: '1.4 MB',
    stage: 'Pending Final Review'
  },
  { 
    id: 'talent-2', 
    appId: 'app-1',
    name: 'Ana Vasquez', 
    country: 'Bolivia', 
    role: 'Customer Support Specialist', 
    english: 'C1 Fluent', 
    score: '94%', 
    avatar: 'AV',
    resumeName: 'ana_vasquez_cv.pdf',
    resumeSize: '1.1 MB',
    stage: 'Screening'
  },
  { 
    id: 'talent-3', 
    appId: 'app-2',
    name: 'Carlos Gomez', 
    country: 'Colombia', 
    role: 'Graphic Designer', 
    english: 'C1 Advanced', 
    score: '90%', 
    avatar: 'CG',
    resumeName: 'carlos_design_resume.pdf',
    resumeSize: '2.4 MB',
    stage: 'Interview'
  },
  { 
    id: 'talent-4', 
    appId: 'app-3',
    name: 'Sofia Chen', 
    country: 'Peru', 
    role: 'QA Engineer', 
    english: 'C2 Proficient', 
    score: '95%', 
    avatar: 'SC',
    resumeName: 'sofia_qa_engineer.pdf',
    resumeSize: '920 KB',
    stage: 'Screening'
  },
];

export default function RecruiterTalent() {
  const [talent, setTalent] = useState(initialTalent);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Support' | 'Tech'>('All');

  const handleAdvanceToFinalReview = async (candidate: typeof initialTalent[0]) => {
    await ApplicationsService.advanceToFinalReview(
      candidate.appId,
      'Recruiter verified English fluency, workstation speed, and customer empathy. Recommended for final client selection.'
    );
    
    setTalent(prev => prev.map(t => t.id === candidate.id ? { ...t, stage: 'Pending Final Review' } : t));

    Alert.alert(
      "Candidate Advanced to Final Review",
      `${candidate.name} has been moved to "Pending Final Review". Their mobile talent portal status is now updated in real-time!`
    );
  };

  const filteredTalent = talent.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase()) || 
                          candidate.role.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'Support') return matchesSearch && candidate.role.includes('Support');
    if (filter === 'Tech') return matchesSearch && (candidate.role.includes('QA') || candidate.role.includes('Engineer'));
    return matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-5 pt-8">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-3xl font-extrabold text-forest">Talent Pool</Text>
          <View className="bg-mint/20 px-3 py-1 rounded-full border border-mint/40">
            <Text className="text-forest font-bold text-xs">{filteredTalent.length} Candidates</Text>
          </View>
        </View>
        <Text className="text-zinc-500 text-xs mb-5">Inspect resumes, verify qualifications & advance candidates to hiring managers.</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-zinc-200/60 rounded-2xl px-4 py-3 shadow-sm mb-4">
          <Search color="#94a3b8" size={18} style={{ marginRight: 10 }} />
          <TextInput 
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, role, or country..." 
            className="flex-1 text-forest text-sm font-medium"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Filters */}
        <View className="flex-row space-x-2 mb-4">
          {(['All', 'Support', 'Tech'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full border ${
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

        {/* Candidates List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredTalent.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl border border-zinc-200/60 items-center justify-center">
              <Text className="text-forest font-bold text-sm">No talent profiles match</Text>
              <Text className="text-zinc-400 text-xs mt-1 text-center">Refine your query or filters.</Text>
            </View>
          ) : (
            filteredTalent.map((candidate) => (
              <View
                key={candidate.id}
                className="bg-white rounded-3xl border border-zinc-200/60 p-4 mb-4 shadow-sm"
              >
                <View className="flex-row items-start mb-3">
                  <View className="w-13 h-13 bg-slate-950 rounded-2xl items-center justify-center mr-3 shadow-sm">
                    <Text className="text-white font-extrabold text-base">{candidate.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-base font-bold text-slate-900 mb-0.5">{candidate.name}</Text>
                      <View className="bg-mint/25 px-2 py-0.5 rounded border border-mint/45 flex-row items-center">
                        <Sparkles color="#113c2c" size={10} style={{ marginRight: 4 }} />
                        <Text className="text-forest font-extrabold text-[9px]">{candidate.score} Fit</Text>
                      </View>
                    </View>
                    <Text className="text-zinc-500 font-bold text-xs mb-1.5">{candidate.role}</Text>
                    <View className="flex-row items-center space-x-3">
                      <View className="flex-row items-center">
                        <MapPin color="#64748b" size={12} style={{ marginRight: 4 }} />
                        <Text className="text-zinc-400 text-[11px] font-semibold">{candidate.country}</Text>
                      </View>
                      <View className="flex-row items-center bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded-md">
                        <ShieldCheck color="#113c2c" size={10} style={{ marginRight: 4 }} />
                        <Text className="text-forest font-bold text-[9px]">{candidate.english}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Attached Resume */}
                <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1 pr-2">
                    <FileText size={15} color="#dc2626" style={{ marginRight: 6 }} />
                    <Text className="text-slate-800 font-semibold text-xs" numberOfLines={1}>
                      {candidate.resumeName}
                    </Text>
                    <Text className="text-zinc-400 text-[10px] ml-2">({candidate.resumeSize})</Text>
                  </View>
                  <View className="bg-emerald-100 px-2 py-0.5 rounded flex-row items-center">
                    <Check size={10} color="#059669" strokeWidth={3} style={{ marginRight: 3 }} />
                    <Text className="text-[9px] font-bold text-emerald-800">Verified</Text>
                  </View>
                </View>

                {/* Status & Decision Action */}
                <View className="border-t border-zinc-100 pt-3 flex-row items-center justify-between">
                  <View>
                    <Text className="text-[10px] text-zinc-400 uppercase font-bold">Current Stage</Text>
                    <Text className="text-xs font-bold text-forest">{candidate.stage}</Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleAdvanceToFinalReview(candidate)}
                    className="bg-forest px-4 py-2 rounded-xl flex-row items-center active:opacity-90 shadow-sm"
                  >
                    <Text className="text-white font-bold text-xs">Advance to Final Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
