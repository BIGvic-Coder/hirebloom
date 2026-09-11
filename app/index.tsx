import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, LayoutAnimation, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogIn, UserPlus, Info } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import HeroSection from '@/components/home/HeroSection';
import TrustBadges from '@/components/home/TrustBadges';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorks from '@/components/home/HowItWorks';
import GlobalReach from '@/components/home/GlobalReach';
import Testimonials from '@/components/home/Testimonials';
import PricingSection from '@/components/home/PricingSection';

// Memoize heavy static sections to prevent unnecessary re-renders on scroll state updates
const MemoizedHero = React.memo(HeroSection);
const MemoizedTrustBadges = React.memo(TrustBadges);
const MemoizedFeatures = React.memo(FeaturesSection);
const MemoizedHowItWorks = React.memo(HowItWorks);
const MemoizedGlobalReach = React.memo(GlobalReach);
const MemoizedTestimonials = React.memo(Testimonials);
const MemoizedPricing = React.memo(PricingSection);

export default function Home() {
  const router = useRouter() as any;
  const scrollViewRef = useRef<ScrollView>(null);

  // Dynamic layout offset mapping to enable smooth scrolling to sections
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState('overview');

  const handleScrollTo = (sectionName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSection(sectionName);
    
    if (Platform.OS === 'web') {
      const element = document.getElementById(sectionName);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const y = offsets[sectionName];
      if (y !== undefined) {
        scrollViewRef.current?.scrollTo({ y: y - 10, animated: true });
      }
    }
  };

  const handleSectionLayout = (sectionName: string, y: number) => {
    setOffsets((prev) => ({ ...prev, [sectionName]: y }));
  };

  // Simple scroll tracking to update active tab highlight on scroll
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Find closest section
    let current = 'overview';
    const margin = 100;
    
    if (offsets['pricing'] && scrollY >= offsets['pricing'] - margin) {
      current = 'pricing';
    } else if (offsets['impact'] && scrollY >= offsets['impact'] - margin) {
      current = 'impact';
    } else if (offsets['howItWorks'] && scrollY >= offsets['howItWorks'] - margin) {
      current = 'howItWorks';
    }
    
    if (current !== activeSection) {
      setActiveSection(current);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f2eb" />
      
      {/* Sticky Logo Header */}
      <View className="bg-cream px-5 py-4 flex-row justify-between items-center border-b border-zinc-200/60 shadow-sm z-30">
        <View className="flex-row items-center">
          <View className="w-6 h-6 justify-center items-center mr-1.5">
            <Svg width="20" height="20" viewBox="0 0 50 50">
              <Path
                d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
                fill="none"
                stroke="#8ecfa9"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M 12 40 L 4 46"
                stroke="#8ecfa9"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <Path d="M 16 34 L 16 26" stroke="#8ecfa9" strokeWidth="4" strokeLinecap="round" />
              <Circle cx="16" cy="20" r="3.5" fill="#8ecfa9" />
              <Path d="M 25 34 L 25 20" stroke="#8ecfa9" strokeWidth="4" strokeLinecap="round" />
              <Circle cx="25" cy="14" r="3.5" fill="#8ecfa9" />
              <Path d="M 34 34 L 34 24" stroke="#8ecfa9" strokeWidth="4" strokeLinecap="round" />
              <Circle cx="34" cy="18" r="3.5" fill="#8ecfa9" />
            </Svg>
          </View>
          <Text className="text-xl font-bold text-forest tracking-tight">
            bloom
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity 
            onPress={() => router.push('/login')}
            className="flex-row items-center bg-white border border-zinc-300 px-3 py-1.5 rounded-full active:opacity-60 mr-1.5"
          >
            <LogIn size={12} color="#113c2c" style={{ marginRight: 4 }} />
            <Text className="text-[10px] text-forest font-bold">Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/register')}
            className="flex-row items-center bg-forest px-3.5 py-1.5 rounded-full shadow-sm active:opacity-85"
          >
            <UserPlus size={12} color="#8ecfa9" style={{ marginRight: 4 }} />
            <Text className="text-[10px] text-white font-bold">Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Quick-Scroll Selector Bar */}
      <View className="bg-white border-b border-zinc-100 py-3 px-5 flex-row justify-between items-center shadow-sm z-20">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'howItWorks', label: 'How it works' },
          { key: 'impact', label: 'Our Impact' },
          { key: 'pricing', label: 'Pricing' }
        ].map((tab) => {
          const isActive = activeSection === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleScrollTo(tab.key)}
              className={`pb-1 px-1 border-b-2 ${
                isActive ? 'border-forest' : 'border-transparent'
              }`}
            >
              <Text className={`text-[11px] font-bold ${
                isActive ? 'text-forest' : 'text-zinc-400'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Body Scrolling Content */}
      <ScrollView 
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View id="overview" nativeID="overview" onLayout={(e) => handleSectionLayout('overview', e.nativeEvent.layout.y)} style={Platform.OS === 'web' ? { scrollMarginTop: 110 } as any : undefined}>
          {/* Quick Registration / Onboarding Gateway Banner */}
          <View className="bg-forestDark mx-4 mt-3 mb-2 p-4 rounded-2xl border border-mint/20 shadow-md">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-mint mr-2" />
                <Text className="text-mint font-bold text-[11px] uppercase tracking-wider">
                  New to Hire Bloom?
                </Text>
              </View>
              <Text className="text-zinc-400 text-[10px]">$13/hr Standard Rate</Text>
            </View>

            <Text className="text-white font-bold text-base mb-1">
              Create your profile in 30 seconds
            </Text>
            <Text className="text-zinc-300 text-xs mb-3 leading-relaxed">
              Register with your Name, Google, or Email to start matching with remote roles or hire pre-vetted support talent.
            </Text>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push('/register')}
                className="flex-1 bg-mint py-2.5 rounded-xl flex-row items-center justify-center shadow-sm active:opacity-90 mr-2"
              >
                <UserPlus size={14} color="#113c2c" style={{ marginRight: 6 }} />
                <Text className="text-forest font-extrabold text-xs">Register with Name or Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/login')}
                className="bg-white/10 border border-white/20 px-3.5 py-2.5 rounded-xl flex-row items-center justify-center active:opacity-80"
              >
                <LogIn size={13} color="#ffffff" style={{ marginRight: 4 }} />
                <Text className="text-white font-bold text-xs">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <MemoizedHero />
          <MemoizedTrustBadges />
          <MemoizedFeatures />
        </View>
        
        <View id="howItWorks" nativeID="howItWorks" onLayout={(e) => handleSectionLayout('howItWorks', e.nativeEvent.layout.y)} style={Platform.OS === 'web' ? { scrollMarginTop: 110 } as any : undefined}>
          <MemoizedHowItWorks />
        </View>

        <View id="impact" nativeID="impact" onLayout={(e) => handleSectionLayout('impact', e.nativeEvent.layout.y)} style={Platform.OS === 'web' ? { scrollMarginTop: 110 } as any : undefined}>
          <MemoizedGlobalReach />
          <MemoizedTestimonials />
        </View>

        <View id="pricing" nativeID="pricing" onLayout={(e) => handleSectionLayout('pricing', e.nativeEvent.layout.y)} style={Platform.OS === 'web' ? { scrollMarginTop: 110 } as any : undefined}>
          <MemoizedPricing />
        </View>

        {/* Footer Brand Block */}
        <View className="bg-forestDark px-6 py-12 items-center">
          <Text className="text-white font-extrabold text-lg font-serif mb-2">hirebloom</Text>
          <Text className="text-zinc-400 text-xs text-center mb-6">
            The premium remote staffing platform for vetted support talent.
          </Text>
          <Text className="text-zinc-500 text-[9px]">
            © 2026 Hirebloom. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Dual Action Bar Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-zinc-200/80 px-5 py-4 flex-row space-x-3 shadow-lg z-30">
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/register', params: { role: 'candidate' } })}
          className="flex-1 bg-white border border-forest py-3.5 rounded-xl justify-center items-center active:opacity-60 mr-2"
        >
          <Text className="text-forest font-bold text-sm">Apply as Candidate</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/register', params: { role: 'employer' } })}
          className="flex-1 bg-mint py-3.5 rounded-xl justify-center items-center shadow shadow-mint/20 active:opacity-90"
        >
          <Text className="text-forest font-bold text-sm">Register as Employer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
