import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Star, MessageSquare } from 'lucide-react-native';

const candidates = [
  { id: 1, name: 'Sarah Jenkins', role: 'Senior Frontend Engineer', stage: 'Interview', match: '98%', image: 'S' },
  { id: 2, name: 'Michael Chen', role: 'Senior Frontend Engineer', stage: 'Screening', match: '92%', image: 'M' },
  { id: 3, name: 'Elena Rodriguez', role: 'Product Designer', stage: 'Offer Sent', match: '95%', image: 'E' },
  { id: 4, name: 'David Kim', role: 'Backend Developer', stage: 'Applied', match: '88%', image: 'D' },
  { id: 5, name: 'Jessica Taylor', role: 'Product Designer', stage: 'Applied', match: '85%', image: 'J' },
];

export default function EmployerCandidates() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <Text className="text-3xl font-bold text-slate-900 mb-6">Pipeline</Text>

        {/* Search Bar */}
        <View className="flex-row mb-6 gap-3">
          <View className="flex-1 flex-row items-center bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <Search color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder="Search candidates..." 
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity className="w-12 bg-white rounded-xl border border-slate-200 items-center justify-center shadow-sm">
            <Filter color="#475569" size={20} />
          </TouchableOpacity>
        </View>

        {/* Pipeline Stages */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-10">
          {['All', 'Applied (2)', 'Screening (1)', 'Interview (1)', 'Offer (1)'].map((stage, index) => (
            <TouchableOpacity 
              key={index} 
              className={`px-4 py-2 rounded-full mr-2 justify-center ${index === 0 ? 'bg-blue-900' : 'bg-white border border-slate-200'}`}
            >
              <Text className={`font-bold text-sm ${index === 0 ? 'text-white' : 'text-slate-600'}`}>
                {stage}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Candidates List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {candidates.map((candidate) => (
            <TouchableOpacity key={candidate.id} className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm active:opacity-80">
              <View className="flex-row items-start">
                <View className="w-14 h-14 bg-indigo-100 rounded-full items-center justify-center mr-4 mt-1 border border-indigo-200">
                  <Text className="text-indigo-700 font-bold text-xl">{candidate.image}</Text>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-lg font-bold text-slate-900">{candidate.name}</Text>
                    <View className="bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      <Text className="text-emerald-600 font-bold text-xs">{candidate.match} Match</Text>
                    </View>
                  </View>
                  
                  <Text className="text-slate-500 font-medium mb-3">{candidate.role}</Text>
                  
                  <View className="flex-row justify-between items-center mt-1">
                    <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      <Text className="text-blue-700 font-semibold text-xs">{candidate.stage}</Text>
                    </View>
                    
                    <View className="flex-row gap-3">
                      <TouchableOpacity className="p-2 bg-slate-50 rounded-full border border-slate-100">
                        <MessageSquare color="#64748b" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity className="p-2 bg-slate-50 rounded-full border border-slate-100">
                        <Star color="#64748b" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
