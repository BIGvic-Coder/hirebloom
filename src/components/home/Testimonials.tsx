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
    <View className="px-6 py-16 bg-cream">
      <Text className="text-3xl font-bold text-forest text-center mb-10">
        Leave the heavy lifting to us.
      </Text>

      <View className="space-y-6">
        {QUOTES.map((quote, index) => (
          <View key={index} className="bg-white p-8 rounded-3xl shadow-sm shadow-zinc-200/40 mb-4">
            <Text className="text-4xl text-mint font-serif leading-none mb-2">&quot;</Text>
            <Text className="text-lg font-medium text-slate-700 italic leading-relaxed mb-6">
              {quote.text}
            </Text>
            <View className="w-10 h-1 bg-forest rounded-full mb-3" />
            <Text className="text-sm font-bold text-forest uppercase tracking-wider">
              {quote.author}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
