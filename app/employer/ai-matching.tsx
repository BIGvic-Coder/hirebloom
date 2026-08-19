import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, BrainCircuit, Target, ArrowRight, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AIMatching() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white border border-zinc-200 rounded-full items-center justify-center shadow-sm active:opacity-75">
            <ArrowRight color="#113c2c" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View className="flex-row items-center bg-mint/20 px-3.5 py-1.5 rounded-full border border-mint/40">
            <Sparkles color="#113c2c" size={14} style={{ marginRight: 6 }} />
            <Text className="text-forest font-bold text-xs uppercase tracking-wider">Hirebloom AI</Text>
          </View>
        </View>

        <Text className="text-3xl font-extrabold text-forest mb-2">AI Candidate Matching</Text>
        <Text className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Our intelligent engine analyzes candidate assessment transcripts, speech fluency, and tech backgrounds to match you with top talent.
        </Text>

        {/* Action Cards */}
        <View className="space-y-4 mb-8">
          <TouchableOpacity className="w-full bg-white border border-zinc-200 p-5 rounded-3xl flex-row items-center active:opacity-90 shadow-sm mb-4">
            <View className="w-12 h-12 bg-mint/15 rounded-2xl items-center justify-center mr-4">
              <BrainCircuit color="#113c2c" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-forest font-bold text-base mb-0.5">Scan Talent Pool</Text>
              <Text className="text-zinc-400 text-xs leading-normal">Rank all 1,204 pre-screened candidates against your specs.</Text>
            </View>
            <ArrowRight color="#113c2c" size={16} />
          </TouchableOpacity>

          <TouchableOpacity className="w-full bg-white border border-zinc-200 p-5 rounded-3xl flex-row items-center active:opacity-90 shadow-sm">
            <View className="w-12 h-12 bg-mint/10 rounded-2xl items-center justify-center mr-4">
              <Target color="#113c2c" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-forest font-bold text-base mb-0.5">Fluency Analysis</Text>
              <Text className="text-zinc-400 text-xs leading-normal">Compare speech and communication metrics for finalists.</Text>
            </View>
            <ArrowRight color="#113c2c" size={16} />
          </TouchableOpacity>
        </View>

        {/* AI Recommendations */}
        <Text className="text-lg font-bold text-forest mb-4">Top AI Recommendation</Text>
        
        <View className="bg-white rounded-3xl border border-zinc-200/60 p-5 mb-12 shadow-sm">
          <View className="flex-row items-start mb-4">
            <View className="w-14 h-14 bg-mintLight rounded-full items-center justify-center mr-4 border border-mint/20">
              <Text className="text-forest font-extrabold text-xl">S</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <Text className="text-base font-bold text-forest mb-0.5">Sarah Jenkins</Text>
                <View className="bg-mint px-2 py-0.5 rounded-lg flex-row items-center">
                  <Sparkles color="#113c2c" size={10} style={{ marginRight: 4 }} />
                  <Text className="text-forest font-extrabold text-[9px]">98%</Text>
                </View>
              </View>
              <Text className="text-zinc-400 font-bold text-xs">Senior Support Specialist</Text>
            </View>
          </View>
          
          <Text className="text-zinc-500 text-xs leading-relaxed mb-5">
            <Text className="font-extrabold text-forest">AI Analysis: </Text>
            Sarah exceeds the English fluency thresholds, scored 96% on tech setup stability, and has extensive experience managing Zendesk/Intercom for US operations.
          </Text>

          <TouchableOpacity className="w-full bg-forest py-3.5 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm">
            <UserCheck color="white" size={16} style={{ marginRight: 6 }} />
            <Text className="text-white font-bold text-xs">Fast-Track to Client Panel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
