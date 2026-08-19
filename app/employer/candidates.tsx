import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Platform, Image } from 'react-native';
import { Search, Filter, Star, MessageSquare, X, Play, Sparkles, CheckCircle } from 'lucide-react-native';
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
  const baseUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=1`;
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

const candidates = [
  { 
    id: 1, 
    name: 'Sarah Jenkins', 
    role: 'Senior Frontend Engineer', 
    stage: 'Interview', 
    match: '98%', 
    image: 'S',
    videoUrl: 'https://youtu.be/HO4sLYt4xE4',
    summary: 'Sarah demonstrates outstanding technical acumen in modern React architectures. She has 5+ years of production experience scaling SaaS layouts. Fluency is 100% native with great remote work setup.',
    evaluations: [
      { category: 'Technical Skills', score: '98/100' },
      { category: 'System Architecture', score: '95/100' },
      { category: 'Communication', score: '10/10' },
      { category: 'Workstation Setup', score: 'Pass (High Bandwidth)' }
    ],
    questions: [
      { q: 'Tell me about a complex state management problem you solved.', a: 'Sarah explained a large-scale redux-saga to context API migration reducing render times by 40%.' },
      { q: 'How do you handle API latency in client applications?', a: 'She detailed optimistic UI updates, local caching, and custom loading states.' }
    ]
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    role: 'Senior Frontend Engineer', 
    stage: 'Screening', 
    match: '92%', 
    image: 'M',
    videoUrl: 'https://youtu.be/fzjEdRuJIeM',
    summary: 'Michael is a senior React Native developer with a strong background in core performance optimization. Outstanding knowledge of rendering lifecycles and bundle footprint reduction.',
    evaluations: [
      { category: 'Technical Skills', score: '92/100' },
      { category: 'Mobile Performance', score: '94/100' },
      { category: 'Communication', score: '9/10' },
      { category: 'Workstation Setup', score: 'Pass' }
    ],
    questions: [
      { q: 'How do you optimize flatlist rendering in React Native?', a: 'He detailed getItemLayout, initialNumToRender, and custom keyExtractor implementations.' }
    ]
  },
  { 
    id: 3, 
    name: 'Elena Rodriguez', 
    role: 'Product Designer', 
    stage: 'Offer Sent', 
    match: '95%', 
    image: 'E',
    videoUrl: 'https://youtu.be/6gp0chLzck0',
    summary: 'Elena is a product designer with a robust engineering empathy. She specializes in design systems, accessible UI patterns (WCAG), and rapid high-fidelity interactive prototyping.',
    evaluations: [
      { category: 'UI Design', score: '96/100' },
      { category: 'UX Research', score: '92/100' },
      { category: 'Communication', score: '10/10' },
      { category: 'Figma Mastery', score: '100/100' }
    ],
    questions: [
      { q: 'Describe your process for building a reusable design component library.', a: 'Elena walked through tokenizing variables, accessibility audits, and developers handoffs.' }
    ]
  },
  { 
    id: 4, 
    name: 'David Kim', 
    role: 'Backend Developer', 
    stage: 'Applied', 
    match: '88%', 
    image: 'D',
    videoUrl: 'https://youtu.be/0fRhZS4pGrQ',
    summary: 'David focuses on microservices in Node.js and Go. Solid database indexing, cache layers (Redis), and event-driven architecture using Kafka.',
    evaluations: [
      { category: 'Backend Architecture', score: '90/100' },
      { category: 'Database Query Tuning', score: '88/100' },
      { category: 'Communication', score: '8.5/10' },
      { category: 'Workstation Setup', score: 'Pass' }
    ],
    questions: [
      { q: 'How do you prevent race conditions in highly concurrent API endpoints?', a: 'David explained optimistic lock version numbers and distributed locks via Redis.' }
    ]
  },
  { 
    id: 5, 
    name: 'Jessica Taylor', 
    role: 'Product Designer', 
    stage: 'Applied', 
    match: '85%', 
    image: 'J',
    videoUrl: 'https://youtu.be/yAqwkXy9W2U',
    summary: 'Jessica is an end-to-end UX/UI designer with a background in user testing and data-driven product iterations. She converts complex user funnels into simple visual interfaces.',
    evaluations: [
      { category: 'Visual Design', score: '85/100' },
      { category: 'UX Mapping', score: '88/100' },
      { category: 'Communication', score: '9/10' },
      { category: 'Workstation Setup', score: 'Pass' }
    ],
    questions: [
      { q: 'How do you handle client feedback that goes against research findings?', a: 'Jessica utilizes visual A/B test results and telemetry metrics to align stakeholders.' }
    ]
  }
];

export default function EmployerCandidates() {
  const [selectedCandidate, setSelectedCandidate] = useState<typeof candidates[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiAnalysisTab, setAiAnalysisTab] = useState<'summary' | 'scores' | 'transcript'>('summary');

  const handleSelectCandidate = (candidate: typeof candidates[0]) => {
    setSelectedCandidate(candidate);
    setAiAnalysisTab('summary');
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <Text className="text-3xl font-bold text-slate-900 mb-6">Pipeline</Text>

        {/* Search Bar */}
        <View className="flex-row mb-6 gap-3">
          <View className="flex-1 flex-row items-center bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <Search color="#94a3b8" size={20} className="mr-3" />
            <TextInput 
              placeholder="Search candidates..." 
              className="flex-1 text-slate-900 font-medium"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity className="w-12 bg-white rounded-xl border border-slate-200 items-center justify-center shadow-sm">
            <Filter color="#475569" size={20} />
          </TouchableOpacity>
        </View>

        {/* Pipeline Stages */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-10">
          {['All', 'Applied (2)', 'Screening (1)', 'Interview (1)', 'Offer (1)'].map((stage, index) => (
            <TouchableOpacity 
              key={index} 
              className={`px-4 py-2 rounded-full mr-2 justify-center ${index === 0 ? 'bg-forest' : 'bg-white border border-slate-200'}`}
            >
              <Text className={`font-bold text-sm ${index === 0 ? 'text-white' : 'text-slate-600'}`}>
                {stage}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Candidates List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {candidates.map((candidate) => (
            <TouchableOpacity 
              key={candidate.id} 
              onPress={() => handleSelectCandidate(candidate)}
              className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm active:opacity-80"
            >
              <View className="flex-row items-start">
                <View className="w-14 h-14 bg-mintLight rounded-full items-center justify-center mr-4 mt-1 border border-mint/20">
                  <Text className="text-forest font-bold text-xl">{candidate.image}</Text>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-lg font-bold text-slate-900">{candidate.name}</Text>
                    <View className="bg-mint/20 px-2 py-1 rounded border border-mint/30 flex-row items-center">
                      <Sparkles color="#113c2c" size={10} style={{ marginRight: 4 }} />
                      <Text className="text-forest font-bold text-xs">{candidate.match} Match</Text>
                    </View>
                  </View>
                  
                  <Text className="text-slate-500 font-medium mb-3">{candidate.role}</Text>
                  
                  <View className="flex-row justify-between items-center mt-1">
                    <View className="bg-mint/10 px-3 py-1 rounded-full border border-mint/20">
                      <Text className="text-forest font-semibold text-xs">{candidate.stage}</Text>
                    </View>
                    
                    <View className="flex-row gap-3">
                      <TouchableOpacity className="p-2 bg-slate-50 rounded-full border border-slate-100">
                        <MessageSquare color="#64748b" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity className="p-2 bg-slate-50 rounded-full border border-slate-100">
                        <Star color="#64748b" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Candidate Pre-Screen Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedCandidate(null);
        }}
      >
        <View className="flex-1 bg-black/85 justify-end">
          {selectedCandidate && (
            <View className="bg-forestDark w-full rounded-t-3xl p-6 border-t border-zinc-800" style={{ maxHeight: '90%' }}>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <Sparkles size={20} color="#8ecfa9" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-lg">Candidate Pre-Screen</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedCandidate(null);
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* Candidate Info Card */}
              <View className="bg-forest p-4 rounded-2xl border border-mint/20 flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-mint/20 items-center justify-center mr-3">
                    <Text className="text-mint font-bold text-lg font-serif">{selectedCandidate.image}</Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold text-base">{selectedCandidate.name}</Text>
                    <Text className="text-zinc-400 text-xs">{selectedCandidate.role} | {selectedCandidate.stage}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-mint font-extrabold text-lg">{selectedCandidate.match}</Text>
                  <Text className="text-zinc-400 text-[10px]">AI MATCH RATE</Text>
                </View>
              </View>

              {/* Video Player Block */}
              {Platform.OS === 'web' ? (
                <View className="w-full bg-zinc-950 rounded-xl aspect-video overflow-hidden mb-6 relative border border-zinc-800">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedCandidate.videoUrl)}
                    title={`${selectedCandidate.name} - Pitch`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </View>
              ) : WebView ? (
                <View className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden mb-6 relative border border-zinc-800/50 shadow-inner">
                  <WebView
                    style={{ flex: 1, backgroundColor: '#000' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    originWhitelist={['*']}
                    source={{ 
                      html: `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <style>
                              body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #000; overflow: hidden; }
                              iframe { width: 100%; height: 100%; border: none; }
                            </style>
                          </head>
                          <body>
                            <iframe 
                              src="${getYouTubeEmbedUrl(selectedCandidate.videoUrl)}" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              allowfullscreen
                            ></iframe>
                          </body>
                        </html>
                      `,
                      baseUrl: 'https://www.youtube.com'
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openBrowserAsync(selectedCandidate.videoUrl)}
                  className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden mb-6 relative border border-zinc-800/50 shadow-inner"
                >
                  {getYouTubeThumbnailUrl(selectedCandidate.videoUrl) ? (
                    <Image
                      source={{ uri: getYouTubeThumbnailUrl(selectedCandidate.videoUrl) }}
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
                  </View>
                </TouchableOpacity>
              )}

              {/* Tab Navigation */}
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

              {/* Tab Contents Scroll */}
              <ScrollView className="max-h-56" showsVerticalScrollIndicator={false}>
                {aiAnalysisTab === 'summary' && (
                  <View className="space-y-4">
                    <View className="bg-forest/50 p-4 rounded-xl border border-mint/10 mb-3">
                      <Text className="text-mint font-bold text-xs mb-1.5 uppercase tracking-wider">Vetting & Screening Summary</Text>
                      <Text className="text-zinc-300 text-sm leading-relaxed">{selectedCandidate.summary}</Text>
                    </View>
                    <View className="flex-row items-center bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/30">
                      <CheckCircle size={16} color="#10b981" style={{ marginRight: 6 }} />
                      <Text className="text-[11px] text-zinc-300">Identity, education, and workstation checked.</Text>
                    </View>
                  </View>
                )}

                {aiAnalysisTab === 'scores' && (
                  <View className="space-y-2">
                    {selectedCandidate.evaluations.map((evalItem, idx) => (
                      <View key={idx} className="bg-forest/40 border border-mint/10 p-3.5 rounded-xl flex-row justify-between items-center mb-2">
                        <Text className="text-zinc-300 text-xs font-semibold">{evalItem.category}</Text>
                        <Text className="text-mint font-bold text-xs">{evalItem.score}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {aiAnalysisTab === 'transcript' && (
                  <View className="space-y-4">
                    {selectedCandidate.questions.map((qItem, idx) => (
                      <View key={idx} className="bg-forest/30 border border-zinc-800 p-4 rounded-xl mb-3">
                        <Text className="text-mint font-bold text-xs mb-1.5">{qItem.q}</Text>
                        <Text className="text-zinc-300 text-xs leading-relaxed">{qItem.a}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setSelectedCandidate(null);
                }}
                className="bg-forest mt-6 py-3.5 rounded-xl justify-center items-center border border-mint/10"
              >
                <Text className="text-white font-bold text-sm">Close Report</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
