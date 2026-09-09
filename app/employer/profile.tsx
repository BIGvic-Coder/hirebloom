import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Building2, Mail, MapPin, Globe, ShieldCheck, CreditCard, Users, Bell, LogOut, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { signOut } from 'firebase/auth';

export default function EmployerProfile() {
  const router = useRouter() as any;
  const [notifyApplications, setNotifyApplications] = useState(true);
  const [autoFastTrack, setAutoFastTrack] = useState(true);
  const [byuPathwayPreference, setByuPathwayPreference] = useState(true);

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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Banner */}
        <View className="bg-forest px-6 pt-10 pb-8 border-b border-mint/20">
          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 bg-mint rounded-2xl items-center justify-center mr-4 border-2 border-white/20 shadow-md">
              <Text className="text-forest font-extrabold text-2xl font-serif">T</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold text-white mr-2">TechNova Inc.</Text>
                <View className="bg-mint/25 px-2 py-0.5 rounded border border-mint/40">
                  <Text className="text-mint font-extrabold text-[9px] uppercase">Verified Employer</Text>
                </View>
              </View>
              <Text className="text-zinc-300 text-xs mt-0.5">SaaS & Customer Operations</Text>
              <View className="flex-row items-center mt-2 space-x-3">
                <View className="flex-row items-center">
                  <MapPin size={12} color="#8ecfa9" style={{ marginRight: 4 }} />
                  <Text className="text-zinc-300 text-[11px]">Austin, TX • Remote</Text>
                </View>
                <View className="flex-row items-center">
                  <Globe size={12} color="#8ecfa9" style={{ marginRight: 4 }} />
                  <Text className="text-zinc-300 text-[11px]">technova.io</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View className="flex-row bg-white/10 rounded-2xl p-4 border border-white/10">
            <View className="flex-1 items-center border-r border-white/10">
              <Text className="text-xl font-bold text-white">12</Text>
              <Text className="text-mintLight text-[10px] uppercase font-bold mt-0.5">Active Staff</Text>
            </View>
            <View className="flex-1 items-center border-r border-white/10">
              <Text className="text-xl font-bold text-white">4</Text>
              <Text className="text-mintLight text-[10px] uppercase font-bold mt-0.5">Open Roles</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white">98%</Text>
              <Text className="text-mintLight text-[10px] uppercase font-bold mt-0.5">Retention</Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-6">
          {/* Active Contract & Staffing Plan */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <CreditCard size={18} color="#113c2c" style={{ marginRight: 8 }} />
                <Text className="text-forest font-bold text-base">Embedded Team Plan</Text>
              </View>
              <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <Text className="text-emerald-700 font-extrabold text-[10px]">ACTIVE</Text>
              </View>
            </View>

            <Text className="text-slate-500 text-xs leading-relaxed mb-4">
              Flat rate <Text className="font-bold text-forest">$13.00/hour</Text> per placed team member. Payroll, international compliance, and contracts managed by Hirebloom.
            </Text>

            <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2 space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-500 text-xs font-medium">Dedicated Coordinator</Text>
                <Text className="text-forest font-bold text-xs">Sarah Jenkins (Hirebloom)</Text>
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-200/50">
                <Text className="text-slate-500 text-xs font-medium">Billing Cycle</Text>
                <Text className="text-forest font-bold text-xs">Bi-weekly Auto-invoice</Text>
              </View>
            </View>
          </View>

          {/* Sourcing & Screening Preferences */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
            <View className="flex-row items-center mb-4">
              <Sparkles size={18} color="#113c2c" style={{ marginRight: 8 }} />
              <Text className="text-forest font-bold text-base">Hiring Filters & Defaults</Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-slate-100">
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 font-bold text-xs mb-0.5">BYU-Pathway Grads Preferred</Text>
                <Text className="text-slate-500 text-[10px] leading-normal">
                  Prioritize US-accredited higher-ed talent with strong English fluency.
                </Text>
              </View>
              <Switch
                value={byuPathwayPreference}
                onValueChange={setByuPathwayPreference}
                trackColor={{ false: '#d4d4d8', true: '#8ecfa9' }}
                thumbColor={byuPathwayPreference ? '#113c2c' : '#f4f4f5'}
              />
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-slate-100">
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 font-bold text-xs mb-0.5">Instant AI Matching</Text>
                <Text className="text-slate-500 text-[10px] leading-normal">
                  Automatically score and rank new applicant video pitches upon submission.
                </Text>
              </View>
              <Switch
                value={autoFastTrack}
                onValueChange={setAutoFastTrack}
                trackColor={{ false: '#d4d4d8', true: '#8ecfa9' }}
                thumbColor={autoFastTrack ? '#113c2c' : '#f4f4f5'}
              />
            </View>

            <View className="flex-row justify-between items-center py-3">
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 font-bold text-xs mb-0.5">Pipeline Activity Alerts</Text>
                <Text className="text-slate-500 text-[10px] leading-normal">
                  Send real-time alerts when candidate completes technical pre-screening.
                </Text>
              </View>
              <Switch
                value={notifyApplications}
                onValueChange={setNotifyApplications}
                trackColor={{ false: '#d4d4d8', true: '#8ecfa9' }}
                thumbColor={notifyApplications ? '#113c2c' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* Hiring Team */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Users size={18} color="#113c2c" style={{ marginRight: 8 }} />
                <Text className="text-forest font-bold text-base">Hiring Team</Text>
              </View>
              <TouchableOpacity>
                <Text className="text-emerald-700 font-bold text-xs">+ Invite</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-full bg-forest items-center justify-center mr-3">
                    <Text className="text-white font-bold text-xs">DV</Text>
                  </View>
                  <View>
                    <Text className="text-slate-900 font-bold text-xs">David Vance</Text>
                    <Text className="text-slate-400 text-[10px]">Director of Ops • Admin</Text>
                  </View>
                </View>
                <View className="bg-mint/20 px-2 py-0.5 rounded border border-mint/30">
                  <Text className="text-forest font-bold text-[9px]">Primary</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sign Out Action */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-full bg-red-50 border border-red-200 rounded-3xl p-5 flex-row items-center justify-between active:opacity-75 shadow-sm mb-8"
          >
            <View className="flex-row items-center">
              <LogOut color="#dc2626" size={18} style={{ marginRight: 10 }} />
              <Text className="text-red-600 font-bold text-sm">Sign Out Organization</Text>
            </View>
            <ChevronRight color="#dc2626" size={16} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
