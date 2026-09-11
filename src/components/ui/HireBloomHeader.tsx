import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, HelpCircle, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { NotificationsService } from '@/services/notificationsService';
import { EmailService } from '@/services/emailService';
import EmailInboxModal from './EmailInboxModal';

interface HireBloomHeaderProps {
  portalTitle?: string;
  portalBadge?: string;
  userInitials?: string;
  userEmail?: string;
  showBack?: boolean;
}

export const HireBloomLogoMark = ({ size = 26 }: { size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Path
        d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
        fill="none"
        stroke="#113C2C"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 12 40 L 4 46"
        stroke="#113C2C"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <Path d="M 16 34 L 16 26" stroke="#8ECFA9" strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="16" cy="20" r="3.5" fill="#8ECFA9" />
      
      <Path d="M 25 34 L 25 20" stroke="#8ECFA9" strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="25" cy="14" r="3.5" fill="#8ECFA9" />

      <Path d="M 34 34 L 34 24" stroke="#8ECFA9" strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="34" cy="18" r="3.5" fill="#8ECFA9" />
    </Svg>
  </View>
);

export default function HireBloomHeader({
  portalTitle = 'hirebloom',
  portalBadge = 'Candidate',
  userInitials = 'VT',
  userEmail = 'victor@hirebloom.com',
}: HireBloomHeaderProps) {
  const router = useRouter() as any;
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadUnread = async () => {
    try {
      const count = await NotificationsService.getUnreadCount();
      setUnreadCount(count);
      const emailCount = await EmailService.getUnreadCount(userEmail);
      setUnreadEmailCount(emailCount);
    } catch {
      setUnreadCount(0);
    }
  };

  return (
    <View className="px-5 py-3.5 bg-white border-b border-border flex-row justify-between items-center z-30">
      {/* Brand & Portal Badge */}
      <View className="flex-row items-center">
        <HireBloomLogoMark size={28} />
        <View className="ml-2.5">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-ink tracking-tight font-serif">
              {portalTitle}
            </Text>
            {portalBadge ? (
              <View className="ml-2 bg-mintLight/50 border border-mint/40 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-forest uppercase tracking-wider">
                  {portalBadge}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Right Controls: Mail, Help, Notifications Bell, Avatar */}
      <View className="flex-row items-center space-x-2.5">
        <TouchableOpacity
          onPress={() => setEmailModalVisible(true)}
          className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center relative active:opacity-70"
        >
          <Mail size={17} color="#17352D" />
          {unreadEmailCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-600 min-w-[17px] h-[17px] rounded-full px-1 items-center justify-center border border-white">
              <Text className="text-white text-[9px] font-extrabold">{unreadEmailCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/help')}
          className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center active:opacity-70"
        >
          <HelpCircle size={18} color="#17352D" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center relative active:opacity-70"
        >
          <Bell size={18} color="#17352D" />
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-emerald-700 min-w-[17px] h-[17px] rounded-full px-1 items-center justify-center border border-white">
              <Text className="text-white text-[9px] font-extrabold">{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {userInitials ? (
          <View className="w-9 h-9 rounded-full bg-forest items-center justify-center shadow-sm">
            <Text className="text-white font-bold text-xs tracking-wider">
              {userInitials}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Embedded Email Inbox Modal */}
      <EmailInboxModal
        visible={emailModalVisible}
        onClose={() => {
          setEmailModalVisible(false);
          loadUnread();
        }}
        userEmail={userEmail}
      />
    </View>
  );
}
