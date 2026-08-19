import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Sliders, Bell, Shield, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function RecruiterSettings() {
  const router = useRouter();
  const [fluencyThresh, setFluencyThresh] = useState(true);
  const [notifyNewApp, setNotifyNewApp] = useState(true);
  const [requireHomeOfficeCheck, setRequireHomeOfficeCheck] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-extrabold text-forest mb-2">Settings</Text>
        <Text className="text-zinc-500 text-sm mb-8">Manage system vetting thresholds and alerts.</Text>

        {/* Sliders / Screening Controls */}
        <View className="bg-white rounded-3xl border border-zinc-200/60 p-5 shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <Sliders color="#113c2c" size={18} style={{ marginRight: 8 }} />
            <Text className="text-forest font-bold text-base">Grading Parameters</Text>
          </View>

          {/* Setting item 1 */}
          <View className="flex-row justify-between items-center py-3 border-b border-zinc-100">
            <View className="flex-1 pr-4">
              <Text className="text-forest font-bold text-xs mb-0.5">Strict English Vetting</Text>
              <Text className="text-zinc-400 text-[10px] leading-normal">
                Enforce C1/C2 speaking requirements for customer support match indexing.
              </Text>
            </View>
            <Switch
              value={fluencyThresh}
              onValueChange={setFluencyThresh}
              trackColor={{ false: '#d4d4d8', true: '#8ecfa9' }}
              thumbColor={fluencyThresh ? '#113c2c' : '#f4f4f5'}
            />
          </View>

          {/* Setting item 2 */}
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-1 pr-4">
              <Text className="text-forest font-bold text-xs mb-0.5">Mandatory Office Check</Text>
              <Text className="text-zinc-400 text-[10px] leading-normal">
                Flag candidates who have not completed speedtest and battery-backup verification.
              </Text>
            </View>
            <Switch
              value={requireHomeOfficeCheck}
              onValueChange={setRequireHomeOfficeCheck}
              trackColor={{ false: '#d4d4d8', true: '#8ecfa9' }}
              thumbColor={requireHomeOfficeCheck ? '#113c2c' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Notifications config */}
        <View className="bg-white rounded-3xl border border-zinc-200/60 p-5 shadow-sm mb-8">
          <View className="flex-row items-center mb-4">
            <Bell color="#113c2c" size={18} style={{ marginRight: 8 }} />
            <Text className="text-forest font-bold text-base">Notifications</Text>
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View className="flex-1 pr-4">
              <Text className="text-forest font-bold text-xs mb-0.5">Alert on Assessment Submit</Text>
              <Text className="text-zinc-400 text-[10px] leading-normal">
                Notify when a BYU-Pathway candidate completes verbal English speech verification.
              </Text>
            </View>
            <Switch
              value={notifyNewApp}
              onValueChange={setNotifyNewApp}
              trackColor={{ false: '#d4d4d8', true: '#8ecfa9' }}
              thumbColor={notifyNewApp ? '#113c2c' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="w-full bg-red-50 border border-red-200 rounded-3xl p-5 flex-row items-center justify-between active:opacity-75 mb-12 shadow-sm"
        >
          <View className="flex-row items-center">
            <LogOut color="#dc2626" size={18} style={{ marginRight: 10 }} />
            <Text className="text-red-600 font-bold text-sm">Sign Out Portal</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
