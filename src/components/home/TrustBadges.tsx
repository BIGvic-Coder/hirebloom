import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const COMPANIES = ['Trove Brands', 'Check City', 'National Benefits', 'Pest Control', 'HVAC Pros'];

export default function TrustBadges() {
  return (
    <View className="py-8 bg-cream/70 border-y border-zinc-200/60">
      <Text className="text-center text-forest/50 font-bold text-[10px] tracking-widest uppercase mb-5">
        Trusted by industry leaders
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="w-full"
        contentContainerStyle={{ paddingHorizontal: 24, alignItems: 'center' }}
      >
        {COMPANIES.map((company, index) => (
          <View key={index} className="mx-4 opacity-70">
            <Text className="text-base font-extrabold text-forest/70 tracking-tight font-serif">{company}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
