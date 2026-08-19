import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Users, FileCheck, CheckCircle, Search, Star, MoreVertical } from 'lucide-react-native';

const pendingReviews = [
  { id: 1, name: 'Jessica Taylor', role: 'UX Designer', score: 'Awaiting', status: 'Resume Review' },
  { id: 2, name: 'David Kim', role: 'Backend Developer', score: 'Awaiting', status: 'Tech Assessment' },
];

export default function RecruiterDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-slate-500 font-medium mb-1">Recruiter Portal</Text>
          <Text className="text-3xl font-bold text-slate-900">Dashboard</Text>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          <View className="w-[47%] bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
            <View className="w-10 h-10 bg-mint/20 rounded-xl items-center justify-center mb-2">
              <Users color="#113c2c" size={20} />
            </View>
            <Text className="text-2xl font-bold text-forest mb-1">1,204</Text>
            <Text className="text-zinc-500 text-xs font-semibold">Talent Pool</Text>
          </View>
          <View className="w-[47%] bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
            <View className="w-10 h-10 bg-mint/10 rounded-xl items-center justify-center mb-2">
              <FileCheck color="#113c2c" size={20} />
            </View>
            <Text className="text-2xl font-bold text-forest mb-1">42</Text>
            <Text className="text-zinc-500 text-xs font-semibold">Pending Reviews</Text>
          </View>
          <View className="w-full bg-forest border border-mint/20 p-5 rounded-2xl flex-row items-center justify-between shadow-sm">
            <View>
              <Text className="text-white font-bold text-lg">Top 9% Vetted</Text>
              <Text className="text-mint font-medium text-xs mt-1">18 candidates approved this week</Text>
            </View>
            <CheckCircle color="#8ecfa9" size={32} />
          </View>
        </View>

        {/* Action Required */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900">Action Required</Text>
          <TouchableOpacity>
            <Text className="text-forest font-bold text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 mb-12">
          {pendingReviews.map((candidate, i) => (
            <TouchableOpacity 
              key={candidate.id} 
              className={`flex-row items-center p-3 ${i !== pendingReviews.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="w-12 h-12 bg-mintLight rounded-full items-center justify-center mr-3 border border-mint/15">
                <Text className="text-forest font-bold text-lg">{candidate.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900">{candidate.name}</Text>
                <Text className="text-slate-500 text-xs">{candidate.role}</Text>
              </View>
              <View className="items-end">
                <View className="bg-mint px-2 py-1 rounded-lg mb-1 border border-mintLight">
                  <Text className="text-forest font-extrabold text-[10px]">{candidate.status}</Text>
                </View>
                <Text className="text-slate-400 text-xs">Review Now</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
