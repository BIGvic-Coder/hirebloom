import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, Briefcase, ArrowRight, Building2, MapPin, Clock, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const aiJobs = [
  { id: 1, title: 'Lead Support Specialist', company: 'InnovateX', location: 'Remote (US Hours)', salary: '$15 - $18 / hr', matchReason: 'Your 3+ years in customer service and experience with Zendesk perfectly align with their high-volume tier-2 support requirements.', match: '96%' },
  { id: 2, title: 'Customer Success Manager', company: 'DesignFlow', location: 'Remote (US Hours)', salary: '$14 - $16 / hr', matchReason: 'They are specifically seeking BYU-Pathway graduates with strong English skills to lead client onboarding.', match: '92%' },
];

export default function CandidateAIMatching() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white border border-zinc-200 rounded-full items-center justify-center active:opacity-70 shadow-sm">
            <ArrowRight color="#113c2c" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View className="flex-row items-center bg-mint/20 px-3.5 py-1.5 rounded-full border border-mint/40">
            <Sparkles color="#113c2c" size={14} style={{ marginRight: 6 }} />
            <Text className="text-forest font-bold text-xs uppercase tracking-wider">Bloom Match</Text>
          </View>
        </View>

        <Text className="text-3xl font-extrabold text-forest mb-2 leading-tight">Curated for You</Text>
        <Text className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Based on your Hirebloom assessment score, English level, and tech stack profile, we have matched you with these high-probability client positions.
        </Text>

        {/* AI Jobs List */}
        <View className="mb-12">
          {aiJobs.map((job) => (
            <View key={job.id} className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden mb-6">
              <View className="p-5 border-b border-zinc-100">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-12 h-12 bg-mint/10 rounded-xl items-center justify-center mr-3 border border-mint/25">
                      <Building2 color="#113c2c" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-forest mb-0.5 leading-tight">{job.title}</Text>
                      <Text className="text-zinc-400 font-bold text-xs">{job.company}</Text>
                    </View>
                  </View>
                  <View className="bg-mint px-2.5 py-1 rounded-lg flex-row items-center">
                    <Sparkles color="#113c2c" size={10} style={{ marginRight: 4 }} />
                    <Text className="text-forest font-extrabold text-[10px]">{job.match}</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-4">
                    <MapPin color="#64748b" size={12} style={{ marginRight: 4 }} />
                    <Text className="text-zinc-500 text-xs font-semibold">{job.location}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock color="#64748b" size={12} style={{ marginRight: 4 }} />
                    <Text className="text-zinc-500 text-xs font-semibold">{job.salary}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-zinc-50/50 p-4 border-b border-zinc-100">
                <Text className="text-zinc-600 text-xs leading-relaxed">
                  <Text className="font-bold text-forest">Why you matched: </Text>
                  {job.matchReason}
                </Text>
              </View>

              <View className="p-4 flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-forest py-3.5 rounded-xl flex-row items-center justify-center active:opacity-90">
                  <Briefcase color="white" size={16} style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-xs">1-Click Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-12 bg-zinc-100 py-3.5 rounded-xl items-center justify-center active:opacity-70 border border-zinc-200/50">
                  <Bookmark color="#113c2c" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
