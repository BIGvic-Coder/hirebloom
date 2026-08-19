import React from 'react';
import { ScrollView, StatusBar, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeroSection from '@/components/home/HeroSection';
import TrustBadges from '@/components/home/TrustBadges';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <HeroSection />
          <TrustBadges />
          <FeaturesSection />
          <Testimonials />
          <HowItWorks />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
