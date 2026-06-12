import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Plus, MapPin, Clock, Users, ChevronRight, MoreVertical } from 'lucide-react-native';

const activeJobs = [
  { id: 1, title: 'Senior Frontend Engineer', location: 'Remote (Global)', type: 'Full-time', applicants: 24, posted: '2 days ago', status: 'Active' },
  { id: 2, title: 'Product Designer', location: 'New York, NY', type: 'Full-time', applicants: 18, posted: '4 days ago', status: 'Active' },
  { id: 3, title: 'Backend Developer (Node.js)', location: 'Remote (Europe)', type: 'Contract', applicants: 5, posted: '1 week ago', status: 'Active' },
];

export default function EmployerJobs() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-slate-900">Jobs</Text>
          <TouchableOpacity className="w-10 h-10 bg-blue-900 rounded-full items-center justify-center shadow-lg shadow-blue-900/30">
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Filters/Tabs */}
        <View className="flex-row mb-6 bg-white p-1 rounded-xl border border-slate-200">
          <TouchableOpacity className="flex-1 bg-slate-100 py-2 rounded-lg items-center">
            <Text className="font-bold text-slate-900">Active (3)</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-2 rounded-lg items-center">
            <Text className="font-medium text-slate-500">Drafts (1)</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-2 rounded-lg items-center">
            <Text className="font-medium text-slate-500">Closed (12)</Text>
          </TouchableOpacity>
        </View>

        {/* Jobs List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {activeJobs.map((job) => (
            <TouchableOpacity key={job.id} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm active:opacity-80">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-bold text-slate-900 mb-1">{job.title}</Text>
                  <View className="flex-row items-center mb-2">
                    <MapPin color="#64748b" size={14} className="mr-1" />
                    <Text className="text-slate-500 text-sm mr-3">{job.location}</Text>
                    <Clock color="#64748b" size={14} className="mr-1" />
                    <Text className="text-slate-500 text-sm">{job.type}</Text>
                  </View>
                </View>
                <TouchableOpacity className="p-1">
                  <MoreVertical color="#94a3b8" size={20} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-100">
                <View className="flex-row items-center">
                  <Users color="#3b82f6" size={16} className="mr-2" />
                  <Text className="text-blue-600 font-bold">{job.applicants} Applicants</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-slate-400 text-xs mr-2">Posted {job.posted}</Text>
                  <ChevronRight color="#cbd5e1" size={16} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
