import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const COMPANIES = ['Trove Brands', 'Check City', 'National Benefits', 'Pest Control', 'HVAC Pros'];

export default function TrustBadges() {
  return (
    <View className="py-10 bg-slate-50 border-y border-slate-100">
      <Text className="text-center text-slate-400 font-semibold text-xs tracking-widest uppercase mb-6">
        Trusted by industry leaders
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="w-full"
        contentContainerStyle={{ paddingHorizontal: 24, alignItems: 'center' }}
      >
        {COMPANIES.map((company, index) => (
          <View key={index} className="mx-4 opacity-50 grayscale">
            <Text className="text-xl font-bold text-slate-800 tracking-tight">{company}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
