import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions, Animated, Easing, Platform, Image } from 'react-native';
import { Play, Sparkles, X, CheckCircle, Video, Award, MessageSquare, Bug, Home as HomeIcon, Flag, Star, Shield, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';

// Helper to extract YouTube Video ID
function getYouTubeVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

// Helper to resolve embedded YouTube URL with support for start times
function getYouTubeEmbedUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '';
  const timeMatch = url.match(/[?&]t=(\d+)/);
  const startTime = timeMatch ? parseInt(timeMatch[1], 10) : 0;
  const baseUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1`;
  return startTime ? `${baseUrl}&start=${startTime}` : baseUrl;
}

// Helper to resolve high-res YouTube Thumbnail URL
function getYouTubeThumbnailUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}

// Dynamically require react-native-webview on native platforms to prevent bundling issues on web
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview not loaded:', e);
  }
}

const LOGO_ITEMS = [
  { name: 'BUG MASTER', Icon: Bug },
  { name: 'Baton', Icon: HomeIcon },
  { name: 'BANNER', Icon: Flag },
  { name: "AWFUL'S", Icon: Star },
  { name: 'zerorez', Icon: Sparkles },
  { name: 'RIDD', Icon: Shield },
  { name: 'remi', Icon: Heart },
  { name: 'QUALITY', Icon: Award },
];

export default function HeroSection() {
  const router = useRouter() as any;
  const [modalVisible, setModalVisible] = useState(false);
  const [aiAnalysisTab, setAiAnalysisTab] = useState<'summary' | 'scores' | 'transcript'>('summary');
  
  // Custom horizontal marquee animation using React Native Animated
  const scrollX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const marqueeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -1440,
          duration: 14400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ])
    );
    marqueeAnimation.start();
    return () => marqueeAnimation.stop();
  }, [scrollX]);

  return (
    <View className="bg-cream">
      {/* Visual Hero Block 1: Outsourcing Broken Banner */}
      <View className="bg-forestDark px-6 py-14 items-center relative overflow-hidden">
        {/* Subtle background ambient circles */}
        <View className="absolute w-64 h-64 bg-forest/20 rounded-full -top-10 -left-10" />
        <View className="absolute w-80 h-80 bg-forest/10 rounded-full -bottom-20 -right-20" />

        <View className="bg-mint/10 border border-mint/20 px-4 py-1.5 rounded-full mb-6">
          <Text className="text-mint font-semibold text-xs uppercase tracking-widest">
            A New Staffing Standard
          </Text>
        </View>

        <Text className="text-4xl font-extrabold text-white text-center leading-[1.2] tracking-tight mb-4 font-sans">
          Outsourcing is broken.{'\n'}
          <Text className="text-mint">We&apos;re doing it differently.</Text>
        </Text>

        <Text className="text-sm text-zinc-300 text-center leading-relaxed mb-8 max-w-[320px]">
          Skip placement fees and rigid contracts. Embed pre-vetted global candidates directly into your operations with Hirebloom&apos;s rigorous pre-screening.
        </Text>

        {/* Video Play Container Mock */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 active:opacity-90"
        >
          {/* Simulated video frame */}
          <View className="absolute inset-0 bg-black/40 z-10 justify-center items-center">
            <View className="w-16 h-16 bg-mint rounded-full items-center justify-center shadow-lg shadow-mint/30 animate-pulse">
              <Play size={28} color="#113c2c" fill="#113c2c" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-white font-bold mt-4 tracking-wide text-sm bg-black/50 px-3 py-1 rounded-full border border-white/20">
              Watch pre-screen demo resume
            </Text>
          </View>
          {/* Aesthetic background mesh representing a video card */}
          <View className="flex-1 justify-between p-4 bg-gradient-to-tr from-forestDark to-slate-800">
            <View className="flex-row justify-between items-center">
              <View />
              <View className="bg-mint/80 px-2 py-0.5 rounded">
                <Text className="text-[9px] text-forest font-bold">BLOOM VETTED</Text>
              </View>
            </View>
            <View>
              <Text className="text-white font-bold text-base">Ana Vasquez</Text>
              <Text className="text-zinc-300 text-xs">Customer Support Specialist | Bolivia</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Trusted By Scrolling Marquee */}
      <View className="bg-forest py-4 overflow-hidden border-t border-b border-forestLight/20">
        <View className="flex-row items-center">
          <Text className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest px-4 mr-2 border-r border-zinc-700">
            Trusted by
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <Animated.View 
              style={{ transform: [{ translateX: scrollX }] }}
              className="flex-row"
            >
              {[...LOGO_ITEMS, ...LOGO_ITEMS, ...LOGO_ITEMS].map((item, idx) => (
                <View key={idx} style={{ width: 180, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <item.Icon size={12} color="#faf9f6" style={{ marginRight: 6, opacity: 0.6 }} />
                  <Text className="text-zinc-300 font-bold text-xs tracking-widest opacity-60">
                    {item.name}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </ScrollView>
        </View>
      </View>

      {/* Visual Hero Block 2: What Global Staffing Should Look Like */}
      <View className="px-6 py-14 items-center">
        <Text className="text-3xl font-bold text-forest text-center tracking-tight mb-8">
          What global staffing{'\n'}
          <Text className="italic font-serif font-normal">should</Text> look like.
        </Text>

        {/* Avatars Overlay Component */}
        <View className="w-full h-44 items-center justify-center relative mb-8">
          {/* Center Avatar */}
          <View className="w-24 h-24 rounded-full bg-forest border-4 border-cream shadow-xl z-20 items-center justify-center overflow-hidden">
            <View className="w-full h-full bg-gradient-to-tr from-teal-800 to-mint items-center justify-center">
              <Text className="text-white font-bold text-2xl font-serif">AV</Text>
            </View>
          </View>
          
          {/* Left Avatar */}
          <View className="w-20 h-20 rounded-full bg-slate-700 border-4 border-cream shadow-lg z-10 absolute left-[15%] top-8 items-center justify-center overflow-hidden">
            <View className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-400 items-center justify-center">
              <Text className="text-white font-bold text-xl font-serif">CG</Text>
            </View>
          </View>

          {/* Right Avatar */}
          <View className="w-20 h-20 rounded-full bg-slate-600 border-4 border-cream shadow-lg z-10 absolute right-[15%] top-8 items-center justify-center overflow-hidden">
            <View className="w-full h-full bg-gradient-to-bl from-forestDark to-slate-500 items-center justify-center">
              <Text className="text-white font-bold text-xl font-serif">SC</Text>
            </View>
          </View>

          {/* Floating job labels */}
          <View className="absolute top-0 left-[2%] bg-forest px-3 py-1.5 rounded-full shadow-md z-30">
            <Text className="text-[10px] text-white font-bold">Customer Support</Text>
          </View>

          <View className="absolute bottom-1 right-[2%] bg-forest px-3 py-1.5 rounded-full shadow-md z-30">
            <Text className="text-[10px] text-white font-bold">Software Engineer</Text>
          </View>

          <View className="absolute top-10 right-[3%] bg-zinc-800 px-3 py-1.5 rounded-full shadow-md z-30">
            <Text className="text-[10px] text-white font-bold">Graphic Designer</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/employer')}
          className="bg-mint w-full py-4 rounded-xl shadow-md active:opacity-90"
        >
          <Text className="text-forest text-center font-bold text-base">
            Start Hiring
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Simulated AI Screening Video Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/85 justify-end">
          <View className="bg-forestDark w-full rounded-t-3xl p-6 border-t border-zinc-800" style={{ maxHeight: '90%' }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center space-x-2">
                <Sparkles size={20} color="#8ecfa9" />
                <Text className="text-white font-bold text-lg">Hirebloom Candidate Pre-Screen</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center"
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Candidate Card */}
            <View className="bg-forest p-4 rounded-2xl border border-mint/20 flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-mint/20 items-center justify-center mr-3">
                  <Text className="text-mint font-bold text-lg font-serif">AV</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Ana Vasquez</Text>
                  <Text className="text-zinc-400 text-xs">Customer Support | La Paz, Bolivia</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-mint font-extrabold text-lg">94%</Text>
                <Text className="text-zinc-400 text-[10px]">AI MATCH RATE</Text>
              </View>
            </View>

            {/* Video Player Block */}
            {Platform.OS === 'web' ? (
              <View className="w-full bg-zinc-950 rounded-xl aspect-video overflow-hidden mb-6 relative border border-zinc-800">
                {modalVisible && (
                  <iframe
                    src={getYouTubeEmbedUrl('https://youtu.be/7CDHXZG-yBI?t=12')}
                    title="Ana Vasquez - Resume Pitch"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </View>
            ) : WebView ? (
              <View className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden mb-6 relative border border-zinc-800/50 shadow-inner">
                {modalVisible && (
                  <WebView
                    style={{ flex: 1, backgroundColor: '#000' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    source={{ 
                      uri: getYouTubeEmbedUrl('https://youtu.be/7CDHXZG-yBI?t=12'),
                      headers: {
                        'Referer': 'https://com.victor.hirebloom'
                      }
                    }}
                  />
                )}
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openBrowserAsync('https://youtu.be/7CDHXZG-yBI?t=12')}
                className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden mb-6 relative border border-zinc-800/50 shadow-inner"
              >
                {getYouTubeThumbnailUrl('https://youtu.be/7CDHXZG-yBI?t=12') ? (
                  <Image
                    source={{ uri: getYouTubeThumbnailUrl('https://youtu.be/7CDHXZG-yBI?t=12') }}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                    resizeMode="cover"
                  />
                ) : null}
                <View className="absolute inset-0 bg-black/40 z-10" />
                <View className="z-20 flex-1 justify-center items-center">
                  <View className="w-14 h-14 bg-mint rounded-full items-center justify-center shadow-lg shadow-mint/30 mb-2 border border-white/20">
                    <Play size={24} color="#113c2c" fill="#113c2c" style={{ marginLeft: 4 }} />
                  </View>
                  <Text className="text-white text-xs font-bold tracking-wide shadow-sm">Play Video</Text>
                  <Text className="text-zinc-300 text-[9px] mt-1 bg-black/40 px-2 py-0.5 rounded-full">
                    Opens in secure YouTube player
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Interactive Tabbed AI Analysis Panel */}
            <View className="flex-row border-b border-zinc-800 mb-4">
              <TouchableOpacity 
                onPress={() => setAiAnalysisTab('summary')}
                className={`flex-1 pb-3 items-center ${aiAnalysisTab === 'summary' ? 'border-b-2 border-mint' : ''}`}
              >
                <Text className={`text-xs font-bold ${aiAnalysisTab === 'summary' ? 'text-mint' : 'text-zinc-400'}`}>
                  AI Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setAiAnalysisTab('scores')}
                className={`flex-1 pb-3 items-center ${aiAnalysisTab === 'scores' ? 'border-b-2 border-mint' : ''}`}
              >
                <Text className={`text-xs font-bold ${aiAnalysisTab === 'scores' ? 'text-mint' : 'text-zinc-400'}`}>
                  Evaluations
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setAiAnalysisTab('transcript')}
                className={`flex-1 pb-3 items-center ${aiAnalysisTab === 'transcript' ? 'border-b-2 border-mint' : ''}`}
              >
                <Text className={`text-xs font-bold ${aiAnalysisTab === 'transcript' ? 'text-mint' : 'text-zinc-400'}`}>
                  Questions
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-56" showsVerticalScrollIndicator={false}>
              {aiAnalysisTab === 'summary' && (
                <View className="space-y-4">
                  <View className="bg-forest/50 p-4 rounded-xl border border-mint/10">
                    <Text className="text-mint font-bold text-xs mb-1.5 uppercase tracking-wider">Vetting & Screening Summary</Text>
                    <Text className="text-zinc-300 text-sm leading-relaxed">
                      Ana demonstrates outstanding verbal English proficiency with minor native accentuation that does not impact clarity. She expresses strong problem-solving capacities and showcases deep experience managing Zendesk/Intercom systems. Excellent candidate for tech support operations.
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-2 bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/30">
                    <CheckCircle size={16} color="#10b981" />
                    <Text className="text-[11px] text-zinc-300">Identity, education (BYU-Pathway), and background checked.</Text>
                  </View>
                </View>
              )}

              {aiAnalysisTab === 'scores' && (
                <View className="space-y-3">
                  {[
                    { label: 'English Comprehension & Pitch', score: 96 },
                    { label: 'Technical Problem Solving', score: 92 },
                    { label: 'Role Alignment & Competency', score: 95 },
                    { label: 'Cultural & Values Alignment', score: 90 },
                  ].map((item, idx) => (
                    <View key={idx}>
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-zinc-300 text-xs font-medium">{item.label}</Text>
                        <Text className="text-mint text-xs font-bold">{item.score}%</Text>
                      </View>
                      <View className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <View style={{ width: `${item.score}%` }} className="h-full bg-mint rounded-full" />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {aiAnalysisTab === 'transcript' && (
                <View className="space-y-4">
                  <View>
                    <Text className="text-mint text-xs font-bold mb-1">Q: How do you handle stressful client situations?</Text>
                    <Text className="text-zinc-400 text-xs italic">
                      &quot;I always start by acknowledging their frustration and confirming I have the details correct. De-escalating is about listening first, then working systematically to solve the problem.&quot;
                    </Text>
                  </View>
                  <View className="border-t border-zinc-800 pt-3">
                    <Text className="text-mint text-xs font-bold mb-1">Q: What is your availability?</Text>
                    <Text className="text-zinc-400 text-xs italic">
                      &quot;Full-time. I align my schedule directly with US business hours, working MST/EST shifts without issues.&quot;
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                router.push('/employer');
              }}
              className="bg-mint py-4 rounded-xl shadow-md mt-6 items-center"
            >
              <Text className="text-forest font-bold">Request Full Interview File</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
