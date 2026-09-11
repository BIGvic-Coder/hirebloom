import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Users, ShieldCheck, Mail, Phone, Calendar, Clock, DollarSign, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rate: string;
  hours: string;
  timezone: string;
  startDate: string;
  english: string;
  manager: string;
  status: 'Active';
}

const ACTIVE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Victor Taiwo',
    role: 'Senior Customer Support Lead',
    avatar: 'VT',
    rate: '$15.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Sep 2026',
    english: 'C1 Fluent',
    manager: 'David Vance (TechNova)',
    status: 'Active',
  },
  {
    id: 'team-2',
    name: 'Elena Rodriguez',
    role: 'Product Designer',
    avatar: 'ER',
    rate: '$16.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Aug 2026',
    english: 'C2 Bilingual',
    manager: 'Marcus Peterson (TechNova)',
    status: 'Active',
  },
  {
    id: 'team-3',
    name: 'Michael Chen',
    role: 'Front-End Support Specialist',
    avatar: 'MC',
    rate: '$14.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US CST (8 AM - 4 PM)',
    startDate: 'Jul 2026',
    english: 'C1 Fluent',
    manager: 'David Vance (TechNova)',
    status: 'Active',
  },
];

export default function EmployerTeam() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Header */}
      <HireBloomHeader portalTitle="hirebloom" portalBadge="Active Team" userInitials="TN" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Title Block */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-inkMuted uppercase tracking-wider mb-1">
            Embedded Remote Staff
          </Text>
          <Text className="text-2xl font-bold text-ink font-serif">
            Active Team Members
          </Text>
          <Text className="text-xs text-inkMuted mt-1">
            Managed payroll, compliance, and equipment support by Hire Bloom
          </Text>
        </View>

        {/* Contract & Model Overview Banner */}
        <View className="bg-forest rounded-3xl p-5 mb-6 text-white shadow-md">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold text-mintLight uppercase tracking-wider">
              Embedded Team Agreement
            </Text>
            <View className="bg-mint px-2 py-0.5 rounded-full">
              <Text className="text-forest font-extrabold text-[9px]">ACTIVE</Text>
            </View>
          </View>

          <Text className="text-sm font-bold text-white mb-3">
            Flat Rate Billing • Zero Placement Fees
          </Text>

          <View className="flex-row items-center justify-between pt-3 border-t border-white/10">
            <View>
              <Text className="text-[9px] uppercase text-zinc-300 font-bold">Total Placed</Text>
              <Text className="text-lg font-extrabold text-white">3 Team Members</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase text-zinc-300 font-bold">Retention Target</Text>
              <Text className="text-lg font-extrabold text-mint">70% First-Year</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase text-zinc-300 font-bold">Payroll Admin</Text>
              <Text className="text-xs font-bold text-white">Bi-weekly USD</Text>
            </View>
          </View>
        </View>

        {/* Team Members List */}
        <Text className="text-sm font-bold text-ink mb-3">Placed Staff</Text>
        <View className="space-y-4 mb-8">
          {ACTIVE_TEAM_MEMBERS.map((member) => (
            <View
              key={member.id}
              className="bg-white rounded-3xl p-5 border border-border shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-12 h-12 bg-mintLight/40 rounded-2xl items-center justify-center mr-3 border border-mint/25">
                    <Text className="text-forest font-extrabold text-base">{member.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-ink leading-tight">{member.name}</Text>
                    <Text className="text-xs font-semibold text-emerald-800">{member.role}</Text>
                  </View>
                </View>
                <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <Text className="text-emerald-700 font-extrabold text-[9px]">ACTIVE</Text>
                </View>
              </View>

              <View className="bg-canvas rounded-2xl p-3.5 space-y-2 mb-4 border border-border">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-inkMuted">Contract Rate</Text>
                  <Text className="text-xs font-bold text-ink">{member.rate}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-inkMuted">Working Hours</Text>
                  <Text className="text-xs font-semibold text-ink">{member.timezone}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-inkMuted">English Certification</Text>
                  <Text className="text-xs font-semibold text-forest">{member.english}</Text>
                </View>
                <View className="flex-row justify-between items-center pt-1.5 border-t border-border">
                  <Text className="text-xs text-inkMuted">Start Date</Text>
                  <Text className="text-xs font-bold text-ink">{member.startDate}</Text>
                </View>
              </View>

              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => Alert.alert("Message Team Member", `Opening direct communication sync for ${member.name}.`)}
                  className="flex-1 bg-forest py-2.5 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
                >
                  <MessageSquare size={13} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-xs">Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => Alert.alert("Workstation Verified", `${member.name}'s equipment, camera, and UPS battery backup have passed Layer 4 inspection.`)}
                  className="px-3.5 bg-canvas border border-border rounded-xl items-center justify-center active:opacity-75"
                >
                  <ShieldCheck size={16} color="#113C2C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
