import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Bell, HelpCircle, Mail, Crown, Briefcase, Building2, LogOut, ChevronRight, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { NotificationsService } from '@/services/notificationsService';
import { EmailService } from '@/services/emailService';
import { ApplicationsService } from '@/services/applicationsService';
import EmailInboxModal from './EmailInboxModal';
import HireBloomLogoMark from './HireBloomLogoMark';
import ExecutivePasscodeModal from './ExecutivePasscodeModal';

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
  userInitials,
  userEmail,
}: HireBloomHeaderProps) {
  const router = useRouter() as any;
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const [activeEmail, setActiveEmail] = useState(userEmail || '');
  const [activeInitials, setActiveInitials] = useState(userInitials || 'HB');
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isPasscodeModalVisible, setIsPasscodeModalVisible] = useState(false);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 3000);
    return () => clearInterval(interval);
  }, [userEmail, userInitials]);

  const loadUnread = async () => {
    try {
      let emailToUse = userEmail;
      let initialsToUse = userInitials;

      const user = await ApplicationsService.getCurrentUser();
      if (!emailToUse && user?.email) {
        emailToUse = user.email;
      }
      if (!initialsToUse && user) {
        initialsToUse = user.initials || ApplicationsService.getInitials(user.name, user.email);
      }

      const finalEmail = emailToUse || '';
      setActiveEmail(finalEmail);
      setActiveInitials(initialsToUse || 'HB');

      const count = await NotificationsService.getUnreadCount();
      setUnreadCount(count);
      if (finalEmail) {
        const emailCount = await EmailService.getUnreadCount(finalEmail);
        setUnreadEmailCount(emailCount);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  const handleSwitchPerspective = async (targetRole: 'candidate' | 'employer' | 'ceo') => {
    setIsRoleModalVisible(false);
    if (targetRole === 'ceo') {
      const isUnlocked = await ApplicationsService.isCeoAuthenticated();
      if (!isUnlocked) {
        setTimeout(() => {
          setIsPasscodeModalVisible(true);
        }, 120);
        return;
      }
    }
    await ApplicationsService.elevateRoleTo(targetRole);
    if (targetRole === 'candidate') {
      router.replace('/candidate');
    } else {
      router.replace('/employer');
    }
  };

  const handlePasscodeSuccess = async () => {
    await ApplicationsService.setCeoAuthenticated(true);
    await ApplicationsService.elevateRoleTo('ceo');
    router.replace('/employer');
  };

  const handleSignOut = async () => {
    setIsRoleModalVisible(false);
    await ApplicationsService.clearCurrentUser();
    router.replace('/login');
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
              <TouchableOpacity 
                onPress={() => setIsRoleModalVisible(true)}
                activeOpacity={0.7}
                className="ml-2 bg-mintLight/50 border border-mint/40 px-2 py-0.5 rounded-full flex-row items-center"
              >
                {portalBadge.includes('CEO') ? (
                  <Crown size={10} color="#113c2c" style={{ marginRight: 3 }} />
                ) : null}
                <Text className="text-[10px] font-bold text-forest uppercase tracking-wider">
                  {portalBadge}
                </Text>
              </TouchableOpacity>
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

        {activeInitials ? (
          <TouchableOpacity
            onPress={() => setIsRoleModalVisible(true)}
            activeOpacity={0.8}
            className="w-9 h-9 rounded-full bg-forest items-center justify-center shadow-sm"
          >
            <Text className="text-white font-bold text-xs tracking-wider">
              {activeInitials}
            </Text>
          </TouchableOpacity>
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

      {/* Quick Perspective Switcher Modal */}
      {isRoleModalVisible && (
        <Modal
          visible={isRoleModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsRoleModalVisible(false)}
        >
          <View className="flex-1 bg-black/70 justify-center items-center px-5">
            <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-200">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <HireBloomLogoMark size={22} />
                  <Text className="text-base font-extrabold text-slate-900 ml-2">Switch Perspective</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsRoleModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-500 text-xs mb-4">
                Switch roles seamlessly to test all experiences on your phone:
              </Text>

              <View className="space-y-2 mb-4">
                {/* Option 1: CEO Suite */}
                <TouchableOpacity
                  onPress={() => handleSwitchPerspective('ceo')}
                  className="bg-forest p-3.5 rounded-2xl flex-row items-center justify-between shadow-sm active:opacity-90 mb-2"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-mint/20 rounded-xl items-center justify-center mr-3">
                      <Crown size={16} color="#8ecfa9" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-xs">👑 CEO Executive Suite</Text>
                      <Text className="text-mint text-[10px]">Strategic metrics, post CEO jobs, 1-tap offer sign-off</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#8ecfa9" />
                </TouchableOpacity>

                {/* Option 2: Employer */}
                <TouchableOpacity
                  onPress={() => handleSwitchPerspective('employer')}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex-row items-center justify-between active:opacity-85 mb-2"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-slate-200 rounded-xl items-center justify-center mr-3">
                      <Building2 size={16} color="#113c2c" />
                    </View>
                    <View>
                      <Text className="text-slate-900 font-bold text-xs">🏢 Employer Workspace</Text>
                      <Text className="text-slate-500 text-[10px]">Manage requisitions, review candidate Loom & CVs</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </TouchableOpacity>

                {/* Option 3: Candidate */}
                <TouchableOpacity
                  onPress={() => handleSwitchPerspective('candidate')}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex-row items-center justify-between active:opacity-85"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-mintLight/50 rounded-xl items-center justify-center mr-3">
                      <Briefcase size={16} color="#113c2c" />
                    </View>
                    <View>
                      <Text className="text-slate-900 font-bold text-xs">🌟 Talent Portal (Candidate)</Text>
                      <Text className="text-slate-500 text-[10px]">Browse roles, submit resume & Loom video pitches</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Log Out option */}
              <TouchableOpacity
                onPress={handleSignOut}
                className="py-2.5 flex-row items-center justify-center border-t border-slate-100"
              >
                <LogOut size={14} color="#dc2626" style={{ marginRight: 6 }} />
                <Text className="text-red-600 font-bold text-xs">Sign Out to Login Page</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Executive Master Passcode Modal */}
      {isPasscodeModalVisible && (
        <ExecutivePasscodeModal
          visible={isPasscodeModalVisible}
          onClose={() => setIsPasscodeModalVisible(false)}
          onSuccess={handlePasscodeSuccess}
          title="CEO Executive Suite"
          subtitle="Enter Master Key (2026) to unlock Owner & CEO Authority"
          targetRole="ceo"
        />
      )}
    </View>
  );
}
