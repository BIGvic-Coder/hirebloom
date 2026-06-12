import { View, Text, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16">
        <View className="w-16 h-16 bg-blue-900 rounded-2xl items-center justify-center mb-8 shadow-lg shadow-blue-900/30">
          <Text className="text-white font-bold text-3xl">h</Text>
        </View>
        
        <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome back</Text>
        <Text className="text-slate-500 mb-10">Sign in to continue to Hirebloom.</Text>

        <View className="space-y-4 mb-8">
          <View className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex-row items-center">
            <Mail color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder="Email address" 
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex-row items-center">
            <Lock color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder="Password" 
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity className="self-end mt-2">
            <Text className="text-blue-600 font-bold text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="w-full bg-blue-900 py-4 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-900/20 active:opacity-80 mb-6"
          onPress={() => router.push('/')}
        >
          <Text className="text-white font-bold text-lg mr-2">Sign In</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>

        <View className="flex-row items-center justify-center">
          <Text className="text-slate-500 font-medium">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-blue-600 font-bold">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
