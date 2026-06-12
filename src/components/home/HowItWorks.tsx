import React from 'react';
import { View, Text } from 'react-native';

const STEPS = [
  {
    number: '01',
    title: 'Intro',
    desc: 'Tell us more about who you’re looking for, and let’s see if there’s a fit.',
  },
  {
    number: '02',
    title: 'Match',
    desc: 'We’ll handpick matching candidates—pre-screening for skills, language, and tech.',
  },
  {
    number: '03',
    title: 'Interview',
    desc: 'You interview talent just like you would with any new hire. Choose your favorites.',
  },
  {
    number: '04',
    title: 'Onboard',
    desc: 'We handle contracts and payroll. You keep control of training and management.',
  },
];

export default function HowItWorks() {
  return (
    <View className="px-6 py-16 bg-slate-900">
      <Text className="text-3xl font-bold text-white mb-10">
        Hire in four simple steps
      </Text>

      <View className="space-y-8">
        {STEPS.map((step, index) => (
          <View key={index} className="flex-row items-start mb-8">
            <Text className="text-4xl font-extrabold text-blue-500/30 mr-6 mt-[-4px]">
              {step.number}
            </Text>
            <View className="flex-1 pb-6 border-b border-slate-800">
              <Text className="text-xl font-bold text-white mb-2">{step.title}</Text>
              <Text className="text-slate-400 leading-relaxed">{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
