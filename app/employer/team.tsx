import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  Award,
  X,
  Briefcase,
  Zap,
  Building2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HireBloomHeader from '@/components/ui/HireBloomHeader';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: 'coordinator' | 'placed_talent';
  avatar: string;
  rate: string;
  hours: string;
  timezone: string;
  startDate: string;
  english: string;
  manager: string;
  status: 'Active';
  workflowDescription: string;
  coreTools: string[];
  workstationProof: string;
}

export const ACTIVE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-coord-1',
    name: 'Sarah Jenkins',
    role: 'Dedicated Talent Coordinator',
    category: 'coordinator',
    avatar: 'SJ',
    rate: 'HireBloom Retainer',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US Eastern (8 AM - 4 PM)',
    startDate: 'HireBloom Staff',
    english: 'Native English (C2)',
    manager: 'Victor Taiwo (CEO)',
    status: 'Active',
    workflowDescription: 'Coordinates the entire pre-screening and onboarding pipeline. Sarah reviews all candidate AI match scores, conducts live video reference checks, and coordinates interview scheduling between candidates and the CEO.',
    coreTools: ['HireBloom Portal', 'Google Meet', 'Slack', 'Zendesk HR'],
    workstationProof: 'HireBloom HQ Verified: 1 Gbps Fiber + Dual Monitor + Noise Cancellation'
  },
  {
    id: 'team-coord-2',
    name: 'David Vance',
    role: 'Director of Client Operations',
    category: 'coordinator',
    avatar: 'DV',
    rate: 'HireBloom Retainer',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US Central (9 AM - 5 PM)',
    startDate: 'HireBloom Staff',
    english: 'Native English (C2)',
    manager: 'Victor Taiwo (CEO)',
    status: 'Active',
    workflowDescription: 'Supervises embedded team performance SLAs, biometric workstation security compliance, bi-weekly payroll dispatch, and international tax reporting.',
    coreTools: ['HireBloom Payroll', 'Stripe Billing', 'DocuSign', 'Notion'],
    workstationProof: 'HireBloom HQ Verified: Tier-1 Fiber + Hardware Security Key'
  },
  {
    id: 'team-coord-3',
    name: 'Chloe Dupont',
    role: 'QA & Technical Vetting Officer',
    category: 'coordinator',
    avatar: 'CD',
    rate: 'HireBloom Retainer',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US Eastern (9 AM - 5 PM)',
    startDate: 'HireBloom Staff',
    english: 'Bilingual (English / French)',
    manager: 'David Vance (Ops)',
    status: 'Active',
    workflowDescription: 'Tests and inspects every applicant workstation, conducts internet speed tests (minimum 50 Mbps upload/download required), and verifies uninterrupted power backup (UPS/inverters).',
    coreTools: ['Speedtest API', 'Camera Rig Inspector', 'Workstation Audit Engine'],
    workstationProof: 'HireBloom Certified: Hardware Diagnostic Suite Passed'
  },
  {
    id: 'team-talent-1',
    name: 'Victor Taiwo',
    role: 'Senior Customer Support Lead',
    category: 'placed_talent',
    avatar: 'VT',
    rate: '$15.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Sep 2026',
    english: 'C1 Fluent',
    manager: 'Sarah Jenkins (HireBloom)',
    status: 'Active',
    workflowDescription: 'Leads tier-2 technical ticket escalations, authors self-service knowledge bases, and mentors support specialists. Consistently hits 98%+ CSAT.',
    coreTools: ['Zendesk Enterprise', 'Intercom', 'Jira', 'Slack'],
    workstationProof: '85 Mbps Fiber + UPS Inverter Battery Backup + Dual 27" Displays'
  },
  {
    id: 'team-talent-2',
    name: 'Elena Rodriguez',
    role: 'Product Designer',
    category: 'placed_talent',
    avatar: 'ER',
    rate: '$16.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Aug 2026',
    english: 'C2 Bilingual',
    manager: 'Sarah Jenkins (HireBloom)',
    status: 'Active',
    workflowDescription: 'Builds component design systems, leads user research interviews, and creates interactive prototypes for client web & mobile applications.',
    coreTools: ['Figma', 'FigJam', 'Tokens Studio', 'Linear'],
    workstationProof: 'MacBook Pro M3 Max + 4K Display + 100 Mbps Fiber'
  },
  {
    id: 'team-talent-3',
    name: 'Michael Chen',
    role: 'Front-End Support Specialist',
    category: 'placed_talent',
    avatar: 'MC',
    rate: '$14.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US CST (8 AM - 4 PM)',
    startDate: 'Jul 2026',
    english: 'C1 Fluent',
    manager: 'David Vance (Ops)',
    status: 'Active',
    workflowDescription: 'Triages web client bug reports, inspects React Native frontend bundle errors, and collaborates with engineering to ship hotfixes.',
    coreTools: ['React / React Native', 'Sentry', 'GitHub', 'Postman'],
    workstationProof: 'Gigabit Internet + Linux Workstation + Solar Inverter'
  },
  {
    id: 'team-talent-4',
    name: 'Amara Okafor',
    role: 'Tier-2 Zendesk Specialist',
    category: 'placed_talent',
    avatar: 'AO',
    rate: '$13.50 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Jun 2026',
    english: 'C1 Fluent',
    manager: 'Victor Taiwo (Support Lead)',
    status: 'Active',
    workflowDescription: 'Handles high-volume customer inquiries, creates automated ticket macro shortcuts, and resolves billing issues under 5-minute SLAs.',
    coreTools: ['Zendesk Support', 'Stripe Billing', 'Loom', 'Google Workspace'],
    workstationProof: '65 Mbps Fiber + UPS Inverter + Dual Screens'
  },
  {
    id: 'team-talent-5',
    name: 'Carlos Mendez',
    role: 'Operations & Logistics Lead',
    category: 'placed_talent',
    avatar: 'CM',
    rate: '$15.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US PST (8 AM - 4 PM)',
    startDate: 'May 2026',
    english: 'C2 Bilingual',
    manager: 'David Vance (Ops)',
    status: 'Active',
    workflowDescription: 'Supervises remote supply operations, coordinates vendor dispatches, and tracks cross-border inventory logistics.',
    coreTools: ['Airtable', 'Zapier', 'Notion', 'Slack'],
    workstationProof: 'Dedicated Home Office + 100 Mbps Fiber + Battery Backup'
  },
  {
    id: 'team-talent-6',
    name: 'Priya Sharma',
    role: 'Technical Onboarding Specialist',
    category: 'placed_talent',
    avatar: 'PS',
    rate: '$14.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (10 AM - 6 PM)',
    startDate: 'Apr 2026',
    english: 'C1 Fluent',
    manager: 'Sarah Jenkins (HireBloom)',
    status: 'Active',
    workflowDescription: 'Guides new client accounts through software setup, conducts live 1-on-1 walkthroughs, and ensures initial customer adoption.',
    coreTools: ['HubSpot CRM', 'Zoom', 'Loom', 'Intercom'],
    workstationProof: 'High-speed Fiber + External Microphone + HD WebCam'
  },
  {
    id: 'team-talent-7',
    name: 'Liam O\'Connor',
    role: 'Cloud Infrastructure Support',
    category: 'placed_talent',
    avatar: 'LO',
    rate: '$16.50 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Mar 2026',
    english: 'C2 Native',
    manager: 'David Vance (Ops)',
    status: 'Active',
    workflowDescription: 'Monitors server uptime, alerts engineering on database latency spikes, and ensures SSL/TLS certificate renewals.',
    coreTools: ['AWS CloudWatch', 'Datadog', 'Docker', 'Terminal'],
    workstationProof: 'Triple Monitor Setup + Gigabit Fiber + Dual Power Supplies'
  },
  {
    id: 'team-talent-8',
    name: 'Aisha Bello',
    role: 'Executive Virtual Assistant',
    category: 'placed_talent',
    avatar: 'AB',
    rate: '$13.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US EST (9 AM - 5 PM)',
    startDate: 'Feb 2026',
    english: 'C1 Fluent',
    manager: 'Victor Taiwo (CEO)',
    status: 'Active',
    workflowDescription: 'Manages executive calendars, handles client email correspondence, organizes company travel itineraries, and prepares executive slide decks.',
    coreTools: ['Google Calendar', 'Superhuman', 'Notion', 'Canva'],
    workstationProof: 'Fast Fiber + Clean Video Studio Setup + Power Inverter'
  },
  {
    id: 'team-talent-9',
    name: 'Tariq Al-Mansoor',
    role: 'Data Triage & Quality Associate',
    category: 'placed_talent',
    avatar: 'TM',
    rate: '$13.00 / hr',
    hours: 'Full-time (40 hrs/wk)',
    timezone: 'US CST (9 AM - 5 PM)',
    startDate: 'Jan 2026',
    english: 'C1 Fluent',
    manager: 'David Vance (Ops)',
    status: 'Active',
    workflowDescription: 'Cleans, validates, and tags customer records, audits CRM data integrity, and generates weekly executive pipeline performance reports.',
    coreTools: ['Excel / Sheets', 'PostgreSQL', 'Metabase', 'Salesforce'],
    workstationProof: '75 Mbps Fiber + UPS Backup + Verified Workstation'
  },
];

