import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle, Mail, MessageSquare, ShieldCheck, ChevronDown, ChevronUp, Send, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const FAQS = [
  {
    q: "How does payroll and international compliance work?",
    a: "Hire Bloom manages all foreign contracts, local tax compliance, and payroll distributions. Clients receive a single consolidated USD invoice, and team members receive direct local payments on a predictable bi-weekly schedule."
  },
  {
    q: "What is the $13/hour Embedded Teams model?",
    a: "Our starting rate is $13.00/hour flat per team member. Unlike traditional recruitment agencies, there are zero placement fees, zero buyout penalties, and no rigid multi-year contracts."
  },
  {
    q: "Who makes the final hiring decision?",
    a: "The client makes the final decision. Hire Bloom pre-screens language, skills, and technology, presenting top finalists (~9% pass rate), but you interview and choose who joins your team."
  },
  {
    q: "What are the workstation and reliability requirements?",
    a: "Every candidate must pass our Layer 4 reliability inspection: dedicated home workstation, verified fiber internet (50+ Mbps), and an uninterrupted power supply (UPS) backup system."
  },
  {
    q: "What is the BYU-Pathway connection?",
    a: "74% of our candidate network holds US-college-accredited degrees, including BYU-Pathway Worldwide alumni who have completed rigorous English, leadership, and professional communications training."
  }
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert("Missing Fields", "Please enter a subject and message for your support request.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
      Alert.alert(
        "Support Ticket Sent",
        "Your message has been sent to your dedicated Hire Bloom coordinator. A response will be delivered to your email and in-app notifications."
      );
    }, 600);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-border flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-canvas border border-border items-center justify-center mr-3 active:opacity-70"
        >
          <ArrowLeft size={18} color="#17352D" />
        </TouchableOpacity>
        <View>
          <Text className="text-base font-bold text-ink">Help & Customer Success</Text>
          <Text className="text-[10px] text-inkMuted">FAQs, Inquiries & Dedicated Support</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Dedicated Coordinator Card */}
        <View className="bg-forest rounded-3xl p-5 mb-6 text-white shadow-md">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-mint items-center justify-center mr-3 border border-white/20">
              <Text className="text-forest font-extrabold text-sm">SJ</Text>
            </View>
            <View>
              <Text className="text-xs font-bold text-mintLight uppercase tracking-wider">
                Dedicated Coordinator
              </Text>
              <Text className="text-base font-bold text-white">Sarah Jenkins</Text>
              <Text className="text-[11px] text-zinc-300">Hire Bloom Customer Operations</Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-3 pt-3 border-t border-white/10">
            <View className="flex-row items-center">
              <Clock size={12} color="#8ECFA9" style={{ marginRight: 4 }} />
              <Text className="text-[10px] text-zinc-200">US Hours (EST / CST)</Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={12} color="#8ECFA9" style={{ marginRight: 4 }} />
              <Text className="text-[10px] text-zinc-200">support@hirebloom.com</Text>
            </View>
          </View>
        </View>

        {/* FAQs */}
        <Text className="text-sm font-bold text-ink mb-3">Frequently Asked Questions</Text>
        <View className="space-y-3 mb-8">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <View key={idx} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <TouchableOpacity
                  onPress={() => toggleFaq(idx)}
                  className="p-4 flex-row justify-between items-center active:opacity-75"
                >
                  <Text className="text-xs font-bold text-ink flex-1 pr-3 leading-snug">
                    {faq.q}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={16} color="#113C2C" />
                  ) : (
                    <ChevronDown size={16} color="#66736D" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <Text className="text-xs text-inkMuted leading-relaxed">
                      {faq.a}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Support Ticket Submission */}
        <View className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-6">
          <View className="flex-row items-center mb-3">
            <MessageSquare size={16} color="#113C2C" style={{ marginRight: 6 }} />
            <Text className="text-sm font-bold text-ink">Submit an Inquiry</Text>
          </View>

          <Text className="text-xs text-inkMuted leading-relaxed mb-4">
            Need help with an application, interview link, or billing detail? Send a message directly to operations.
          </Text>

          <Text className="text-[10px] font-bold text-ink uppercase tracking-wider mb-1">Subject</Text>
          <TextInput
            value={ticketSubject}
            onChangeText={setTicketSubject}
            placeholder="e.g. Reschedule Wednesday video interview..."
            placeholderTextColor="#94A39B"
            className="w-full bg-canvas border border-border rounded-xl px-3.5 py-2.5 text-xs text-ink mb-3"
          />

          <Text className="text-[10px] font-bold text-ink uppercase tracking-wider mb-1">Message Details</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={ticketMessage}
            onChangeText={setTicketMessage}
            placeholder="Describe your question or issue in detail..."
            placeholderTextColor="#94A39B"
            textAlignVertical="top"
            className="w-full bg-canvas border border-border rounded-xl p-3.5 text-xs text-ink mb-4 min-h-[90px]"
          />

          <TouchableOpacity
            onPress={handleSubmitTicket}
            disabled={submitting}
            className="w-full bg-forest py-3 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
          >
            <Send size={14} color="white" style={{ marginRight: 6 }} />
            <Text className="text-white text-xs font-bold">
              {submitting ? 'Sending Request...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
