import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Edit2, FileText, Globe, Award, Briefcase, Plus, ChevronRight, LogOut, UploadCloud, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { signOut } from 'firebase/auth';
import { ApplicationsService, UserSession } from '@/services/applicationsService';
import { GoogleSignin } from '@/services/googleAuth';
import * as DocumentPicker from 'expo-document-picker';

export default function CandidateProfile() {
  const router = useRouter() as any;
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [resume, setResume] = useState<{ name: string; size: string; url?: string }>({
    name: 'resume_document.pdf',
    size: '1.2 MB'
  });
  const [loomUrl, setLoomUrl] = useState('https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403');
  const [appCount, setAppCount] = useState(3);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await ApplicationsService.getCurrentUser();
    setCurrentUser(user);

    const saved = await ApplicationsService.getSavedCandidateResume();
    if (saved) setResume(saved);

    const savedLoom = await ApplicationsService.getSavedCandidateLoomUrl();
    if (savedLoom) setLoomUrl(savedLoom);

    const apps = await ApplicationsService.getCandidateApplications();
    setAppCount(apps.length);
  };

  const handleUpdateResume = () => {
    Alert.alert(
      "Update Resume",
      "Choose an option to update your active resume:",
      [
        {
          text: "📱 Choose File From Device",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: [
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ],
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const lowerName = (file.name || '').toLowerCase();
                const isValid = lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx');

                if (!isValid) {
                  Alert.alert(
                    "Invalid Document Format",
                    "Only PDF (.pdf) and Microsoft Word (.doc, .docx) files are acceptable for job applications."
                  );
                  return;
                }

                let sizeStr = '1.2 MB';
                if (file.size) {
                  const sizeInKb = Math.round(file.size / 1024);
                  if (sizeInKb > 1024) {
                    sizeStr = `${(sizeInKb / 1024).toFixed(1)} MB`;
                  } else {
                    sizeStr = `${sizeInKb} KB`;
                  }
                }
                const updated = {
                  name: file.name,
                  size: sizeStr,
                  url: file.uri,
                };
                await ApplicationsService.saveCandidateResume(updated);
                setResume(updated);
                Alert.alert("Resume Updated", `Successfully attached "${file.name}" (${sizeStr}). Verified as a valid document.`);
              }
            } catch (err: any) {
              Alert.alert("File Picker Error", err.message || "Could not open document picker.");
            }
          },
        },
        {
          text: "📄 Pre-loaded Sample Resume",
          onPress: async () => {
            const candidatePrefix = (currentUser?.name || 'candidate').toLowerCase().replace(/\s+/g, '_');
            const updated = {
              name: `${candidatePrefix}_resume_2026.pdf`,
              size: '1.4 MB'
            };
            await ApplicationsService.saveCandidateResume(updated);
            setResume(updated);
            Alert.alert("Resume Updated", "Sample PDF resume attached.");
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await ApplicationsService.clearCurrentUser();
      if (!IS_MOCK_FIREBASE && auth) {
        await signOut(auth);
      }
      try {
        await GoogleSignin.signOut();
      } catch {
        // Safe to ignore if not signed in with Google
      }
      router.replace('/login');
    } catch (err: any) {
      console.log('Error signing out:', err);
      router.replace('/login');
    }
  };

  const displayName = currentUser?.name || 'Talent Profile';
  const displayEmail = currentUser?.email || 'talent@hirebloom.com';
  const displayInitials = currentUser?.initials || (currentUser?.name ? ApplicationsService.getInitials(currentUser.name, currentUser.email) : 'HB');

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-5 pt-8 pb-6 border-b border-slate-200">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-row items-center">
              <View className="w-20 h-20 bg-slate-950 rounded-full items-center justify-center border-4 border-white shadow-sm mr-4">
                <Text className="text-white font-extrabold text-2xl">{displayInitials}</Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-slate-900 mb-0.5">{displayName}</Text>
                <Text className="text-emerald-700 font-semibold text-xs mb-1">{displayEmail}</Text>
                <Text className="text-slate-400 text-xs">Customer Support Specialist • Remote</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => Alert.alert("Settings", "Candidate portal settings.")}
              className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
            >
              <Settings color="#475569" size={20} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-4 mb-2">
            <TouchableOpacity 
              onPress={() => router.push('/candidate/applications')}
              className="flex-1 bg-mint/20 py-3 rounded-xl border border-mint/40 items-center active:opacity-80"
            >
              <Text className="text-xl font-bold text-forest mb-0.5">{appCount}</Text>
              <Text className="text-forest/80 text-xs font-semibold">Track Status</Text>
            </TouchableOpacity>
            <View className="flex-1 bg-purple-50 py-3 rounded-xl border border-purple-200 items-center">
              <Text className="text-xl font-bold text-purple-900 mb-0.5">1</Text>
              <Text className="text-purple-700 text-xs font-semibold">Interviews</Text>
            </View>
            <View className="flex-1 bg-emerald-50 py-3 rounded-xl border border-emerald-200 items-center">
              <Text className="text-xl font-bold text-emerald-900 mb-0.5">1</Text>
              <Text className="text-emerald-700 text-xs font-semibold">Offers</Text>
            </View>
          </View>
        </View>

        {/* Experience Section */}
        <View className="px-5 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">Experience</Text>
            <TouchableOpacity className="w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
              <Plus color="#113c2c" size={18} />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <View className="flex-row items-start mb-4">
              <View className="w-12 h-12 bg-indigo-50 rounded-lg items-center justify-center mr-4">
                <Briefcase color="#4338ca" size={24} />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text className="text-lg font-bold text-slate-900">Senior Support Lead</Text>
                  <TouchableOpacity><Edit2 color="#94a3b8" size={16} /></TouchableOpacity>
                </View>
                <Text className="text-forest font-bold mb-1">Global Customer Support</Text>
                <Text className="text-zinc-400 font-medium mb-1">InnovateX Partner Team</Text>
                <Text className="text-slate-400 text-sm mb-2">Jan 2022 - Present • 3 yrs</Text>
                <Text className="text-slate-600 leading-relaxed text-sm">
                  Managed multi-channel Zendesk queues, achieving 98% CSAT rating. Lead weekly onboarding syncs for US-based remote team members.
                </Text>
              </View>
            </View>
            
            <View className="w-full h-[1px] bg-slate-100 my-2" />
            
            <TouchableOpacity className="flex-row items-center justify-center py-2">
              <Text className="text-slate-500 font-medium mr-1">View verified references</Text>
              <ChevronRight color="#64748b" size={16} />
            </TouchableOpacity>
          </View>

          {/* Documents & Resume Section */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-slate-900">Resume & Documents</Text>
            <TouchableOpacity onPress={handleUpdateResume} className="flex-row items-center">
              <UploadCloud size={14} color="#059669" style={{ marginRight: 4 }} />
              <Text className="text-emerald-700 font-bold text-xs">Update CV</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 mb-6">
            <TouchableOpacity 
              onPress={handleUpdateResume}
              className="flex-row items-center p-3 border-b border-slate-100 active:opacity-80"
            >
              <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3 border border-red-200">
                <FileText color="#dc2626" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-sm">{resume.name}</Text>
                <Text className="text-zinc-500 text-xs">{resume.size} • Auto-attaches to job applications</Text>
              </View>
              <View className="bg-emerald-100 px-2 py-0.5 rounded-md flex-row items-center mr-2">
                <Check size={11} color="#059669" strokeWidth={3} style={{ marginRight: 2 }} />
                <Text className="text-[10px] font-bold text-emerald-800">Active</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-3">
              <View className="w-10 h-10 bg-slate-100 rounded-lg items-center justify-center mr-3">
                <Globe color="#475569" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-sm">Professional Profile</Text>
                <Text className="text-forest text-xs">talent.hirebloom.com/p/victor</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
          </View>

          {/* Loom Video Pitch Card */}
          <View className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-indigo-600 items-center justify-center mr-2 shadow-sm">
                  <Text className="text-white text-[11px] font-black">▶</Text>
                </View>
                <Text className="text-slate-900 font-bold text-sm">Loom Video Pitch</Text>
              </View>
              <View className="bg-emerald-100 px-2 py-0.5 rounded-md flex-row items-center">
                <Check size={11} color="#059669" strokeWidth={3} style={{ marginRight: 3 }} />
                <Text className="text-[10px] font-bold text-emerald-800">Verified</Text>
              </View>
            </View>

            <Text className="text-slate-500 text-xs mb-3 leading-relaxed">
              Your 2-minute introductory video is attached to every application for client partners to review verbal fluency.
            </Text>

            <View className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-indigo-950 font-bold text-xs" numberOfLines={1}>
                  {loomUrl}
                </Text>
                <Text className="text-indigo-700 text-[10px]">C1 English & Workstation Walkthrough</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(loomUrl)}
                className="bg-indigo-600 px-3 py-1.5 rounded-lg active:opacity-90"
              >
                <Text className="text-white font-bold text-xs">Watch</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vetting Status Card */}
          <View className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-4 mb-6 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
              <Award color="#10b981" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-forest font-bold text-xs mb-0.5">HireBloom Talent Network Vetted</Text>
              <Text className="text-slate-500 text-[10px] leading-tight">
                English C1 Verified • Hardware & Camera Passed • Ready for Client Intro
              </Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-center justify-between active:opacity-75 shadow-sm mb-12"
          >
            <View className="flex-row items-center">
              <LogOut color="#dc2626" size={18} style={{ marginRight: 10 }} />
              <Text className="text-red-600 font-bold text-sm">Sign Out Account</Text>
            </View>
            <ChevronRight color="#dc2626" size={16} />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
