// @ts-nocheck
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Building2, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 items-center justify-center">
        <View className="w-16 h-16 bg-blue-900 rounded-2xl items-center justify-center mb-6 shadow-lg shadow-blue-900/30">
          <Text className="text-white font-bold text-3xl">h</Text>
        </View>
        <Text className="text-4xl font-bold text-slate-900 tracking-tight text-center mb-4">
          hirebloom
        </Text>
        <Text className="text-lg text-slate-500 text-center mb-12">
          The complete mobile recruitment platform for global talent.
        </Text>

        <View className="w-full space-y-4">
          <TouchableOpacity 
            onPress={() => router.push('/employer')}
            className="w-full bg-blue-900 py-4 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-900/20 active:opacity-80"
          >
            <Building2 color="white" size={24} className="mr-3" />
            <Text className="text-white font-bold text-lg">I'm an Employer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/candidate')}
            className="w-full bg-slate-50 border border-slate-200 py-4 rounded-xl flex-row items-center justify-center active:opacity-60 mb-8"
          >
            <Briefcase color="#0f172a" size={24} className="mr-3" />
            <Text className="text-slate-900 font-bold text-lg">I'm a Job Seeker</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center pt-6 border-t border-slate-100">
            <Text className="text-slate-500 font-medium">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-blue-600 font-bold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
