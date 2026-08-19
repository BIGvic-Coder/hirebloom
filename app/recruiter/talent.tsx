import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Search, Filter, Sparkles, MapPin, CheckCircle, ShieldCheck } from 'lucide-react-native';

const mockTalent = [
  { id: 1, name: 'Ana Vasquez', country: 'Bolivia', role: 'Customer Support', english: 'C1 Fluent', score: '94%', avatar: 'AV' },
  { id: 2, name: 'Carlos Gomez', country: 'Colombia', role: 'Graphic Designer', english: 'C1 Advanced', score: '90%', avatar: 'CG' },
  { id: 3, name: 'Sofia Chen', country: 'Peru', role: 'QA Engineer', english: 'C2 Proficient', score: '95%', avatar: 'SC' },
  { id: 4, name: 'Mateo Silva', country: 'Brazil', role: 'Data Analyst', english: 'B2 Fluent', score: '88%', avatar: 'MS' },
];

export default function RecruiterTalent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Support' | 'Tech'>('All');

  const filteredTalent = mockTalent.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase()) || 
                          candidate.role.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'Support') return matchesSearch && candidate.role.includes('Support');
    if (filter === 'Tech') return matchesSearch && (candidate.role.includes('QA') || candidate.role.includes('Analyst'));
    return matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-3xl font-extrabold text-forest mb-2">Talent Pool</Text>
        <Text className="text-zinc-500 text-sm mb-6">Browse, review, and match Hirebloom-approved talent.</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-zinc-200/60 rounded-2xl px-4 py-3.5 shadow-sm mb-5">
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
        <View className="flex-row space-x-2 mb-6">
          {(['All', 'Support', 'Tech'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                className={`px-4 py-2 rounded-full border ${
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
                <View className="flex-row items-start mb-4">
                  <View className="w-14 h-14 bg-mintLight rounded-full items-center justify-center mr-4 border border-mint/20">
                    <Text className="text-forest font-extrabold text-base">{candidate.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-base font-bold text-forest mb-0.5">{candidate.name}</Text>
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

                {/* Actions */}
                <View className="border-t border-zinc-100 pt-3 flex-row space-x-2">
                  <TouchableOpacity className="flex-1 bg-forest py-2.5 rounded-xl justify-center items-center active:opacity-90">
                    <Text className="text-white font-bold text-xs">Verify Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-zinc-50 border border-zinc-200/60 py-2.5 rounded-xl justify-center items-center active:opacity-75">
                    <Text className="text-forest font-bold text-xs">Fast-Track Match</Text>
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
