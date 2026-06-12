import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, BrainCircuit, Target, ArrowRight, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AIMatching() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-10">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center">
            <ArrowRight color="white" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View className="flex-row items-center bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/30">
            <Sparkles color="#818cf8" size={14} className="mr-2" />
            <Text className="text-indigo-300 font-bold text-xs uppercase tracking-wider">Hirebloom AI</Text>
          </View>
        </View>

        <Text className="text-4xl font-bold text-white mb-2">AI Candidate Matching</Text>
        <Text className="text-slate-400 text-lg mb-8 leading-relaxed">
          Our intelligent engine analyzes skills, experience, and cultural fit to surface the perfect candidates for your open roles.
        </Text>

        {/* Action Cards */}
        <View className="space-y-4 mb-10">
          <TouchableOpacity className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl flex-row items-center">
            <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
              <BrainCircuit color="#3b82f6" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">Scan Talent Pool</Text>
              <Text className="text-slate-400 text-sm">Automatically rank all 1,204 candidates against your requirements.</Text>
            </View>
            <ArrowRight color="#64748b" size={20} />
          </TouchableOpacity>

          <TouchableOpacity className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl flex-row items-center">
            <View className="w-12 h-12 bg-emerald-500/20 rounded-xl items-center justify-center mr-4">
              <Target color="#10b981" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">Skill Gap Analysis</Text>
              <Text className="text-slate-400 text-sm">Identify missing competencies in your shortlisted candidates.</Text>
            </View>
            <ArrowRight color="#64748b" size={20} />
          </TouchableOpacity>
        </View>

        {/* AI Recommendations */}
        <Text className="text-xl font-bold text-white mb-4">Top AI Recommendations</Text>
        
        <View className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-12">
          <View className="flex-row items-start mb-4">
            <View className="w-14 h-14 bg-indigo-500 rounded-full items-center justify-center mr-4">
              <Text className="text-white font-bold text-xl">S</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <Text className="text-lg font-bold text-white mb-1">Sarah Jenkins</Text>
                <View className="bg-indigo-500 px-2 py-1 rounded flex-row items-center">
                  <Sparkles color="white" size={12} className="mr-1" />
                  <Text className="text-white font-bold text-xs">98% Match</Text>
                </View>
              </View>
              <Text className="text-blue-400 font-medium text-sm mb-2">Senior Frontend Engineer</Text>
            </View>
          </View>
          
          <Text className="text-slate-400 text-sm leading-relaxed mb-4">
            <Text className="font-bold text-slate-300">AI Note: </Text>
            Sarah's extensive React Native experience and previous leadership role perfectly aligns with your open Senior position. She exceeds the required years of experience by 20%.
          </Text>

          <TouchableOpacity className="w-full bg-indigo-500 py-3 rounded-xl flex-row items-center justify-center active:opacity-80">
            <UserCheck color="white" size={18} className="mr-2" />
            <Text className="text-white font-bold">Fast-Track to Interview</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
