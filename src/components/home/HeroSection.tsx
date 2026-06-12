import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function HeroSection() {
  return (
    <View className="px-6 pt-16 pb-12 bg-white">
      <View className="items-center">
        <View className="bg-blue-50 px-4 py-2 rounded-full mb-6">
          <Text className="text-blue-600 font-medium text-sm">
            Outsourcing without the anxiety
          </Text>
        </View>

        <Text className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center leading-[1.15] tracking-tight mb-6">
          Outsourcing is broken.{'\n'}
          <Text className="text-blue-600">We’re doing it differently.</Text>
        </Text>

        <Text className="text-lg text-slate-600 text-center leading-relaxed mb-10 max-w-[320px]">
          Traditional outsourcing makes you hand over control. We don't. Our remote team members embed directly in yours—you train them, you manage them—so it feels in-house. All the savings, none of the trade-offs.
        </Text>

        <TouchableOpacity 
          className="bg-blue-600 w-full py-4 rounded-2xl shadow-lg shadow-blue-600/30 active:bg-blue-700"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">
            Schedule a free consultation
          </Text>
        </TouchableOpacity>
        
        <View className="mt-6 flex-row items-center space-x-2">
          <Text className="text-slate-500 text-sm">No placement fees</Text>
          <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
          <Text className="text-slate-500 text-sm">No long-term contracts</Text>
        </View>
      </View>
    </View>
  );
}
