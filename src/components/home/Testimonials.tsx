import React from 'react';
import { View, Text } from 'react-native';

const QUOTES = [
  {
    text: '“They’re very educated, super motivated, and they care tremendously about their job.”',
    author: 'CEO, Home Services Co.',
  },
  {
    text: '“Every time we’ve done an interviewing round with Bloom, I’ve had two or three people I wanted to offer the job and had to choose. The quality is fantastic.”',
    author: 'VP of Operations',
  },
  {
    text: '“It’s a breath of fresh air to interview someone who actually wants a job!”',
    author: 'Director of HR',
  },
];

export default function Testimonials() {
  return (
    <View className="px-6 py-16 bg-blue-50">
      <Text className="text-3xl font-bold text-slate-900 text-center mb-10">
        Leave the heavy lifting to us.
      </Text>

      <View className="space-y-6">
        {QUOTES.map((quote, index) => (
          <View key={index} className="bg-white p-8 rounded-3xl shadow-sm shadow-blue-100 mb-4">
            <Text className="text-4xl text-blue-200 font-serif leading-none mb-2">"</Text>
            <Text className="text-lg font-medium text-slate-700 italic leading-relaxed mb-6">
              {quote.text}
            </Text>
            <View className="w-10 h-1 bg-blue-600 rounded-full mb-3" />
            <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {quote.author}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
