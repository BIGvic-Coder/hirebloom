import { View, Text, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { Mail, Lock, User, ArrowRight, Building2, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16">
        <Text className="text-3xl font-bold text-slate-900 mb-2">Create Account</Text>
        <Text className="text-slate-500 mb-8">Join the Hirebloom ecosystem today.</Text>

        {/* Role Selection */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity 
            onPress={() => setRole('candidate')}
            className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center ${role === 'candidate' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}
          >
            <Briefcase color={role === 'candidate' ? '#1e3a8a' : '#94a3b8'} size={20} className="mr-2" />
            <Text className={`font-bold ${role === 'candidate' ? 'text-blue-900' : 'text-slate-500'}`}>Candidate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setRole('employer')}
            className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center ${role === 'employer' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}
          >
            <Building2 color={role === 'employer' ? '#1e3a8a' : '#94a3b8'} size={20} className="mr-2" />
            <Text className={`font-bold ${role === 'employer' ? 'text-blue-900' : 'text-slate-500'}`}>Employer</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4 mb-8">
          <View className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex-row items-center">
            <User color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder={role === 'employer' ? "Company Name" : "Full Name"}
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex-row items-center">
            <Mail color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder="Work Email" 
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex-row items-center">
            <Lock color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder="Create Password" 
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          className="w-full bg-blue-900 py-4 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-900/20 active:opacity-80 mb-6"
          onPress={() => router.push(role === 'employer' ? '/employer' : '/candidate')}
        >
          <Text className="text-white font-bold text-lg mr-2">Create Account</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>

        <View className="flex-row items-center justify-center">
          <Text className="text-slate-500 font-medium">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-blue-600 font-bold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
