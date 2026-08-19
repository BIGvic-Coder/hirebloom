import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Share } from 'react-native';
import { ChevronLeft, ChevronRight, Download, Heart, MapPin, Globe } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const CANDIDATES = [
  {
    name: 'Ana Vasquez',
    country: 'Bolivia',
    role: 'Mentor Support Agent',
    quote: '"When this inflation started, our family was struggling a bit to get food and to get everything that we needed to be able to live. Earning in dollars literally saved my family. Springboard changed my life drastically. I\'m married and I\'m looking to have kids. We have a house and an hour of land. If anything happens in our lives, we have savings."',
  },
  {
    name: 'Carlos Gomez',
    country: 'Colombia',
    role: 'Graphic Designer',
    quote: '"Being able to work for US clients while remaining in my home city has been incredible. The income growth is substantial, allowing me to support my extended family and invest in professional design hardware. Hirebloom bridged a massive gap for me."',
  },
  {
    name: 'Sofia Chen',
    country: 'Peru',
    role: 'QA Engineer',
    quote: '"The stability of a long-term contract at $13/hour is unmatched here. I\'ve upgraded my home office, paid off my university debt, and can plan for my future with absolute confidence. The pre-checks and onboarding were seamless."',
  },
];

export default function GlobalReach() {
  const [candidateIdx, setCandidateIdx] = useState(0);
  const currentCandidate = CANDIDATES[candidateIdx];

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCandidateIdx((prev) => (prev + 1) % CANDIDATES.length);
  };

  const handlePrev = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCandidateIdx((prev) => (prev - 1 + CANDIDATES.length) % CANDIDATES.length);
  };

  const handleShareReport = async () => {
    try {
      await Share.share({
        message: 'Check out the Hirebloom 2025 Global Impact Report! Over 8,068+ jobs created in emerging markets.',
        url: 'https://www.hirebloom.com/impact-report-2025',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View className="bg-forestDark px-6 py-14">
      {/* Subtitle & Title */}
      <Text className="text-xs font-semibold text-mint uppercase tracking-widest text-center mb-2">
        Our Impact
      </Text>
      <Text className="text-3xl font-extrabold text-white text-center tracking-tight mb-10">
        Global hiring you can{'\n'}feel good about.
      </Text>

      {/* Stats Counter Grid */}
      <View className="flex-row justify-between mb-12">
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-mint">8,068+</Text>
          <Text className="text-[10px] text-zinc-300 text-center mt-1">Jobs created</Text>
        </View>
        <View className="items-center flex-1 border-l border-r border-zinc-800">
          <Text className="text-3xl font-bold text-mint">3x</Text>
          <Text className="text-[10px] text-zinc-300 text-center mt-1">Average income growth</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-mint">86%</Text>
          <Text className="text-[10px] text-zinc-300 text-center mt-1">Retention rate</Text>
        </View>
      </View>

      {/* Global Reach Container: Map + Testimonial Card */}
      <View className="bg-cream rounded-3xl p-5 border border-zinc-200/50 mb-8">
        <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Our global reach
        </Text>

        <View className="flex-row items-center justify-between mb-4">
          {/* Stylized Vector South America Map */}
          <View className="w-28 h-36 justify-center items-center relative">
            <Svg width="110" height="140" viewBox="0 0 120 150">
              {/* Base outline path of South America */}
              <Path
                d="M 40 10 C 65 12, 85 22, 95 38 C 105 52, 95 68, 88 82 C 80 98, 65 120, 52 142 C 50 145, 46 145, 46 142 C 44 128, 40 112, 38 98 C 36 82, 32 75, 24 68 C 16 60, 8 52, 12 38 C 16 22, 24 15, 40 10 Z"
                fill="#D4D1C7"
                stroke="#C6C3B9"
                strokeWidth="1"
              />
              
              {/* Highlight Overlay - Colombia (Top Left) */}
              <Path
                d="M 22 25 C 26 24, 34 26, 36 34 C 36 40, 28 44, 22 40 C 18 36, 18 28, 22 25 Z"
                fill={currentCandidate.country === 'Colombia' ? '#113C2C' : '#C4C1B7'}
                stroke={currentCandidate.country === 'Colombia' ? '#8ECFA9' : '#B8B5AB'}
                strokeWidth="1"
              />

              {/* Highlight Overlay - Peru (West Coast) */}
              <Path
                d="M 22 42 C 28 46, 32 54, 32 62 C 28 70, 20 66, 16 58 C 16 50, 20 46, 22 42 Z"
                fill={currentCandidate.country === 'Peru' ? '#113C2C' : '#C4C1B7'}
                stroke={currentCandidate.country === 'Peru' ? '#8ECFA9' : '#B8B5AB'}
                strokeWidth="1"
              />

              {/* Highlight Overlay - Bolivia (Center) */}
              <Path
                d="M 40 62 C 52 62, 60 70, 56 82 C 48 86, 40 82, 36 74 C 36 68, 38 65, 40 62 Z"
                fill={currentCandidate.country === 'Bolivia' ? '#113C2C' : '#C4C1B7'}
                stroke={currentCandidate.country === 'Bolivia' ? '#8ECFA9' : '#B8B5AB'}
                strokeWidth="1"
              />
            </Svg>

            {/* Glowing pin overlay depending on current country */}
            {currentCandidate.country === 'Colombia' && (
              <View className="absolute top-[28px] left-[20px] bg-mint px-1.5 py-0.5 rounded-full border border-forest">
                <Text className="text-[7px] font-bold text-forest">COL</Text>
              </View>
            )}
            {currentCandidate.country === 'Peru' && (
              <View className="absolute top-[55px] left-[15px] bg-mint px-1.5 py-0.5 rounded-full border border-forest">
                <Text className="text-[7px] font-bold text-forest">PER</Text>
              </View>
            )}
            {currentCandidate.country === 'Bolivia' && (
              <View className="absolute top-[72px] left-[35px] bg-mint px-1.5 py-0.5 rounded-full border border-forest">
                <Text className="text-[7px] font-bold text-forest">BOL</Text>
              </View>
            )}
          </View>

          {/* Controller selectors */}
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              onPress={handlePrev}
              className="w-8 h-8 rounded-full bg-white border border-zinc-200 justify-center items-center active:opacity-60"
            >
              <ChevronLeft size={16} color="#113C2C" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleNext}
              className="w-8 h-8 rounded-full bg-white border border-zinc-200 justify-center items-center active:opacity-60"
            >
              <ChevronRight size={16} color="#113C2C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimonial details */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-forest font-bold text-base">{currentCandidate.name}</Text>
              <Text className="text-zinc-500 text-xs">{currentCandidate.role}</Text>
            </View>
            <View className="flex-row items-center bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
              <MapPin size={10} color="#113C2C" style={{ marginRight: 4 }} />
              <Text className="text-[9px] text-forest font-bold">{currentCandidate.country}</Text>
            </View>
          </View>
          <Text className="text-zinc-600 text-[13px] leading-relaxed italic">
            {currentCandidate.quote}
          </Text>
        </View>
      </View>

      {/* Our Mission panel */}
      <View className="bg-forest border border-mint/20 rounded-2xl p-5 mb-8">
        <View className="flex-row items-center space-x-2 mb-3">
          <Globe size={18} color="#8ecfa9" />
          <Text className="text-mint font-bold text-xs uppercase tracking-widest">Our Mission</Text>
        </View>
        <Text className="text-white font-semibold text-[15px] leading-relaxed">
          We open doors to a long-term living wage for job-ready BYU-Pathway students and graduates in emerging markets.
        </Text>
      </View>

      {/* Our Impact Report Brochure Link */}
      <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 items-center">
        <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-widest text-center mb-1">
          Our Impact
        </Text>
        <Text className="text-lg font-bold text-white text-center mb-4">
          Global Impact Report 2025
        </Text>
        
        {/* Mock Brochure visual */}
        <View className="w-40 h-24 bg-gradient-to-tr from-forest to-mint rounded-lg items-center justify-between p-3 shadow-md mb-5 border border-white/10">
          <View className="w-full flex-row justify-between items-center">
            <Text className="text-white text-[8px] font-bold tracking-widest uppercase">HIREBLOOM</Text>
            <View className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </View>
          <Text className="text-white font-extrabold text-[11px] leading-tight tracking-tight text-center">
            Global Impact{'\n'}Report 2025
          </Text>
          <View className="w-full h-1 bg-white/30 rounded-full" />
        </View>

        <TouchableOpacity 
          onPress={handleShareReport}
          className="bg-mint px-6 py-3.5 rounded-xl flex-row items-center justify-center active:opacity-90 w-full"
        >
          <Download size={16} color="#113C2C" style={{ marginRight: 8 }} />
          <Text className="text-forest font-bold text-sm">Download Impact Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
