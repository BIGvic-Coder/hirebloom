import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Modal, ScrollView, TextInput, Platform, Image } from 'react-native';
import { Sparkles, MessageSquare, Check, Layers, Shield, Zap, Play, X, Video, ExternalLink, ChevronRight, Plus, Minus } from 'lucide-react-native';
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

const TALENT_VIDEOS = [
  { name: 'Ana Vasquez', role: 'Customer Support | Bolivia', country: 'BOL', avatar: 'AV', url: 'https://youtu.be/7CDHXZG-yBI?t=12' },
  { name: 'Carlos Gomez', role: 'Graphic Designer | Colombia', country: 'COL', avatar: 'CG', url: 'https://youtu.be/fzjEdRuJIeM' },
  { name: 'Sofia Chen', role: 'QA Engineer | Peru', country: 'PER', avatar: 'SC', url: 'https://youtu.be/6gp0chLzck0' },
  { name: 'Mateo Silva', role: 'Data Analyst | Brazil', country: 'BRA', avatar: 'MS', url: 'https://youtu.be/0fRhZS4pGrQ' },
  { name: 'Liam Dubois', role: 'IT Support | Rwanda', country: 'RWA', avatar: 'LD', url: 'https://youtu.be/yAqwkXy9W2U' },
];

const CLIENT_TESTIMONIALS = [
  { company: 'Check City', spokesperson: 'Sarah Jenkins', quote: '"Collaborating with our remote support specialist from Bolivia has been an absolute success. Fast integration and seamless alignment."', url: 'https://youtu.be/HO4sLYt4xE4' },
  { company: 'Trove Brands', spokesperson: 'Marcus Peterson', quote: '"The design team members we matched with are top tier. They operate with US alignment and bring outstanding design results."', url: 'https://youtu.be/PzzTejRs-ac' },
  { company: 'nbs', spokesperson: 'Elena Rostova', quote: '"Hirebloom eliminated placement fees and provided pre-vetted QA engineers who helped ship our software update on schedule."', url: 'https://youtu.be/PzzTejRs-ac' },
];

const ONBOARD_AVATARS: Record<string, any> = {
  Sofia: require('@/assets/images/avatar_sofia.png'),
  Zanele: require('@/assets/images/avatar_zanele.png'),
  David: require('@/assets/images/avatar_david.png'),
};

const RADAR_NODES = [
  {
    id: 'tech_skills',
    title: 'Desired skills',
    x: '28%', // Top Left
    y: '12%',
    desc: 'Verify candidate tech stacks, frameworks, and coding patterns face-to-face via live assessments.',
    icon: Sparkles,
  },
  {
    id: 'job_overview',
    title: 'Job overview',
    x: '72%', // Top Right
    y: '12%',
    desc: 'Deep alignment on candidate daily expectations, working hours, and delivery expectations.',
    icon: MessageSquare,
  },
  {
    id: 'open_headcount',
    title: 'Open headcount',
    x: '90%', // Far Right
    y: '50%',
    desc: 'Optimize hiring targets based on candidate budget constraints and timeline expectations.',
    icon: Check,
  },
  {
    id: 'req_experience',
    title: 'Required experience',
    x: '72%', // Bottom Right
    y: '88%',
    desc: 'Assess past project delivery, engineering seniority, and commercial production standards.',
    icon: Layers,
  },
  {
    id: 'equipment',
    title: 'Necessary equipment',
    x: '28%', // Bottom Left
    y: '88%',
    desc: 'Pre-vetted configurations ensuring high-speed internet backups, secure machines, and cameras.',
    icon: Shield,
  },
  {
    id: 'team_dynamics',
    title: 'Team dynamics',
    x: '10%', // Far Left
    y: '50%',
    desc: 'Ensure culture-fit matching, communication styles, and language competency match your current team.',
    icon: Zap,
  },
];

