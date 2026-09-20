import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, CheckCheck, Briefcase, Video, Sparkles, Shield, ChevronRight, X, Mail, ExternalLink, ClipboardList } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import EmptyState from '@/components/ui/EmptyState';
import { NotificationsService, NotificationItem, NotificationCategory } from '@/services/notificationsService';
import { ApplicationsService } from '@/services/applicationsService';
import EmailInboxModal from '@/components/ui/EmailInboxModal';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await ApplicationsService.getCurrentUser();
      if (user?.email) setCurrentUserEmail(user.email);
      const targetId = user?.uid || user?.email;
      const list = await NotificationsService.getNotifications(targetId);
      const seen = new Set<string>();
      const unique = list.filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      setNotifications(unique);
    } catch (e) {
      console.warn('Error loading notifications:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await NotificationsService.markAllAsRead();
    await loadNotifications();
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.read) {
      await NotificationsService.markAsRead(item.id);
      await loadNotifications();
    }
    setSelectedNotif(item);
  };

  const handleNavigateFromModal = (deepLink?: string) => {
    const targetLink = deepLink || selectedNotif?.deepLink;
    setSelectedNotif(null);
    if (targetLink) {
      router.push(targetLink as any);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getCategoryIcon = (type: NotificationCategory) => {
    switch (type) {
      case 'interview':
        return <Video size={16} color="#6D28D9" />;
      case 'offer':
        return <Sparkles size={16} color="#059669" />;
      case 'application':
        return <Briefcase size={16} color="#0369A1" />;
      default:
        return <Shield size={16} color="#113C2C" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center mr-3 active:opacity-70"
          >
            <ArrowLeft size={18} color="#17352D" />
          </TouchableOpacity>
          <View>
            <Text className="text-base font-bold text-ink">Notifications</Text>
            <Text className="text-[10px] text-inkMuted">Updates & Alerts</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          className="flex-row items-center bg-canvas border border-border px-2.5 py-1.5 rounded-lg active:opacity-70"
        >
          <CheckCheck size={13} color="#17352D" style={{ marginRight: 4 }} />
          <Text className="text-[10px] font-bold text-ink">Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View className="bg-white border-b border-border px-5 py-2.5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'application', label: 'Applications' },
            { key: 'interview', label: 'Interviews' },
            { key: 'offer', label: 'Offers' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-1.5 rounded-full border ${
                  isActive ? 'bg-forest border-forest' : 'bg-canvas border-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? 'text-white' : 'text-inkMuted'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All Caught Up"
            description="You don't have any notifications in this category right now."
          />
        ) : (
          <View className="space-y-3">
            {filtered.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                onPress={() => handleNotificationPress(item)}
                className={`p-4 rounded-2xl border flex-row items-start active:opacity-85 shadow-sm transition-all ${
                  item.read ? 'bg-white border-border' : 'bg-mintLight/15 border-mint/40'
                }`}
              >
                {/* Category Icon */}
                <View className="w-10 h-10 rounded-xl bg-canvas border border-border items-center justify-center mr-3 mt-0.5">
                  {getCategoryIcon(item.type)}
                </View>

                {/* Body */}
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-xs font-bold text-ink flex-1 pr-1">{item.title}</Text>
                    <Text className="text-[10px] text-inkMuted">{item.createdAt}</Text>
                  </View>
                  <Text className="text-[11px] text-inkMuted leading-relaxed mb-1.5">
                    {item.body}
                  </Text>
                  {item.deepLink ? (
                    <View className="flex-row items-center">
                      <Text className="text-[10px] font-bold text-forest mr-1">View Details</Text>
                      <ChevronRight size={12} color="#113C2C" />
                    </View>
                  ) : null}
                </View>

                {/* Unread indicator dot */}
                {!item.read && (
                  <View className="w-2 h-2 rounded-full bg-emerald-600 mt-2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ===================== NOTIFICATION DETAILS PREVIEW MODAL ===================== */}
      <Modal
        visible={!!selectedNotif}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNotif(null)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white w-full rounded-3xl p-6 shadow-2xl border border-zinc-100 max-h-[85%]">
            {/* Header with Close */}
            <View className="flex-row items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-xl bg-canvas border border-border items-center justify-center mr-2.5">
                  {selectedNotif && getCategoryIcon(selectedNotif.type)}
                </View>
                <View>
                  <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {selectedNotif?.type === 'offer'
                      ? 'Offer Details'
                      : selectedNotif?.type === 'interview'
                      ? 'Interview Details'
                      : 'Notification Details'}
                  </Text>
                  <Text className="text-[10px] text-zinc-400">{selectedNotif?.createdAt || 'Just now'}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedNotif(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center active:opacity-70"
              >
                <X size={16} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Offer Specific Preview */}
              {selectedNotif?.type === 'offer' ? (
                <View className="space-y-4">
                  <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <View className="flex-row items-center mb-1.5">
                      <Sparkles size={18} color="#059669" style={{ marginRight: 6 }} />
                      <Text className="text-emerald-950 font-bold text-sm">Offer Extended 🎉</Text>
                    </View>
                    <Text className="text-slate-900 font-extrabold text-base mb-1">
                      {selectedNotif.metadata?.jobTitle || selectedNotif.title}
                    </Text>
                    <Text className="text-emerald-800 text-xs font-semibold mb-3">
                      {selectedNotif.metadata?.company || 'Verified Client Partner'}
                    </Text>

                    <View className="pt-2.5 border-t border-emerald-200/60 space-y-1.5">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-zinc-500">Compensation:</Text>
                        <Text className="text-xs font-bold text-slate-900">
                          {selectedNotif.metadata?.salary || '$15.00 - $18.00 / hr'}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-zinc-500">Target Start:</Text>
                        <Text className="text-xs font-bold text-slate-900">
                          {selectedNotif.metadata?.startDate || 'Within 2 weeks'}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-zinc-500">Work Setup:</Text>
                        <Text className="text-xs font-bold text-emerald-700">Remote (US Business Hours)</Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-slate-700 text-xs leading-relaxed">
                    {selectedNotif.body}
                  </Text>

                  {/* CTAs */}
                  <View className="space-y-2.5 pt-2">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNotif(null);
                        router.push('/candidate/onboarding' as any);
                      }}
                      className="bg-emerald-700 py-3.5 px-4 rounded-xl items-center flex-row justify-center active:opacity-90 shadow-sm"
                    >
                      <ClipboardList size={15} color="white" style={{ marginRight: 6 }} />
                      <Text className="text-white font-bold text-xs">Accept Offer & Start Onboarding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleNavigateFromModal(selectedNotif.deepLink || '/candidate/applications')}
                      className="bg-slate-900 py-3 rounded-xl items-center justify-center active:opacity-90"
                    >
                      <Text className="text-white font-bold text-xs">View in Applications Portal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNotif(null);
                        setEmailModalVisible(true);
                      }}
                      className="border border-zinc-200 bg-zinc-50 py-3 rounded-xl flex-row items-center justify-center active:opacity-75"
                    >
                      <Mail size={14} color="#0f172a" style={{ marginRight: 6 }} />
                      <Text className="text-slate-800 font-bold text-xs">View Formal Offer Letter (Email)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : selectedNotif?.type === 'interview' ? (
                /* Interview Specific Preview */
                <View className="space-y-4">
                  <View className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                    <View className="flex-row items-center mb-1.5">
                      <Video size={18} color="#7c3aed" style={{ marginRight: 6 }} />
                      <Text className="text-purple-950 font-bold text-sm">Video Interview Scheduled</Text>
                    </View>
                    <Text className="text-slate-900 font-extrabold text-base mb-1">
                      {selectedNotif.metadata?.jobTitle || selectedNotif.title}
                    </Text>
                    <Text className="text-purple-800 text-xs font-semibold mb-3">
                      {selectedNotif.metadata?.company || 'DesignFlow'}
                    </Text>

                    <View className="pt-2.5 border-t border-purple-200/60 space-y-1.5">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-zinc-500">Date & Time:</Text>
                        <Text className="text-xs font-bold text-slate-900">
                          {selectedNotif.metadata?.interviewDate || 'Upcoming'} • {selectedNotif.metadata?.interviewTime || 'Confirmed EST'}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-zinc-500">Meeting Room:</Text>
                        <Text className="text-xs font-bold text-purple-700" numberOfLines={1}>
                          {selectedNotif.metadata?.meetUrl || 'meet.google.com/hbm-intr-vct'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-slate-700 text-xs leading-relaxed">
                    {selectedNotif.body}
                  </Text>

                  <View className="space-y-2.5 pt-2">
                    <TouchableOpacity
                      onPress={() => handleNavigateFromModal(selectedNotif.deepLink || '/candidate/interviews')}
                      className="bg-purple-700 py-3.5 px-4 rounded-xl items-center flex-row justify-center active:opacity-90 shadow-sm"
                    >
                      <Video size={15} color="white" style={{ marginRight: 6 }} />
                      <Text className="text-white font-bold text-xs">Open Meeting Room / Interviews</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNotif(null);
                        setEmailModalVisible(true);
                      }}
                      className="border border-zinc-200 bg-zinc-50 py-3 rounded-xl flex-row items-center justify-center active:opacity-75"
                    >
                      <Mail size={14} color="#0f172a" style={{ marginRight: 6 }} />
                      <Text className="text-slate-800 font-bold text-xs">View Invitation Email</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* General Notification Preview */
                <View className="space-y-4">
                  <Text className="text-slate-900 font-extrabold text-base">
                    {selectedNotif?.title}
                  </Text>
                  <Text className="text-slate-700 text-xs leading-relaxed">
                    {selectedNotif?.body}
                  </Text>

                  {selectedNotif?.deepLink ? (
                    <TouchableOpacity
                      onPress={() => handleNavigateFromModal(selectedNotif.deepLink)}
                      className="bg-slate-900 py-3.5 rounded-xl items-center justify-center active:opacity-90 mt-2"
                    >
                      <Text className="text-white font-bold text-xs">View Application Status</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Embedded Email Inbox Modal */}
      <EmailInboxModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        userEmail={currentUserEmail}
      />
    </SafeAreaView>
  );
}
