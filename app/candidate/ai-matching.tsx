import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, Briefcase, ArrowRight, Building2, MapPin, Clock, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const aiJobs = [
  { id: 1, title: 'Lead React Developer', company: 'InnovateX', location: 'Remote', salary: '$140k - $160k', matchReason: 'Your 3+ years at TechStart as a React lead makes you a perfect fit for their upcoming dashboard overhaul.', match: '96%' },
  { id: 2, title: 'Senior UI Engineer', company: 'DesignFlow', location: 'San Francisco, CA', salary: '$130k - $150k', matchReason: 'They are specifically looking for Tailwind CSS experts to build out their new design system.', match: '92%' },
];

export default function CandidateAIMatching() {
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
            <Text className="text-indigo-300 font-bold text-xs uppercase tracking-wider">AI Job Match</Text>
          </View>
        </View>

        <Text className="text-4xl font-bold text-white mb-2">Curated for You</Text>
        <Text className="text-slate-400 text-lg mb-8 leading-relaxed">
          Based on your skills, experience, and portfolio, our AI has found the highest probability matches for your next career move.
        </Text>

        {/* AI Jobs List */}
        <View className="space-y-6 mb-12">
          {aiJobs.map((job) => (
            <View key={job.id} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
              <View className="p-5 border-b border-slate-700/50">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-slate-700 rounded-xl items-center justify-center mr-3 border border-slate-600">
                      <Building2 color="#60a5fa" size={20} />
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-white mb-1">{job.title}</Text>
                      <Text className="text-blue-400 font-medium text-sm">{job.company}</Text>
                    </View>
                  </View>
                  <View className="bg-indigo-500 px-2 py-1 rounded flex-row items-center">
                    <Sparkles color="white" size={12} className="mr-1" />
                    <Text className="text-white font-bold text-xs">{job.match}</Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-1">
                  <View className="flex-row items-center mr-4">
                    <MapPin color="#94a3b8" size={14} className="mr-1" />
                    <Text className="text-slate-400 text-sm">{job.location}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock color="#94a3b8" size={14} className="mr-1" />
                    <Text className="text-slate-400 text-sm">{job.salary}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-slate-800/50 p-4 border-b border-slate-700/50">
                <Text className="text-slate-300 text-sm leading-relaxed">
                  <Text className="font-bold text-indigo-400">Why it's a match: </Text>
                  {job.matchReason}
                </Text>
              </View>

              <View className="p-4 flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-indigo-500 py-3 rounded-xl flex-row items-center justify-center active:opacity-80">
                  <Briefcase color="white" size={18} className="mr-2" />
                  <Text className="text-white font-bold">1-Click Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-12 bg-slate-700 py-3 rounded-xl items-center justify-center active:opacity-80">
                  <Bookmark color="#cbd5e1" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
