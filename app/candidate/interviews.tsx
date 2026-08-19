import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Calendar, Video, Clock, User, ChevronRight, ExternalLink } from 'lucide-react-native';

const mockInterviews = [
  {
    id: 1,
    title: 'Client Partner Interview',
    company: 'InnovateX',
    interviewer: 'David Vance (Director of Ops)',
    date: 'Wednesday, August 19, 2026',
    time: '2:00 PM - 2:30 PM (EST)',
    link: 'https://meet.google.com/abc-defg-hij',
    type: 'Final Round',
  },
  {
    id: 2,
    title: 'Mock Placement Sync',
    company: 'Hirebloom Portal',
    interviewer: 'Zanele Mthembu (Placement Manager)',
    date: 'Friday, August 21, 2026',
    time: '11:00 AM - 11:30 AM (EST)',
    link: 'https://meet.google.com/xyz-qprs-tuv',
    type: 'Coaching',
  },
];

export default function CandidateInterviews() {
  const handleJoinCall = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't open meeting link", err));
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-3xl font-extrabold text-forest mb-2">Interviews</Text>
        <Text className="text-zinc-500 text-sm mb-8">Manage and join your upcoming video sync calls.</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {mockInterviews.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-5 mb-5"
            >
              {/* Card Title & Type */}
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-lg font-bold text-forest leading-tight mb-1">{item.title}</Text>
                  <Text className="text-zinc-400 font-bold text-xs">{item.company}</Text>
                </View>
                <View className="bg-forest/10 px-2.5 py-1 rounded-lg">
                  <Text className="text-forest font-extrabold text-[10px] uppercase">
                    {item.type}
                  </Text>
                </View>
              </View>

              {/* Schedule Info */}
              <View className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-5">
                <View className="flex-row items-center">
                  <Calendar color="#113c2c" size={14} style={{ marginRight: 8 }} />
                  <Text className="text-forest text-xs font-semibold">{item.date}</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock color="#113c2c" size={14} style={{ marginRight: 8 }} />
                  <Text className="text-forest text-xs font-semibold">{item.time}</Text>
                </View>
                <View className="flex-row items-center border-t border-zinc-200/40 pt-2.5 mt-1">
                  <User color="#113c2c" size={14} style={{ marginRight: 8 }} />
                  <Text className="text-zinc-500 text-xs font-medium">
                    Host: <Text className="font-bold text-forest">{item.interviewer}</Text>
                  </Text>
                </View>
              </View>

              {/* Join Action Buttons */}
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => handleJoinCall(item.link)}
                  className="flex-1 bg-forest py-3.5 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
                >
                  <Video color="white" size={16} style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-xs">Join Google Meet</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleJoinCall(item.link)}
                  className="w-12 bg-zinc-100 border border-zinc-200/60 rounded-xl items-center justify-center active:opacity-75"
                >
                  <ExternalLink color="#113c2c" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View className="bg-mint/10 border border-mint/25 rounded-3xl p-5 mt-4 items-center">
            <Text className="text-forest font-bold text-sm text-center mb-1">Need to Reschedule?</Text>
            <Text className="text-zinc-500 text-xs text-center leading-relaxed">
              Reach out to your dedicated Hirebloom Coordinator at least 24 hours prior to request adjustments.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
