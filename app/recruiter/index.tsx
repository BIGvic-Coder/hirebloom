import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Users, FileCheck, CheckCircle, Search, Star, MoreVertical } from 'lucide-react-native';

const pendingReviews = [
  { id: 1, name: 'Jessica Taylor', role: 'UX Designer', score: 'Awaiting', status: 'Resume Review' },
  { id: 2, name: 'David Kim', role: 'Backend Developer', score: 'Awaiting', status: 'Tech Assessment' },
];

export default function RecruiterDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-slate-500 font-medium mb-1">Recruiter Portal</Text>
          <Text className="text-3xl font-bold text-slate-900">Dashboard</Text>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          <View className="w-[47%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mb-2">
              <Users color="#1e3a8a" size={20} />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mb-1">1,204</Text>
            <Text className="text-slate-500 text-xs font-medium">Talent Pool</Text>
          </View>
          <View className="w-[47%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mb-2">
              <FileCheck color="#d97706" size={20} />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mb-1">42</Text>
            <Text className="text-slate-500 text-xs font-medium">Pending Reviews</Text>
          </View>
          <View className="w-full bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex-row items-center justify-between">
            <View>
              <Text className="text-emerald-800 font-bold text-lg">Top 9% Vetted</Text>
              <Text className="text-emerald-600 font-medium text-sm mt-1">18 candidates approved this week</Text>
            </View>
            <CheckCircle color="#059669" size={32} />
          </View>
        </View>

        {/* Action Required */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900">Action Required</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 font-bold text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 mb-12">
          {pendingReviews.map((candidate, i) => (
            <TouchableOpacity 
              key={candidate.id} 
              className={`flex-row items-center p-3 ${i !== pendingReviews.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-3">
                <Text className="text-slate-600 font-bold text-lg">{candidate.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900">{candidate.name}</Text>
                <Text className="text-slate-500 text-xs">{candidate.role}</Text>
              </View>
              <View className="items-end">
                <View className="bg-amber-100 px-2 py-1 rounded mb-1">
                  <Text className="text-amber-700 font-bold text-[10px]">{candidate.status}</Text>
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
