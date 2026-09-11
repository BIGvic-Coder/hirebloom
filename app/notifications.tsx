import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, CheckCheck, Briefcase, Video, Sparkles, Shield, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import EmptyState from '@/components/ui/EmptyState';
import { NotificationsService, NotificationItem, NotificationCategory } from '@/services/notificationsService';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await NotificationsService.getNotifications();
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
    if (item.deepLink) {
      router.push(item.deepLink as any);
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
    </SafeAreaView>
  );
}
