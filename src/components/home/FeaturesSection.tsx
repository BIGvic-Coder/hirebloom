import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
  {
    icon: 'flag-outline',
    title: 'US-owned and operated',
    description: 'We understand your business standards because we share them.',
  },
  {
    icon: 'school-outline',
    title: 'US-educated talent',
    description: 'Our people have strong English and soft skills because they’ve studied at US universities like BYU-Pathway.',
  },
  {
    icon: 'cash-outline',
    title: '$13/hour per team member',
    description: 'Flat, predictable pricing. No placement fees. No surprises.',
  },
];

export default function FeaturesSection() {
  return (
    <View className="px-6 py-16 bg-white">
      <Text className="text-3xl font-bold text-slate-900 text-center mb-12">
        Low risk. High trust.{'\n'}
        <Text className="text-blue-600">Real results.</Text>
      </Text>

      <View className="space-y-6">
        {FEATURES.map((feature, index) => (
          <View 
            key={index} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 flex-row items-start mb-4"
          >
            <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
              <Ionicons name={feature.icon as any} size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 mb-1">{feature.title}</Text>
              <Text className="text-slate-600 leading-relaxed">{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
