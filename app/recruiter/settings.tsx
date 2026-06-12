import { View, Text, SafeAreaView } from 'react-native';

export default function RecruiterSettings() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
      <Text className="text-2xl font-bold text-slate-900">Settings</Text>
      <Text className="text-slate-500 mt-2">Recruiter preferences and configuration.</Text>
    </SafeAreaView>
  );
}
