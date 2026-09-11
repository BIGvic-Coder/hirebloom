import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, HelpCircle, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { NotificationsService } from '@/services/notificationsService';
import { EmailService } from '@/services/emailService';
import { ApplicationsService } from '@/services/applicationsService';
import EmailInboxModal from './EmailInboxModal';
import HireBloomLogoMark from './HireBloomLogoMark';

interface HireBloomHeaderProps {
  portalTitle?: string;
  portalBadge?: string;
  userInitials?: string;
  userEmail?: string;
  showBack?: boolean;
}

export { HireBloomLogoMark };

export default function HireBloomHeader({
  portalTitle = 'hirebloom',
  portalBadge = 'Candidate',
  userInitials = 'VT',
  userEmail,
}: HireBloomHeaderProps) {
  const router = useRouter() as any;
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const [activeEmail, setActiveEmail] = useState(userEmail || 'victor@hirebloom.com');
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 3000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const loadUnread = async () => {
    try {
      let emailToUse = userEmail;
      if (!emailToUse) {
        const user = await ApplicationsService.getCurrentUser();
        if (user?.email) {
          emailToUse = user.email;
        }
      }
      const finalEmail = emailToUse || 'victor@hirebloom.com';
      setActiveEmail(finalEmail);

      const count = await NotificationsService.getUnreadCount();
      setUnreadCount(count);
      const emailCount = await EmailService.getUnreadCount(finalEmail);
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
        userEmail={activeEmail}
      />
    </View>
  );
}
