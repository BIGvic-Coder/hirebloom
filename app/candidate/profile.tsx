import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Settings, Edit2, FileText, Globe, Award, Briefcase, Plus, ChevronRight, LogOut, UploadCloud, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { signOut } from 'firebase/auth';
import { ApplicationsService, UserSession } from '@/services/applicationsService';

export default function CandidateProfile() {
  const router = useRouter() as any;
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [resume, setResume] = useState<{ name: string; size: string; url?: string }>({
    name: 'victor_resume_2026.pdf',
    size: '1.4 MB'
  });
  const [appCount, setAppCount] = useState(3);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await ApplicationsService.getCurrentUser();
    setCurrentUser(user);

    const saved = await ApplicationsService.getSavedCandidateResume();
    if (saved) setResume(saved);

    const apps = await ApplicationsService.getCandidateApplications();
    setAppCount(apps.length);
  };

  const handleUpdateResume = () => {
    Alert.alert(
      "Update Resume",
      "Upload or replace your active resume in your HireBloom profile:",
      [
        {
          text: "Upload Standard CV (PDF)",
          onPress: async () => {
            const updated = {
              name: `${(currentUser?.name || 'Victor').toLowerCase()}_resume_2026.pdf`,
              size: '1.4 MB'
            };
            await ApplicationsService.saveCandidateResume(updated);
            setResume(updated);
            Alert.alert("Resume Updated", "Your profile resume has been updated and will automatically attach to future job applications.");
          }
        },
        {
          text: "Upload Tailored Support CV (DOCX)",
          onPress: async () => {
            const updated = {
              name: `${(currentUser?.name || 'Victor').toLowerCase()}_support_specialist_cv.docx`,
              size: '890 KB'
            };
            await ApplicationsService.saveCandidateResume(updated);
            setResume(updated);
            Alert.alert("Resume Updated", "Your profile resume has been updated.");
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
      if (!IS_MOCK_FIREBASE && auth) {
        await signOut(auth);
      }
      router.replace('/login');
    } catch (err: any) {
      console.log('Error signing out:', err);
      router.replace('/login');
    }
  };

  const displayName = currentUser?.name || 'Victor Taiwo';
  const displayEmail = currentUser?.email || 'victor@hirebloom.com';
  const displayInitials = currentUser?.initials || 'VT';

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