const FAQ_ITEMS = [
  {
    question: "How do I pay my international team members?",
    answer: "Hirebloom handles foreign contracts, local compliance, and global payroll processing. You receive a simple, transparent invoice in USD, and we distribute the local currency payments directly to your team members."
  },
  {
    question: "Who decides which team members are hired?",
    answer: "You do. We present pre-vetted candidates who match your exact requirements, but you conduct the final interviews and make the ultimate hiring decisions."
  },
  {
    question: "How quickly can I get started meeting and hiring team members?",
    answer: "Typically within a few business days. Once we define your requirements, we match you with pre-screened talent ready to start interviewing immediately."
  },
  {
    question: "What's the minimum number of team members to get started?",
    answer: "There is no minimum. You can hire a single team member to start, and scale up as your operational requirements grow."
  },
  {
    question: "How proficient are Hire Bloom's candidates in English?",
    answer: "100% fluent. English competency is one of our strict gating criteria. Every candidate undergoes rigorous written and spoken English vetting."
  },
  {
    question: "What types of roles can Hire Bloom team members fill?",
    answer: "We support a wide range of roles including Software Engineers, Customer Support Specialists, QA Engineers, Data Analysts, Graphic Designers, and administrative coordinators."
  },
  {
    question: "Do my new team members need their own equipment?",
    answer: "No. Hirebloom pre-vets every candidate's equipment, ensuring they have high-speed backup internet connections, secure workstations, and active webcams."
  },
  {
    question: "Does Hire Bloom provide ongoing support after hiring?",
    answer: "Yes. Every client is matched with a dedicated Customer Success Coordinator who monitors performance, handles payroll logistics, and conducts regular check-ins."
  },
  {
    question: "What if a new team member isn't the right fit?",
    answer: "We offer a risk-free matching period. If a matched candidate doesn't meet your performance standards, we will immediately find a replacement coordinator or specialist."
  }
];