export default function EmployerTeam() {
  const router = useRouter() as any;
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'placed_talent' | 'coordinator'>('all');
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<TeamMember | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [selectedStaffForTask, setSelectedStaffForTask] = useState<TeamMember | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState('Pre-Screen Applications & Verify Loom Video');

  const filteredMembers = ACTIVE_TEAM_MEMBERS.filter((m) => {
    if (selectedFilter === 'all') return true;
    return m.category === selectedFilter;
  });

  const handleTestRole = (member: TeamMember) => {
    setSelectedMemberForModal(member);
  };

  const handleOpenAssignTask = (member: TeamMember) => {
    setSelectedStaffForTask(member);
    setIsTaskModalVisible(true);
  };

  const handleSendMessage = (member: TeamMember) => {
    Alert.alert(
      `Message or Assign: ${member.name}`,
      `Role: ${member.role} (${member.category === 'coordinator' ? 'HireBloom Coordinator' : 'Embedded Specialist'})\nAuthority: Admin / CEO (Victor Taiwo)\n\nWhat action would you like to take?`,
      [
        {
          text: "📋 Assign Vetting / Workflow Task",
          onPress: () => handleOpenAssignTask(member)
        },
        {
          text: "💬 Open Slack/Team Chat Sync",
          onPress: () => Alert.alert("Chat Dispatched", `Live notification dispatched to ${member.name}'s Slack/HireBloom channel.`)
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleInspectWorkstation = (member: TeamMember) => {
    Alert.alert(
      "Workstation & Compliance Audit",
      `Staff Member: ${member.name}\nRole: ${member.role}\n\nVerified Hardware:\n${member.workstationProof}\n\nStatus: 100% COMPLIANT\nAudited by: Chloe Dupont (HireBloom QA)`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      {/* Header */}
      <HireBloomHeader portalTitle="hirebloom" portalBadge="Active Team (12)" userInitials="HB" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Title Block */}
        <View className="mb-5">
          <Text className="text-xs font-bold text-inkMuted uppercase tracking-wider mb-1">
            HireBloom Embedded Staffing Cloud
          </Text>
          <Text className="text-2xl font-bold text-ink font-serif">
            Active Team Members (12)
          </Text>
          <Text className="text-xs text-inkMuted mt-1">
            9 Placed Remote Specialists + 3 Dedicated HireBloom Staff Coordinators
          </Text>
        </View>

        {/* Contract & Model Overview Banner */}
        <View className="bg-forest rounded-3xl p-5 mb-5 text-white shadow-md">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <Building2 size={16} color="#8ecfa9" style={{ marginRight: 6 }} />
              <Text className="text-xs font-bold text-mintLight uppercase tracking-wider">
                HireBloom Embedded Staffing
              </Text>
            </View>
            <View className="bg-mint px-2 py-0.5 rounded-full">
              <Text className="text-forest font-extrabold text-[9px]">12 ACTIVE</Text>
            </View>
          </View>

          <Text className="text-sm font-bold text-white mb-2">
            Flat Rate $13.00 - $16.50/hr • Managed Payroll & Compliance
          </Text>
          <Text className="text-zinc-300 text-[11px] mb-3 leading-relaxed">
            Staff work full-time directly with your company. HireBloom manages contracts, international compliance, and workstation verification.
          </Text>

          <View className="flex-row items-center justify-between pt-3 border-t border-white/10">
            <View>
              <Text className="text-[9px] uppercase text-zinc-300 font-bold">Placed Specialists</Text>
              <Text className="text-base font-extrabold text-white">9 Staff</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase text-zinc-300 font-bold">Dedicated Coordinators</Text>
              <Text className="text-base font-extrabold text-mint">3 Staff</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase text-zinc-300 font-bold">Retention Rate</Text>
              <Text className="text-base font-extrabold text-white">98%</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row bg-slate-200/70 p-1 rounded-2xl mb-5">
          {[
            { id: 'all', label: 'All Staff (12)' },
            { id: 'placed_talent', label: 'Placed Talent (9)' },
            { id: 'coordinator', label: 'Coordinators (3)' },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedFilter(tab.id as any)}
                className={`flex-1 py-2 rounded-xl items-center ${
                  isSelected ? 'bg-forest shadow-sm' : 'bg-transparent'
                }`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Team Members List */}
        <View className="space-y-4 mb-8">
          {filteredMembers.map((member) => (
            <View
              key={member.id}
              className="bg-white rounded-3xl p-5 border border-border shadow-sm mb-3.5"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 border ${
                    member.category === 'coordinator' 
                      ? 'bg-indigo-100 border-indigo-300' 
                      : 'bg-mintLight/40 border-mint/25'
                  }`}>
                    <Text className={`font-extrabold text-base ${
                      member.category === 'coordinator' ? 'text-indigo-900' : 'text-forest'
                    }`}>
                      {member.avatar}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-ink leading-tight">{member.name}</Text>
                    <Text className="text-xs font-semibold text-emerald-800">{member.role}</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">
                      {member.category === 'coordinator' ? 'Dedicated HireBloom Coordinator' : 'Embedded Remote Specialist'}
                    </Text>
                  </View>
                </View>
                <View className={`px-2.5 py-0.5 rounded-full border ${
                  member.category === 'coordinator'
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <Text className={`font-extrabold text-[9px] uppercase ${
                    member.category === 'coordinator' ? 'text-indigo-800' : 'text-emerald-700'
                  }`}>
                    {member.category === 'coordinator' ? 'COORDINATOR' : 'ACTIVE'}
                  </Text>
                </View>
              </View>

              <View className="bg-canvas rounded-2xl p-3.5 space-y-2 mb-3.5 border border-border">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-inkMuted">Billing / Rate</Text>
                  <Text className="text-xs font-bold text-ink">{member.rate}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-inkMuted">Hours & Schedule</Text>
                  <Text className="text-xs font-semibold text-ink">{member.timezone}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-inkMuted">English Fluency</Text>
                  <Text className="text-xs font-semibold text-forest">{member.english}</Text>
                </View>
                <View className="flex-row justify-between items-center pt-1.5 border-t border-border">
                  <Text className="text-xs text-inkMuted">Reports To</Text>
                  <Text className="text-xs font-bold text-ink">{member.manager}</Text>
                </View>
              </View>

              {/* Action Buttons: Message, View Role Workflow, Inspect Workstation */}
              <View className="flex-row space-x-2 gap-2">
                <TouchableOpacity
                  onPress={() => handleTestRole(member)}
                  className="flex-1 bg-mint/20 border border-mint/40 py-2.5 rounded-xl flex-row items-center justify-center active:opacity-85"
                >
                  <Sparkles size={13} color="#113c2c" style={{ marginRight: 5 }} />
                  <Text className="text-forest font-bold text-xs">View Role</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSendMessage(member)}
                  className="flex-1 bg-forest py-2.5 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
                >
                  <MessageSquare size={13} color="white" style={{ marginRight: 5 }} />
                  <Text className="text-white font-bold text-xs">Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleInspectWorkstation(member)}
                  className="px-3 bg-canvas border border-border rounded-xl items-center justify-center active:opacity-75"
                >
                  <ShieldCheck size={16} color="#113C2C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Role Deep-Dive Modal (Explains exactly what this member does & how to test) */}
      {selectedMemberForModal && (
        <Modal
          visible={!!selectedMemberForModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedMemberForModal(null)}
        >
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200 max-h-[85%]">
              <View className="flex-row justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-10 h-10 rounded-xl bg-forest items-center justify-center mr-3">
                    <Text className="text-mint font-extrabold text-base">{selectedMemberForModal.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-extrabold text-slate-900">{selectedMemberForModal.name}</Text>
                    <Text className="text-xs font-semibold text-forest">{selectedMemberForModal.role}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedMemberForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                {/* Workflow Card */}
                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-3">
                  <View className="flex-row items-center mb-1.5">
                    <Briefcase size={14} color="#113c2c" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Role Responsibility & Workflow
                    </Text>
                  </View>
                  <Text className="text-slate-700 text-xs leading-relaxed">
                    {selectedMemberForModal.workflowDescription}
                  </Text>
                </View>

                {/* Core Tooling Stack */}
                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-3">
                  <View className="flex-row items-center mb-2">
                    <Zap size={14} color="#113c2c" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Core Tool Stack
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-1.5">
                    {selectedMemberForModal.coreTools.map((tool, idx) => (
                      <View key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-lg">
                        <Text className="text-forest font-bold text-xs">{tool}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Verified Hardware & Setup */}
                <View className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 mb-4">
                  <View className="flex-row items-center mb-1.5">
                    <ShieldCheck size={14} color="#047857" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Verified Hardware & Setup
                    </Text>
                  </View>
                  <Text className="text-emerald-800 text-xs leading-relaxed font-medium">
                    {selectedMemberForModal.workstationProof}
                  </Text>
                </View>
              </ScrollView>

              {/* Action */}
              <TouchableOpacity
                onPress={() => {
                  const target = selectedMemberForModal;
                  setSelectedMemberForModal(null);
                  handleOpenAssignTask(target);
                }}
                className="w-full bg-forest py-3.5 rounded-2xl items-center justify-center active:opacity-90 shadow-sm mt-3"
              >
                <Text className="text-white font-bold text-xs">
                  Assign Workflow Task to {selectedMemberForModal.name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Interactive Task Assignment Modal */}
      {isTaskModalVisible && selectedStaffForTask && (
        <Modal
          visible={isTaskModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsTaskModalVisible(false)}
        >
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-mint/40 max-h-[90%]">
              
              {/* Header */}
              <View className="flex-row justify-between items-center pb-3 border-b border-white/10 mb-4">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-10 h-10 rounded-xl bg-forest items-center justify-center mr-3 border border-mint/30">
                    <Text className="text-mint font-extrabold text-base">{selectedStaffForTask.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-extrabold text-base">Assign Task: {selectedStaffForTask.name}</Text>
                    <Text className="text-mint font-medium text-xs">{selectedStaffForTask.role}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsTaskModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* Authority Badge */}
              <View className="bg-indigo-950/80 border border-indigo-500/40 p-3 rounded-2xl mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 pr-2">
                  <Award size={15} color="#818cf8" style={{ marginRight: 6 }} />
                  <View>
                    <Text className="text-indigo-200 font-extrabold text-[11px] uppercase">
                      Admin / CEO Authority (Victor Taiwo)
                    </Text>
                    <Text className="text-zinc-400 text-[10px]">
                      Only authorized executive admins have clearance to assign vetting tasks
                    </Text>
                  </View>
                </View>
                <View className="bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/40">
                  <Text className="text-indigo-300 font-bold text-[9px]">CEO KEY</Text>
                </View>
              </View>

              <Text className="text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2">
                Select Vetting & Screening Action:
              </Text>

              {/* Task Options List */}
              <ScrollView showsVerticalScrollIndicator={false} className="space-y-2 mb-4">
                {[
                  {
                    title: 'Pre-Screen Applications & Verify Loom Video',
                    desc: 'Review candidate AI match scores, audit the 2-min Loom pitch for spoken English and presentation, and verify attached CV documents.',
                    nextStep: 'Coordinator checks the candidate and elevates them to your CEO Review Desk.'
                  },
                  {
                    title: 'Inspect Workstation, 50 Mbps Fiber & Backup',
                    desc: 'Perform diagnostic hardware audit, verify minimum 50 Mbps fiber internet, and confirm inverter power backup during power cuts.',
                    nextStep: 'Staff marks workstation certified (100% compliant).'
                  },
                  {
                    title: 'Spoken English & Reference Assessment',
                    desc: 'Conduct 10-minute conversational English screening (C1-C2 level) and contact previous employer references.',
                    nextStep: 'Coordinator attaches interview evaluation notes to candidate file.'
                  },
                  {
                    title: 'Elevate Shortlisted Candidate to CEO Final Review',
                    desc: 'Package top-scoring pre-screened talent into executive candidate dossier and route directly to Victor Taiwo for binding offer approval.',
                    nextStep: 'Candidate appears in CEO Master Review desk ready for offer issuance.'
                  }
                ].map((item, idx) => {
                  const isSelected = selectedTaskType === item.title;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedTaskType(item.title)}
                      className={`p-3.5 rounded-2xl border mb-2 ${
                        isSelected 
                          ? 'bg-forest border-mint/50 shadow-sm' 
                          : 'bg-slate-800/80 border-white/5'
                      }`}
                    >
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {item.title}
                        </Text>
                        {isSelected && (
                          <View className="w-4 h-4 rounded-full bg-mint items-center justify-center">
                            <CheckCircle2 size={12} color="#113c2c" />
                          </View>
                        )}
                      </View>
                      <Text className="text-zinc-300 text-[10px] leading-relaxed mb-1">
                        {item.desc}
                      </Text>
                      <View className="bg-black/30 px-2 py-1 rounded-lg self-start">
                        <Text className="text-mint font-semibold text-[9px]">
                          Next: {item.nextStep}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Submit Dispatch */}
              <TouchableOpacity
                onPress={() => {
                  setIsTaskModalVisible(false);
                  Alert.alert(
                    "Task Assigned Successfully",
                    `Assigned To: ${selectedStaffForTask.name} (${selectedStaffForTask.role})\nTask: ${selectedTaskType}\nDispatched By: Victor Taiwo (Admin / CEO)\n\nWhat will happen now:\n1. ${selectedStaffForTask.name} receives this task in their vetting queue.\n2. They will thoroughly examine the candidate applications and Loom video pitch.\n3. Once vetted, they will elevate the shortlisted candidate directly to your CEO Final Review Desk.`,
                    [
                      {
                        text: "Open Candidate Pipeline Desk",
                        onPress: () => router.push('/employer/candidates')
                      },
                      {
                        text: "Done",
                        style: "cancel"
                      }
                    ]
                  );
                }}
                className="w-full bg-mint py-3.5 rounded-2xl items-center justify-center active:opacity-90 shadow-sm"
              >
                <Text className="text-forest font-black text-xs">
                  Dispatch Task to {selectedStaffForTask.name}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
