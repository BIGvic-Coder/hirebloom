import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Search, MapPin, Building2, Clock, Bookmark, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const featuredJobs = [
  { id: 1, title: 'Senior React Developer', company: 'TechNova', location: 'Remote', salary: '$120k - $150k', tags: ['React', 'TypeScript'] },
  { id: 2, title: 'UX/UI Designer', company: 'DesignCo', location: 'New York', salary: '$90k - $120k', tags: ['Figma', 'UI'] },
  { id: 3, title: 'Node.js Engineer', company: 'Backend Inc', location: 'Remote', salary: '$110k - $140k', tags: ['Node', 'API'] },
];

export default function CandidateJobs() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-slate-500 font-medium text-sm mb-1">Hello, Alex</Text>
          <Text className="text-3xl font-bold text-slate-900">Find your next</Text>
          <Text className="text-3xl font-bold text-forest">dream job</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 py-4 shadow-sm mb-6">
          <Search color="#94a3b8" size={20} className="mr-3" />
          <TextInput 
            placeholder="Search roles, skills, or companies..." 
            className="flex-1 text-slate-900 font-medium"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* AI Call to Action */}
        <TouchableOpacity 
          onPress={() => router.push('/candidate/ai-matching')}
          className="w-full bg-forest p-5 rounded-2xl flex-row items-center justify-between mb-8 shadow-lg shadow-forest/20"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-mint/20 rounded-full items-center justify-center mr-3">
              <Sparkles color="#8ecfa9" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-0.5">Let Bloom find your perfect job</Text>
              <Text className="text-zinc-300 text-xs">Unlock personalized recommendations</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <Text className="text-lg font-bold text-slate-900 mb-4">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 max-h-12">
          {['All', 'Design', 'Engineering', 'Marketing', 'Product'].map((category, index) => (
            <TouchableOpacity 
              key={index} 
              className={`px-6 py-3 rounded-full mr-3 justify-center ${index === 0 ? 'bg-forest' : 'bg-white border border-slate-200'}`}
            >
              <Text className={`font-bold text-sm ${index === 0 ? 'text-white' : 'text-slate-600'}`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Jobs */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900">Featured Jobs</Text>
          <TouchableOpacity>
            <Text className="text-forest font-bold text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {featuredJobs.map((job) => (
            <TouchableOpacity key={job.id} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm active:opacity-80">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-mint/10 rounded-xl items-center justify-center mr-3 border border-mint/25">
                    <Building2 color="#113c2c" size={20} />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-slate-900 mb-1">{job.title}</Text>
                    <Text className="text-slate-500 font-medium text-sm">{job.company}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Bookmark color="#cbd5e1" size={24} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center mb-4">
                <View className="flex-row items-center mr-4">
                  <MapPin color="#64748b" size={14} className="mr-1" />
                  <Text className="text-slate-500 text-sm">{job.location}</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock color="#64748b" size={14} className="mr-1" />
                  <Text className="text-slate-500 text-sm">{job.salary}</Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                {job.tags.map((tag, i) => (
                  <View key={i} className="bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Text className="text-slate-600 font-medium text-xs">{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