export default function HowItWorks() {
  const router = useRouter() as any;
  const [selectedNode, setSelectedNode] = useState(RADAR_NODES[0]);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [playingDetails, setPlayingDetails] = useState({ title: '', url: '', subtitle: '' });
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  const handleNodeSelect = (node: typeof RADAR_NODES[0]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedNode(node);
  };

  const handlePlayVideo = (title: string, url: string, subtitle: string, avatar: string) => {
    setPlayingDetails({ title, url, subtitle });
    setVideoModalVisible(true);
  };

  const handleStartHiring = () => {
    router.push('/employer');
  };

  return (
    <View className="px-6 py-14 bg-white border-t border-zinc-100">
      <Text className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-2">
        How it works
      </Text>
      <Text className="text-3xl font-extrabold text-forest tracking-tight mb-12">
        Our pre-screening process
      </Text>

      {/* Step 1: Intro */}
      <View className="mb-10">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 rounded-full bg-mint/20 items-center justify-center mr-3">
            <Text className="text-forest font-bold text-xs">1</Text>
          </View>
          <Text className="text-xl font-bold text-forest">Intro</Text>
        </View>

        <Text className="text-sm text-zinc-600 leading-relaxed mb-8">
          {"Let's chat! Tell us more about who you're looking for, learn more about our talent pool, and let's see if there's a fit."}
        </Text>

        {/* Circular Radar Chart Layout */}
        <View className="w-full bg-[#FAF9F6] border border-zinc-200/60 rounded-3xl p-6 items-center justify-center mb-6">
          <View className="w-64 h-64 items-center justify-center relative">
            {/* Concentric rings */}
            <View className="absolute w-64 h-64 rounded-full border border-dashed border-zinc-300" />
            <View className="absolute w-44 h-44 rounded-full border border-dashed border-zinc-300" />
            <View className="absolute w-24 h-24 rounded-full border border-dashed border-zinc-300" />
            
            {/* Center Logo/Dot */}
            <View className="w-12 h-12 rounded-full bg-forest border-4 border-white shadow-md items-center justify-center z-10">
              <Text className="text-white font-bold text-sm">hb</Text>
            </View>

            {/* Radar Lines connecting to center */}
            <View className="absolute w-[1px] h-64 bg-zinc-200/50 rotate-0" />
            <View className="absolute w-[1px] h-64 bg-zinc-200/50 rotate-[60deg]" />
            <View className="absolute w-[1px] h-64 bg-zinc-200/50 rotate-[120deg]" />

            {/* Render Nodes */}
            {RADAR_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const Icon = node.icon;
              const nodeStyle = {
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: [{ translateX: -12 }, { translateY: -12 }],
              } as any;
              return (
                <TouchableOpacity
                  key={node.id}
                  onPress={() => handleNodeSelect(node)}
                  style={nodeStyle}
                  className={`w-8 h-8 rounded-full items-center justify-center z-20 shadow-md ${
                    isSelected ? 'bg-forest border-2 border-mint scale-110' : 'bg-white border border-zinc-300'
                  }`}
                  activeOpacity={0.8}
                >
                  <Icon size={12} color={isSelected ? '#8ecfa9' : '#113c2c'} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dynamic Details Card inside Step 1 */}
          <View className="w-full mt-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <View className="flex-row items-center mb-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-mint mr-2" />
              <Text className="text-forest font-bold text-sm">{selectedNode.title}</Text>
            </View>
            <Text className="text-xs text-zinc-500 leading-relaxed">
              {selectedNode.desc}
            </Text>
          </View>
        </View>
      </View>

      {/* Step 2: Match */}
      <View className="mb-10 pb-8 border-b border-zinc-100">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 rounded-full bg-mint/20 items-center justify-center mr-3">
            <Text className="text-forest font-bold text-xs">2</Text>
          </View>
          <Text className="text-xl font-bold text-forest">Match</Text>
        </View>
        <Text className="text-sm text-zinc-600 leading-relaxed">
          {"We pre-screen candidates face-to-face—verifying language, skills, and technology. We'll then match you to qualified candidates for the role at hand based on your exact requirements."}
        </Text>
      </View>

      {/* Step 3: Interview */}
      <View className="mb-10 pb-8 border-b border-zinc-100">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 rounded-full bg-mint/20 items-center justify-center mr-3">
            <Text className="text-forest font-bold text-xs">3</Text>
          </View>
          <Text className="text-xl font-bold text-forest">Interview</Text>
        </View>
        <Text className="text-sm text-zinc-600 leading-relaxed">
          Interview pre-screened, ready-to-hire candidates who are excited to join your team. Follow your regular interview processes, just like you would with any other new hire. You make the final call.
        </Text>
      </View>

      {/* Step 4: Onboard */}
      <View className="mb-12">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 rounded-full bg-mint/20 items-center justify-center mr-3">
            <Text className="text-forest font-bold text-xs">4</Text>
          </View>
          <Text className="text-xl font-bold text-forest">Onboard</Text>
        </View>
        <Text className="text-sm text-zinc-600 leading-relaxed mb-6">
          Meet your dedicated Bloom customer success manager, onboard your new team members, and hit the ground running. We handle contracts and payroll. You control training and management.
        </Text>

        {/* Step 4: Onboard Mockup Card (Sofia, Zanele, David) */}
        <View className="bg-[#FAF9F6] border border-zinc-200/60 rounded-3xl p-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4 border-b border-zinc-100 pb-3">
            <Text className="text-forest font-bold text-xs uppercase tracking-wider">Onboard Team</Text>
            <View className="bg-mint/20 px-2.5 py-0.5 rounded">
              <Text className="text-[9px] text-forest font-bold uppercase">Ready</Text>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-2 mb-4">
            {['Sofia', 'Zanele', 'David'].map((name, idx) => (
              <View key={idx} className="flex-row items-center bg-white border border-zinc-200 px-3 py-1.5 rounded-full mr-1">
                <View className="w-5 h-5 rounded-full bg-forest items-center justify-center mr-1.5 overflow-hidden">
                  {ONBOARD_AVATARS[name] ? (
                    <Image source={ONBOARD_AVATARS[name]} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Text className="text-white text-[9px] font-bold">{name.charAt(0)}</Text>
                  )}
                </View>
                <Text className="text-[10px] text-forest font-bold">{name}</Text>
              </View>
            ))}
          </View>

          <View className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-100">
            <View>
              <Text className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Start Date</Text>
              <Text className="text-xs text-forest font-semibold">March 10, 2026</Text>
            </View>
            <View className="border-t border-zinc-50 pt-2.5">
              <Text className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Role</Text>
              <Text className="text-xs text-forest font-semibold">Technical Support Specialist</Text>
            </View>
            <View className="border-t border-zinc-50 pt-2.5">
              <Text className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Work Schedule</Text>
              <Text className="text-xs text-forest font-semibold">160 hours / month</Text>
            </View>
            <View className="border-t border-zinc-50 pt-2.5">
              <Text className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Payroll Rate</Text>
              <Text className="text-xs text-forest font-semibold">$13 / hour</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Grow Banner */}
      <View className="bg-forestDark rounded-3xl p-6 flex-row justify-between items-center mb-16 shadow-md border border-white/5">
        <View className="flex-1 mr-4">
          <Text className="text-white font-extrabold text-base leading-tight">
            Grow with Hire Bloom today
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleStartHiring()}
          className="bg-mint px-4 py-2.5 rounded-xl active:opacity-95"
        >
          <Text className="text-forest font-bold text-xs">Start hiring</Text>
        </TouchableOpacity>
      </View>

      {/* MEET OUR TALENT SECTION */}
      <View className="mb-16">
        <Text className="text-2xl font-bold text-forest text-center tracking-tight mb-2">
          Meet our talent
        </Text>
        <Text className="text-xs text-zinc-500 text-center mb-8">
          Swipe and tap to play video pitches from our pre-vetted students
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 12 }}
        >
          {TALENT_VIDEOS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handlePlayVideo(item.name, item.url, item.role, item.avatar)}
              className="w-48 bg-zinc-950 rounded-2xl overflow-hidden mr-4 border border-zinc-200 shadow relative active:opacity-90"
              style={{ aspectRatio: 3.2 / 4 }}
            >
              <View className="absolute inset-0 bg-black/30 z-10 justify-center items-center">
                <View className="w-10 h-10 bg-white/25 border border-white/35 rounded-full items-center justify-center shadow">
                  <Play size={16} color="white" fill="white" style={{ marginLeft: 2 }} />
                </View>
              </View>

              <View className="flex-1 justify-between p-3.5 bg-gradient-to-tr from-forest/90 to-slate-800">
                <View className="flex-row justify-between items-center z-20">
                  <View className="w-7 h-7 rounded-full bg-white/10 items-center justify-center">
                    <Text className="text-white font-bold text-[9px]">{item.avatar}</Text>
                  </View>
                  <View className="bg-mint/80 px-1.5 py-0.5 rounded">
                    <Text className="text-[7px] text-forest font-bold uppercase">{item.country}</Text>
                  </View>
                </View>
                <View className="z-20">
                  <Text className="text-white font-bold text-sm">{item.name}</Text>
                  <Text className="text-zinc-300 text-[9px] mt-0.5">{item.role}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CLIENT TESTIMONIALS SECTION */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-forest text-center tracking-tight mb-2">
          Low risk. High trust. Real results.
        </Text>
        <Text className="text-xs text-zinc-500 text-center mb-8">
          See what our clients say about partnering with Hirebloom
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 12 }}
        >
          {CLIENT_TESTIMONIALS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handlePlayVideo(item.company, item.url, `Client Testimonial | ${item.spokesperson}`, 'C')}
              className="w-72 bg-zinc-950 rounded-2xl overflow-hidden mr-4 border border-zinc-200 shadow relative active:opacity-90"
              style={{ aspectRatio: 16 / 9 }}
            >
              <View className="absolute inset-0 bg-black/35 z-10 justify-center items-center">
                <View className="w-12 h-12 bg-white/20 border border-white/30 rounded-full items-center justify-center shadow">
                  <Play size={20} color="white" fill="white" style={{ marginLeft: 3 }} />
                </View>
              </View>

              <View className="flex-1 justify-between p-4 bg-gradient-to-br from-forestDark to-slate-900">
                <View className="z-20 flex-row justify-between items-start">
                  <View className="bg-white/10 px-2.5 py-1 rounded border border-white/5">
                    <Text className="text-white font-bold text-[9px] uppercase tracking-wider">{item.company}</Text>
                  </View>
                  <Text className="text-zinc-300 text-[8px] italic">{item.spokesperson}</Text>
                </View>
                <View className="z-20">
                  <Text className="text-zinc-300 text-[10px] leading-relaxed italic">
                    {item.quote}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* VETTING PROCESS SECTION */}
      <View className="mb-16 bg-forestDark rounded-3xl p-6 shadow-xl border border-white/5 relative overflow-hidden">
        {/* Ambient background blur circles */}
        <View className="absolute w-48 h-48 bg-mint/5 rounded-full -top-10 -left-10" />
        <View className="absolute w-64 h-64 bg-mint/10 rounded-full -bottom-20 -right-20" />

        <View className="flex-col md:flex-row items-center justify-between gap-6 z-10">
          <View className="flex-1">
            <Text className="text-white font-extrabold text-2xl tracking-tight mb-3">
              Our vetting process
            </Text>
            <Text className="text-sm text-zinc-300 mb-4 leading-relaxed">
              Anyone you interview from Hire Bloom will have passed six layers of screening before you even meet them.
            </Text>
            <Text className="text-xs text-mint font-semibold leading-relaxed">
              Only about 9% of reviewed applicants are approved—meaning that you get the best of the best.
            </Text>
          </View>

          <View className="w-full md:w-auto items-center justify-center mt-6 md:mt-0">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative items-center justify-center">
              {/* Card visual matching screenshot */}
              <View className="bg-white rounded-2xl p-5 w-44 shadow-xl border border-zinc-100 items-center justify-center">
                <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-3">
                  <Check size={20} color="#10b981" />
                </View>
                <Text className="text-forest font-bold text-xs text-center mb-0.5">Approved for hire</Text>
                <Text className="text-zinc-400 text-[8px] text-center">Hirebloom Certified</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <View className="mb-16">
        <Text className="text-2xl font-bold text-forest mb-6 tracking-tight">
          Frequently Asked Questions
        </Text>
        <View className="border-t border-zinc-200">
          {FAQ_ITEMS.map((item, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <View key={idx} className="border-b border-zinc-200">
                <TouchableOpacity
                  onPress={() => toggleFaq(idx)}
                  className="py-4 flex-row items-center justify-between active:opacity-75"
                >
                  <Text className="text-xs font-bold text-forest flex-1 pr-4">
                    {item.question}
                  </Text>
                  {isExpanded ? (
                    <Minus size={14} color="#113c2c" />
                  ) : (
                    <Plus size={14} color="#113c2c" />
                  )}
                </TouchableOpacity>
                {isExpanded && (
                  <View className="pb-4 pr-6">
                    <Text className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Video Player Placeholder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={videoModalVisible}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center p-6">
          <View className="bg-white w-full max-w-sm rounded-3xl p-6 border border-zinc-200 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <Video size={18} color="#113c2c" style={{ marginRight: 8 }} />
                <Text className="text-forest font-bold text-sm uppercase tracking-wider">Video Player</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setVideoModalVisible(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 justify-center items-center"
              >
                <X size={16} color="#113c2c" />
              </TouchableOpacity>
            </View>

            {Platform.OS === 'web' ? (
              <View className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden mb-6 relative border border-zinc-200">
                {videoModalVisible && (
                  <iframe
                    src={getYouTubeEmbedUrl(playingDetails.url)}
                    title={playingDetails.title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </View>
            ) : WebView ? (
              <View className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden mb-6 relative border border-zinc-200/50 shadow-inner">
                {videoModalVisible && (
                  <WebView
                    style={{ flex: 1, backgroundColor: '#000' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    source={{ 
                      uri: getYouTubeEmbedUrl(playingDetails.url),
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
                onPress={() => openBrowserAsync(playingDetails.url)}
                className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden mb-6 relative border border-zinc-200/50 shadow-inner"
              >
                {getYouTubeThumbnailUrl(playingDetails.url) ? (
                  <Image
                    source={{ uri: getYouTubeThumbnailUrl(playingDetails.url) }}
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

            <Text className="text-forest font-bold text-base mb-1">{playingDetails.title}</Text>
            <Text className="text-zinc-500 text-xs mb-6">{playingDetails.subtitle}</Text>

            <View className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 mb-6">
              <Text className="text-zinc-400 font-bold text-[9px] uppercase tracking-wider mb-1">Video Stream URL</Text>
              <TextInput 
                value={playingDetails.url}
                className="text-xs text-forest font-mono bg-white border border-zinc-200 px-2 py-1.5 rounded"
                editable={false}
              />
              <Text className="text-[8px] text-zinc-400 mt-2 italic leading-relaxed">
                * This video link is configured inside &apos;src/components/home/HowItWorks.tsx&apos;.
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => setVideoModalVisible(false)}
              className="bg-forest py-3.5 rounded-xl justify-center items-center"
            >
              <Text className="text-white font-bold text-sm">Close Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
