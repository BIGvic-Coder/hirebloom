import React from 'react';
import { View, Text } from 'react-native';
import { Flag, GraduationCap, DollarSign } from 'lucide-react-native';

const FEATURES = [
  {
    icon: Flag,
    title: 'US-owned and operated',
    description: 'We understand your business standards because we share them.',
  },
  {
    icon: GraduationCap,
    title: 'US-educated talent',
    description: 'Our people have strong English and soft skills because they’ve studied at US universities like BYU-Pathway.',
  },
  {
    icon: DollarSign,
    title: '$13/hour per team member',
    description: 'Flat, predictable pricing. No placement fees. No surprises.',
  },
];

export default function FeaturesSection() {
  return (
    <View className="px-6 py-16 bg-cream">
      <Text className="text-3xl font-extrabold text-forest text-center mb-12">
        Low risk. High trust.{'\n'}
        <Text className="text-mint">Real results.</Text>
      </Text>

      <View className="space-y-6">
        {FEATURES.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <View 
              key={index} 
              className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex-row items-start mb-4"
            >
              <View className="w-12 h-12 rounded-2xl bg-mint/20 items-center justify-center mr-4 border border-mint/25">
                <IconComponent size={20} color="#113c2c" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-forest mb-1">{feature.title}</Text>
                <Text className="text-zinc-500 leading-relaxed text-sm">{feature.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
