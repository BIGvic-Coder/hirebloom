import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Briefcase, Users, UserPlus, TrendingUp, ChevronRight, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function EmployerDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-medium text-sm mb-1">Welcome back,</Text>
            <Text className="text-2xl font-bold text-slate-900">TechNova Inc.</Text>
          </View>
          <View className="w-12 h-12 bg-mintLight rounded-full items-center justify-center border-2 border-forest/10">
            <Text className="text-forest font-bold text-lg">T</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity className="flex-1 bg-forest py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-forest/30">
            <Briefcase color="white" size={18} style={{ marginRight: 6 }} />
            <Text className="text-white font-bold">Post Job</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/employer/ai-matching')}
            className="flex-1 bg-mint py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-mint/30"
          >
            <Sparkles color="#113c2c" size={18} style={{ marginRight: 6 }} />
            <Text className="text-forest font-bold">AI Match</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <Text className="text-lg font-bold text-slate-900 mb-4">Overview</Text>
        <View className="flex-row flex-wrap gap-4 mb-8">
          <View className="w-[47%] bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <View className="w-10 h-10 bg-mint/20 rounded-xl items-center justify-center mb-3">
              <Briefcase color="#113c2c" size={20} />
            </View>
            <Text className="text-3xl font-bold text-slate-900 mb-1">12</Text>
            <Text className="text-slate-500 font-medium text-sm">Active Jobs</Text>
          </View>

          <View className="w-[47%] bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mb-3">
              <Users color="#10b981" size={20} />
            </View>
            <Text className="text-3xl font-bold text-slate-900 mb-1">84</Text>
            <Text className="text-slate-500 font-medium text-sm">Total Candidates</Text>
          </View>

          <View className="w-full bg-gradient-to-r from-forestDark to-forest p-6 rounded-2xl shadow-lg shadow-forest/20">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-mintLight font-medium">Hiring Success Rate</Text>
              <TrendingUp color="#8ecfa9" size={20} />
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-4xl font-bold text-white mr-2">92</Text>
              <Text className="text-mint font-bold">%</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900">Recent Candidates</Text>
          <TouchableOpacity>
            <Text className="text-forest font-bold text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-12">
          {['Sarah Jenkins', 'Michael Chen', 'Elena Rodriguez'].map((name, i) => (
            <TouchableOpacity 
              key={i} 
              className={`flex-row items-center justify-between p-4 ${i !== 2 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-slate-600 font-bold text-lg">{name.charAt(0)}</Text>
                </View>
                <View>
                  <Text className="text-slate-900 font-bold mb-1">{name}</Text>
                  <Text className="text-slate-500 text-xs">Applied for Senior Frontend Eng.</Text>
                </View>
              </View>
              <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
