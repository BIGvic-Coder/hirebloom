import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Settings, Edit2, FileText, Globe, Award, Briefcase, Plus, ChevronRight } from 'lucide-react-native';

export default function CandidateProfile() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-5 pt-8 pb-6 border-b border-slate-200">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-row items-center">
              <View className="w-20 h-20 bg-mint/25 rounded-full items-center justify-center border-4 border-white shadow-sm mr-4">
                <Text className="text-forest font-extrabold text-3xl">A</Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-slate-900 mb-1">Alex Morgan</Text>
                <Text className="text-slate-500 font-medium">Senior Support Specialist</Text>
                <Text className="text-slate-400 text-sm mt-1">La Paz, Bolivia • Remote</Text>
              </View>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
              <Settings color="#475569" size={20} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-4 mb-2">
            <View className="flex-1 bg-mint/20 py-3 rounded-xl border border-mint/40 items-center">
              <Text className="text-xl font-bold text-forest mb-0.5">8</Text>
              <Text className="text-forest/80 text-xs font-semibold">Applied</Text>
            </View>
            <View className="flex-1 bg-mint/10 py-3 rounded-xl border border-mint/20 items-center">
              <Text className="text-xl font-bold text-forest mb-0.5">3</Text>
              <Text className="text-forest/80 text-xs font-semibold">Interviews</Text>
            </View>
            <View className="flex-1 bg-mint/5 py-3 rounded-xl border border-mint/10 items-center">
              <Text className="text-xl font-bold text-forest mb-0.5">1</Text>
              <Text className="text-forest/80 text-xs font-semibold">Offers</Text>
            </View>
          </View>
        </View>

        {/* Experience Section */}
        <View className="px-5 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">Experience</Text>
            <TouchableOpacity className="w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
              <Plus color="#113c2c" size={18} />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <View className="flex-row items-start mb-4">
              <View className="w-12 h-12 bg-indigo-50 rounded-lg items-center justify-center mr-4">
                <Briefcase color="#4338ca" size={24} />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text className="text-lg font-bold text-slate-900">Frontend Engineer</Text>
                  <TouchableOpacity><Edit2 color="#94a3b8" size={16} /></TouchableOpacity>
                </View>
                <Text className="text-forest font-bold mb-1">Customer Support Center</Text>
                <Text className="text-zinc-400 font-medium mb-1">TechStart Inc.</Text>
                <Text className="text-slate-400 text-sm mb-2">Jan 2021 - Present • 3 yrs</Text>
                <Text className="text-slate-600 leading-relaxed text-sm">
                  Spearheaded the migration of a legacy dashboard to React, improving load times by 40%. Led a team of 3 junior developers.
                </Text>
              </View>
            </View>
            
            <View className="w-full h-[1px] bg-slate-100 my-2" />
            
            <TouchableOpacity className="flex-row items-center justify-center py-2">
              <Text className="text-slate-500 font-medium mr-1">View all experience</Text>
              <ChevronRight color="#64748b" size={16} />
            </TouchableOpacity>
          </View>

          {/* Skills Section */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">Top Skills</Text>
            <TouchableOpacity className="w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
              <Edit2 color="#113c2c" size={16} />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-8">
            {['React Native', 'TypeScript', 'Tailwind CSS', 'Node.js', 'GraphQL', 'Redux'].map((skill, index) => (
              <View key={index} className="bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <Text className="text-slate-700 font-medium">{skill}</Text>
              </View>
            ))}
          </View>

          {/* Documents */}
          <Text className="text-lg font-bold text-slate-900 mb-4">Documents & Links</Text>
          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 mb-12">
            <TouchableOpacity className="flex-row items-center p-3 border-b border-slate-100">
              <View className="w-10 h-10 bg-rose-50 rounded-lg items-center justify-center mr-3">
                <FileText color="#e11d48" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900">Alex_Morgan_Resume.pdf</Text>
                <Text className="text-slate-400 text-xs">Updated 2 days ago</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-3">
              <View className="w-10 h-10 bg-slate-100 rounded-lg items-center justify-center mr-3">
                <Globe color="#475569" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900">Personal Portfolio</Text>
                <Text className="text-forest text-xs">alexmorgan.dev</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
