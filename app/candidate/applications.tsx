import { View, Text, SafeAreaView } from 'react-native';

export default function CandidateApplications() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
      <Text className="text-2xl font-bold text-slate-900">My Applications</Text>
      <Text className="text-slate-500 mt-2">Track the status of your job applications.</Text>
    </SafeAreaView>
  );
}
