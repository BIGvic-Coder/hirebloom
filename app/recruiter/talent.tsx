import { View, Text, SafeAreaView } from 'react-native';

export default function RecruiterTalent() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
      <Text className="text-2xl font-bold text-slate-900">Talent Pool</Text>
      <Text className="text-slate-500 mt-2">Browse the pre-vetted candidates.</Text>
    </SafeAreaView>
  );
}
