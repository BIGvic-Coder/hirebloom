import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mail,
  Star,
  Trash2,
  MoreVertical,
  Reply,
  Forward,
  Smile,
  CheckCircle,
  Archive,
  ChevronRight,
  Sparkles,
  Briefcase,
  X,
  ExternalLink,
} from 'lucide-react-native';
import { EmailService, EmailMessage } from '@/services/emailService';
import { ApplicationsService } from '@/services/applicationsService';
import HireBloomLogoMark from './HireBloomLogoMark';

interface EmailInboxModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail?: string;
  initialEmailId?: string;
}

export default function EmailInboxModal({
  visible,
  onClose,
  userEmail,
  initialEmailId,
}: EmailInboxModalProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (visible) {
      loadEmails();
    }
  }, [visible, userEmail]);

  const loadEmails = async () => {
    let emailToUse = userEmail;
    if (!emailToUse) {
      const user = await ApplicationsService.getCurrentUser();
      if (user?.email) {
        emailToUse = user.email;
      }
    }
    const finalEmail = emailToUse || 'victor@hirebloom.com';
    const list = await EmailService.getEmails(finalEmail);
    const seen = new Set<string>();
    const unique = list.filter((e) => {
      if (!e?.id || seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    setEmails(unique);
    if (initialEmailId) {
      const match = unique.find((e) => e.id === initialEmailId);
      if (match) {
        setSelectedEmail(match);
        EmailService.markAsRead(match.id);
      }
    }
  };

  const handleSelectEmail = async (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.read) {
      await EmailService.markAsRead(email.id);
      setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        {selectedEmail ? (
          /* =================== EMAIL DETAIL VIEW (MATCHING SCREENSHOT 1 & 2) =================== */
          <View className="flex-1 bg-white">
            {/* Top Bar matching Mobile Email Client */}
            <View className="px-4 py-3 border-b border-zinc-200 flex-row justify-between items-center bg-white">
              <TouchableOpacity
                onPress={() => setSelectedEmail(null)}
                className="p-1 -ml-1 flex-row items-center active:opacity-60"
              >
                <ArrowLeft size={22} color="#1e293b" />
                <Text className="text-slate-700 text-xs font-bold ml-2">Back to Inbox</Text>
              </TouchableOpacity>

              <View className="flex-row items-center space-x-4">
                <TouchableOpacity className="p-1.5 active:opacity-60">
                  <Archive size={19} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1.5 active:opacity-60">
                  <Trash2 size={19} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsStarred(!isStarred)}
                  className="p-1.5 active:opacity-60"
                >
                  <Star
                    size={20}
                    color={isStarred ? '#eab308' : '#475569'}
                    fill={isStarred ? '#eab308' : 'none'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} className="p-1.5 active:opacity-60">
                  <X size={20} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
              {/* Subject Line & Inbox tag */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center flex-wrap gap-2 mb-1">
                    <Text className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {selectedEmail.subject}
                    </Text>
                    <View className="bg-blue-600/90 px-2 py-0.5 rounded">
                      <Text className="text-white text-[10px] font-extrabold uppercase">Inbox</Text>
                    </View>
                  </View>
                  {selectedEmail.metadata?.jobTitle ? (
                    <Text className="text-xs text-zinc-500 font-semibold">
                      {selectedEmail.metadata.jobTitle} • {selectedEmail.metadata.company || 'Hire Bloom'}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Sender info bar */}
              <View className="flex-row items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-slate-900 items-center justify-center mr-3 shadow-sm">
                    <Text className="text-white font-extrabold text-sm">
                      {selectedEmail.fromName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-sm font-bold text-slate-900 mr-2">{selectedEmail.fromName}</Text>
                      <Text className="text-[11px] text-zinc-400 font-medium">{selectedEmail.date}</Text>
                    </View>
                    <Text className="text-xs text-zinc-500">to me ▾</Text>
                  </View>
                </View>

                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity className="p-1.5">
                    <Smile size={18} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-1.5">
                    <Reply size={18} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-1.5">
                    <MoreVertical size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ===================== RENDER EMAIL BODY TEMPLATES ===================== */}

              {/* Template 1: Application Submitted (Matches Image 1: Dark Card with hirebloom logo) */}
              {selectedEmail.template === 'application_submitted' && (
                <View className="bg-[#121815] rounded-3xl p-7 mb-6 shadow-md border border-emerald-950">
                  {/* Brand Header */}
                  <View className="flex-row items-center justify-center mb-8">
                    <HireBloomLogoMark size={24} />
                    <Text className="text-xl font-bold text-emerald-500 ml-2 font-serif tracking-tight">
                      hire bloom
                    </Text>
                  </View>

                  {/* Body Text matching screenshot */}
                  <Text className="text-white font-normal text-base leading-relaxed mb-6">
                    Hi {selectedEmail.toName},
                  </Text>

                  <Text className="text-zinc-200 font-normal text-base leading-relaxed mb-6">
                    Thanks for applying! Your application is in our review queue, and we're carefully reviewing your experience.
                  </Text>

                  <Text className="text-zinc-200 font-normal text-base leading-relaxed mb-8">
                    You'll hear from us within 1–2 weeks. No action needed on your end — just keep an eye on your inbox (and spam folder, just in case).
                  </Text>

                  {/* Vetted assurance footer */}
                  <View className="pt-6 border-t border-zinc-800 flex-row items-center justify-between">
                    <Text className="text-[11px] text-zinc-400">Hire Bloom Talent Operations</Text>
                    <View className="bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
                      <Text className="text-emerald-300 text-[10px] font-bold">Top 9% Vetted Pool</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Template 2: Reviewer Feedback & Stage Advance */}
              {selectedEmail.template === 'reviewer_feedback' && (
                <View className="bg-white rounded-3xl p-6 mb-6 border border-zinc-200 shadow-sm">
                  {/* Header Badge */}
                  <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                    <View className="flex-row items-center">
                      <HireBloomLogoMark size={22} />
                      <Text className="text-sm font-bold text-forest ml-2 font-serif">Hire Bloom Review Desk</Text>
                    </View>
                    <View className="bg-emerald-100 px-2.5 py-1 rounded-full">
                      <Text className="text-emerald-800 text-[10px] font-bold uppercase">
                        Stage: {selectedEmail.metadata?.stage || 'Shortlisted'}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-slate-900 font-bold text-base mb-2">
                    Hi {selectedEmail.toName},
                  </Text>
                  <Text className="text-slate-700 text-sm leading-relaxed mb-4">
                    Our vetting desk has officially completed the review of your resume and qualifications for{' '}
                    <Text className="font-bold text-slate-900">{selectedEmail.metadata?.jobTitle}</Text> at{' '}
                    <Text className="font-bold text-slate-900">{selectedEmail.metadata?.company}</Text>.
                  </Text>

                  {/* Reviewer Feedback Callout */}
                  <View className="bg-emerald-50/70 border-l-4 border-emerald-600 p-4 rounded-r-2xl mb-5">
                    <Text className="text-emerald-950 font-bold text-xs uppercase tracking-wider mb-1">
                      Official Reviewer Feedback:
                    </Text>
                    <Text className="text-slate-800 text-sm italic leading-relaxed">
                      "{selectedEmail.metadata?.feedback || 'Strong experience demonstrated in remote communications.'}"
                    </Text>
                    <Text className="text-emerald-800 text-[11px] font-semibold mt-2">
                      — {selectedEmail.metadata?.reviewerName || 'Vetting Team Lead'}
                    </Text>
                  </View>

                  <Text className="text-slate-700 text-sm leading-relaxed mb-4">
                    Your application has been advanced to{' '}
                    <Text className="font-bold text-forest">{selectedEmail.metadata?.stage}</Text>. You can monitor your application timeline anytime on your candidate dashboard.
                  </Text>
                </View>
              )}

              {/* Template 3: Founder Welcome / Job Network Letter (Image 2 style) */}
              {selectedEmail.template === 'founder_welcome' && (
                <View className="bg-white rounded-3xl p-6 mb-6 border border-zinc-200 shadow-sm">
                  <Text className="text-slate-900 text-base leading-relaxed mb-4">Hi there!</Text>

                  <Text className="text-slate-800 text-sm leading-relaxed mb-4">
                    I'm <Text className="font-bold">Eric</Text>, Co-Founder at <Text className="font-bold">Bloom</Text> — thanks for reaching out! Our mission at Bloom is to help 10,000 people around the world get better paying, remote jobs.
                  </Text>

                  <Text className="text-slate-800 text-sm leading-relaxed mb-4">
                    We'd love to get to know more about you and your work experience so we can match you with hiring companies. Please continue using your talent portal to officially apply to join the Bloom Job Network.
                  </Text>

                  <Text className="text-slate-800 text-sm leading-relaxed mb-4">
                    Thanks again, good things to come!{'\n'}Eric
                  </Text>

                  <View className="pt-4 border-t border-zinc-100">
                    <Text className="text-xs text-zinc-500">--</Text>
                    <Text className="text-xs font-bold text-slate-800 mt-1">Eric Engebretsen</Text>
                    <Text className="text-xs text-zinc-500">Co-Founder @ Bloom</Text>
                    <View className="flex-row items-center mt-2">
                      <HireBloomLogoMark size={16} />
                      <Text className="text-xs font-bold text-forest ml-1 font-serif">bloom</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Template 4: Interview Invitation */}
              {selectedEmail.template === 'interview_invite' && (
                <View className="bg-purple-50/70 rounded-3xl p-6 mb-6 border border-purple-200 shadow-sm">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Sparkles size={20} color="#7c3aed" />
                      <Text className="text-sm font-bold text-purple-900 ml-2 font-serif">Interview Invitation</Text>
                    </View>
                    <View className="bg-purple-200/80 px-2.5 py-1 rounded-full">
                      <Text className="text-purple-900 text-[10px] font-bold uppercase">Confirmed</Text>
                    </View>
                  </View>

                  <Text className="text-purple-950 font-bold text-base mb-2">
                    Congratulations {selectedEmail.toName}!
                  </Text>
                  <Text className="text-purple-900 text-sm leading-relaxed mb-4">
                    The hiring team at <Text className="font-bold">{selectedEmail.metadata?.company}</Text> was impressed with your vetted qualifications and has invited you to a video panel interview.
                  </Text>

                  {/* Details Card */}
                  <View className="bg-white p-4 rounded-2xl border border-purple-200 mb-4">
                    <Text className="text-xs font-bold text-purple-900 uppercase mb-2">Schedule Details</Text>
                    <Text className="text-xs text-slate-700 mb-1">
                      • <Text className="font-semibold">Role:</Text> {selectedEmail.metadata?.jobTitle}
                    </Text>
                    <Text className="text-xs text-slate-700 mb-1">
                      • <Text className="font-semibold">Date:</Text> {selectedEmail.metadata?.interviewDate || 'Upcoming'}
                    </Text>
                    <Text className="text-xs text-slate-700 mb-1">
                      • <Text className="font-semibold">Time:</Text> {selectedEmail.metadata?.interviewTime || 'EST'}
                    </Text>
                    <Text className="text-xs text-slate-700">
                      • <Text className="font-semibold">Meeting URL:</Text> {selectedEmail.metadata?.meetUrl || 'meet.google.com/hbm-intr-vct'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Template 5: Formal Offer Extended */}
              {selectedEmail.template === 'offer_letter' && (
                <View className="bg-emerald-50/70 rounded-3xl p-6 mb-6 border border-emerald-200 shadow-sm">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Sparkles size={20} color="#059669" />
                      <Text className="text-sm font-bold text-emerald-950 ml-2 font-serif">Formal Placement Offer</Text>
                    </View>
                    <View className="bg-emerald-200 px-2.5 py-1 rounded-full">
                      <Text className="text-emerald-900 text-[10px] font-bold uppercase">Offer Extended</Text>
                    </View>
                  </View>

                  <Text className="text-emerald-950 font-bold text-base mb-2">
                    Congratulations {selectedEmail.toName}! 🎉
                  </Text>
                  <Text className="text-emerald-900 text-sm leading-relaxed mb-4">
                    We are proud to extend a formal contract placement offer for the position of{' '}
                    <Text className="font-bold">{selectedEmail.metadata?.jobTitle}</Text> at{' '}
                    <Text className="font-bold">{selectedEmail.metadata?.company}</Text>.
                  </Text>

                  <View className="bg-white p-4 rounded-2xl border border-emerald-200 mb-4">
                    <Text className="text-xs font-bold text-emerald-950 uppercase mb-2">Compensation & Terms</Text>
                    <Text className="text-xs text-slate-700 mb-1">
                      • <Text className="font-semibold">Rate:</Text> {selectedEmail.metadata?.salary || '$15 - $18 / hr'}
                    </Text>
                    <Text className="text-xs text-slate-700 mb-1">
                      • <Text className="font-semibold">Start Date:</Text> {selectedEmail.metadata?.startDate || 'Within 2 weeks'}
                    </Text>
                    <Text className="text-xs text-slate-700">
                      • <Text className="font-semibold">Contract Type:</Text> Full-time Remote (US Hours)
                    </Text>
                  </View>
                </View>
              )}

              {/* Template 6: Not Selected / Talent Network Retention */}
              {selectedEmail.template === 'not_selected' && (
                <View className="bg-zinc-50 rounded-3xl p-6 mb-6 border border-zinc-200 shadow-sm">
                  <Text className="text-slate-900 font-bold text-base mb-2">
                    Hi {selectedEmail.toName},
                  </Text>
                  <Text className="text-slate-700 text-sm leading-relaxed mb-4">
                    Thank you for applying to <Text className="font-bold">{selectedEmail.metadata?.jobTitle}</Text> at{' '}
                    <Text className="font-bold">{selectedEmail.metadata?.company}</Text>.
                  </Text>

                  {selectedEmail.metadata?.feedback ? (
                    <View className="bg-white border-l-4 border-slate-400 p-4 rounded-r-2xl mb-4">
                      <Text className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-1">
                        Hiring Team Notes:
                      </Text>
                      <Text className="text-slate-700 text-xs italic">
                        "{selectedEmail.metadata.feedback}"
                      </Text>
                    </View>
                  ) : null}

                  <Text className="text-slate-700 text-sm leading-relaxed mb-4">
                    While another candidate was selected for this specific role, your profile remains verified in the Bloom talent network. We will notify you when new opportunities match your qualifications.
                  </Text>
                </View>
              )}

              {/* Mobile Email Bottom Action Buttons */}
              <View className="flex-row items-center space-x-3 pt-4 border-t border-zinc-200">
                <TouchableOpacity className="flex-1 bg-zinc-100 py-3 rounded-full flex-row items-center justify-center active:opacity-75">
                  <Reply size={16} color="#334155" style={{ marginRight: 6 }} />
                  <Text className="text-slate-700 font-bold text-xs">Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-zinc-100 py-3 rounded-full flex-row items-center justify-center active:opacity-75">
                  <Forward size={16} color="#334155" style={{ marginRight: 6 }} />
                  <Text className="text-slate-700 font-bold text-xs">Forward</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : (
          /* =================== INBOX LIST VIEW =================== */
          <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 py-4 bg-white border-b border-zinc-200 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-forest items-center justify-center mr-3 shadow-sm">
                  <Mail size={20} color="white" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-slate-900">Email Inbox</Text>
                  <Text className="text-xs text-zinc-500">{userEmail}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center active:opacity-70"
              >
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Email Filter Pill */}
            <View className="px-5 py-2.5 bg-white border-b border-zinc-100 flex-row justify-between items-center">
              <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex-row items-center">
                <Sparkles size={12} color="#059669" style={{ marginRight: 4 }} />
                <Text className="text-emerald-800 text-xs font-bold">
                  {emails.length} Messages ({emails.filter((e) => !e.read).length} Unread)
                </Text>
              </View>
              <Text className="text-[11px] text-zinc-400 font-semibold">Bloom Job Network</Text>
            </View>

            {/* Email Message List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            >
              {emails.length === 0 ? (
                <View className="bg-white p-8 rounded-3xl border border-zinc-200 items-center justify-center mt-6">
                  <Mail size={36} color="#cbd5e1" style={{ marginBottom: 10 }} />
                  <Text className="text-slate-800 font-bold text-sm">No emails in inbox</Text>
                  <Text className="text-zinc-400 text-xs text-center mt-1">
                    When you apply for a job or receive hiring team feedback, official emails will appear here.
                  </Text>
                </View>
              ) : (
                emails.map((email, idx) => (
                  <TouchableOpacity
                    key={`${email.id}-${idx}`}
                    onPress={() => handleSelectEmail(email)}
                    className={`bg-white rounded-2xl p-4 mb-3 border shadow-sm flex-row items-start ${
                      !email.read ? 'border-emerald-300 bg-emerald-50/20' : 'border-zinc-200'
                    }`}
                  >
                    {/* Sender Avatar */}
                    <View
                      className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${
                        email.fromName === 'Bloom'
                          ? 'bg-emerald-900'
                          : email.fromName.includes('Team')
                          ? 'bg-slate-900'
                          : 'bg-purple-900'
                      }`}
                    >
                      <Text className="text-white font-extrabold text-sm">
                        {email.fromName.charAt(0)}
                      </Text>
                    </View>

                    {/* Email summary */}
                    <View className="flex-1 pr-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text
                          className={`text-xs ${
                            !email.read ? 'font-extrabold text-slate-900' : 'font-bold text-slate-700'
                          }`}
                        >
                          {email.fromName}
                        </Text>
                        <Text className="text-[10px] text-zinc-400 font-medium">{email.date}</Text>
                      </View>

                      <Text
                        className={`text-sm mb-1 ${
                          !email.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                        }`}
                        numberOfLines={1}
                      >
                        {email.subject}
                      </Text>

                      <Text className="text-xs text-zinc-500" numberOfLines={2}>
                        {email.preview}
                      </Text>
                    </View>

                    {/* Unread indicator */}
                    {!email.read && (
                      <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 self-center ml-1" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
