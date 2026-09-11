import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center p-8 bg-white border border-border rounded-3xl my-4">
      <View className="w-14 h-14 rounded-2xl bg-mintLight/40 items-center justify-center mb-4 border border-mint/25">
        <Icon size={26} color="#113C2C" />
      </View>
      <Text className="text-base font-bold text-ink text-center mb-1.5">{title}</Text>
      <Text className="text-xs text-inkMuted text-center leading-relaxed max-w-[280px] mb-5">
        {description}
      </Text>
      {actionText && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          className="bg-forest px-5 py-2.5 rounded-xl active:opacity-90 shadow-sm"
        >
          <Text className="text-white text-xs font-bold">{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
