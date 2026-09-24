import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MapPin, Clock, Users, ChevronRight, MoreVertical, X, Briefcase, DollarSign, CheckCircle, ShieldAlert, ShieldCheck, Award, Sparkles, Building2, Video, FileText, Calendar, AlertCircle } from 'lucide-react-native';
import { ApplicationsService, JobItem, JobApplication, canUserPostJob } from '@/services/applicationsService';
import { auth, db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, useFocusEffect } from 'expo-router';

export default function EmployerJobs() {
  const router = useRouter() as any;
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Active' | 'Drafts' | 'Closed'>('Active');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUnauthorizedModalVisible, setIsUnauthorizedModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selected Job for viewing applicants
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<JobItem | null>(null);
  const [jobApplicantsList, setJobApplicantsList] = useState<JobApplication[]>([]);
  const [isApplicantsModalVisible, setIsApplicantsModalVisible] = useState(false);

  // User Role (Admin, CEO, Owner, Employer)
  const [currentRole, setCurrentRole] = useState<string>('ceo'); // default executive tester

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('HireBloom Inc.');
  const [newLocation, setNewLocation] = useState('Remote (US Hours)');
  const [newType, setNewType] = useState('Full-time');
  const [newRate, setNewRate] = useState('$13 - $15 / hr');
  const [newTags, setNewTags] = useState('BYU-Pathway, Customer Support, English C1');
  const [newMaxApplicants, setNewMaxApplicants] = useState('50');
  const [newDeadline, setNewDeadline] = useState('Oct 30, 2026');
  const [isCeoPriority, setIsCeoPriority] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Auto-reload on screen focus so newly submitted applications reflect immediately
  useFocusEffect(
    useCallback(() => {
      loadJobs();
      resolveUserRole();
    }, [])
  );

  useEffect(() => {
    loadJobs();
    resolveUserRole();
  }, []);

  const loadJobs = async () => {
    const fetched = await ApplicationsService.getJobs();
    setJobs(fetched);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadJobs();
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenJobApplicants = async (job: JobItem) => {
    setSelectedJobForApplicants(job);
    setIsApplicantsModalVisible(true);
    const applicants = await ApplicationsService.getApplicantsForJob(job.id || job.title);
    setJobApplicantsList(applicants);
  };

  const resolveUserRole = async () => {
    try {
      const session = await ApplicationsService.getCurrentUser();
      if (session?.role) {
        if (session.role === 'candidate') {
          // If stored as candidate, auto-default to CEO authority in the employer console
          setCurrentRole('ceo');
        } else {
          setCurrentRole(session.role);
        }
      } else {
        setCurrentRole('ceo');
      }

      if (!IS_MOCK_FIREBASE && auth?.currentUser && db) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role && data.role !== 'candidate') {
            setCurrentRole(data.role);
          }
        }
      }
    } catch (e) {
      console.log('Error checking role:', e);
    }
  };

  const filteredJobs = jobs.filter((j) => j.status === activeTab);

  const handleOpenPostJob = () => {
    if (!canUserPostJob(currentRole)) {
      setIsUnauthorizedModalVisible(true);
      return;
    }
    setIsModalVisible(true);
  };

  const handleElevateAndPost = async (role: 'ceo' | 'employer') => {
    await ApplicationsService.elevateRoleTo(role);
    setCurrentRole(role);
    setIsUnauthorizedModalVisible(false);
    setIsModalVisible(true);
  };

  const handleCreateJob = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Field', 'Please enter a job title');
      return;
    }

    setIsPublishing(true);
    let tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    if (isCeoPriority && !tagsArray.includes('Executive Priority')) {
      tagsArray = ['Executive Priority', ...tagsArray];
    }

    const result = await ApplicationsService.createJob({
      title: newTitle.trim(),
      company: newCompany.trim() || 'HireBloom Inc.',
      location: newLocation.trim() || 'Remote (US Hours)',
      salary: newRate.trim() || '$13 - $15 / hr',
      type: newType,
      tags: tagsArray.length > 0 ? tagsArray : ['BYU-Pathway', 'Remote'],
      maxApplicants: parseInt(newMaxApplicants, 10) || 50,
      deadline: newDeadline.trim() || undefined,
      posted: 'Just now',
      status: 'Active',
      postedByRole: currentRole,
    }, currentRole, auth?.currentUser?.uid);

    setIsPublishing(false);

    if (result.success && result.job) {
      setJobs(prev => [result.job!, ...prev]);
      setNewTitle('');
      setActiveTab('Active');
      setIsModalVisible(false);
      Alert.alert('Role Published', 'Job opening has been published live to the candidate portal!');
    } else {
      Alert.alert('Posting Error', result.error || 'Could not publish job.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header with Permission / Role Badge */}
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900">Job Requisitions</Text>
            <Text className="text-slate-500 text-xs mt-0.5">Manage and post candidate requisitions</Text>
          </View>
          <TouchableOpacity 
            onPress={handleOpenPostJob}
            className={`w-11 h-11 rounded-2xl items-center justify-center shadow-lg active:opacity-90 ${
              currentRole === 'ceo' 
                ? 'bg-indigo-950 shadow-indigo-950/20' 
                : 'bg-forest shadow-forest/20'
            }`}
          >
            <Plus color={currentRole === 'ceo' ? '#a5b4fc' : '#8ecfa9'} size={24} />
          </TouchableOpacity>
        </View>

        {/* Role Permission Bar with Visual Distinction: CEO (Royal Indigo) vs Employer (Emerald Forest) */}
        <View className={`p-3 rounded-2xl border shadow-sm mb-5 flex-row items-center justify-between ${
          currentRole === 'ceo'
            ? 'bg-slate-900 border-indigo-500/50'
            : 'bg-white border-slate-200'
        }`}>
          <View className="flex-row items-center flex-1 pr-2">
            <View className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${
              currentRole === 'ceo' ? 'bg-indigo-950 border border-indigo-700/60' : 'bg-mint/20'
            }`}>
              {currentRole === 'ceo' ? (
                <Award size={15} color="#818cf8" />
              ) : (
                <Briefcase size={15} color="#113c2c" />
              )}
            </View>
            <View>
              <Text className={`text-[9px] uppercase font-bold tracking-wider ${
                currentRole === 'ceo' ? 'text-indigo-300' : 'text-slate-400'
              }`}>
                {currentRole === 'ceo' ? 'Executive Authority' : 'Employer Authority'}
              </Text>
              <Text className={`font-extrabold text-xs capitalize ${
                currentRole === 'ceo' ? 'text-white' : 'text-forest'
              }`}>
                {currentRole === 'ceo' ? 'CEO Executive Suite • Authorized' : `${currentRole} Workspace • Authorized`}
              </Text>
            </View>
          </View>
        </View>

        {/* Filters/Tabs */}
        <View className="flex-row mb-6 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm">
          {(['Active', 'Drafts', 'Closed'] as const).map((tab) => {
            const count = jobs.filter((j) => j.status === tab).length;
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
                  isSelected ? 'bg-forest shadow-sm' : 'bg-transparent'
                }`}
              >
                <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Jobs List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#113c2c']} />
          }
        >
          {filteredJobs.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-200/80 mt-4">
              <Briefcase size={32} color="#94a3b8" style={{ marginBottom: 10 }} />
              <Text className="text-slate-700 font-bold text-sm">No {activeTab} jobs</Text>
              <Text className="text-slate-400 text-xs mt-1 text-center">
                {activeTab === 'Active' ? 'Click "+" above to post your first requisition.' : 'No listings currently in this folder.'}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <View
                key={job.id} 
                className="bg-white rounded-3xl p-5 mb-4 border border-slate-200/80 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-bold text-slate-900 leading-tight flex-1">{job.title}</Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <MapPin color="#64748b" size={13} className="mr-1" />
                      <Text className="text-slate-500 text-xs mr-3">{job.location}</Text>
                      <Clock color="#64748b" size={13} className="mr-1" />
                      <Text className="text-slate-500 text-xs">{job.type}</Text>
                    </View>
                  </View>
                  <TouchableOpacity className="p-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <MoreVertical color="#94a3b8" size={16} />
                  </TouchableOpacity>
                </View>

                {job.tags && job.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mb-3">
                    {job.tags.map((tag, idx) => (
                      <View key={idx} className="bg-slate-100 px-2.5 py-0.5 rounded-md">
                        <Text className="text-slate-600 font-medium text-[10px]">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Deadline & Capacity Info */}
                <View className="flex-row items-center flex-wrap gap-2 mb-2">
                  <View className="flex-row items-center bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <Users size={11} color="#64748b" style={{ marginRight: 4 }} />
                    <Text className="text-slate-600 text-[10px] font-semibold">
                      Cap: {job.maxApplicants || 50} Max
                    </Text>
                  </View>
                  {job.deadline && (
                    <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Calendar size={11} color="#b45309" style={{ marginRight: 4 }} />
                      <Text className="text-amber-800 text-[10px] font-semibold">
                        Deadline: {job.deadline}
                      </Text>
                    </View>
                  )}
                  {Boolean(job.maxApplicants && (job.applicants || 0) >= job.maxApplicants) && (
                    <View className="bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      <Text className="text-red-700 text-[10px] font-bold">Capacity Full</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  onPress={() => handleOpenJobApplicants(job)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between mt-2 pt-3.5 border-t border-slate-100"
                >
                  <View className="flex-row items-center bg-mint/20 px-3 py-1.5 rounded-lg border border-mint/40">
                    <Users color="#113c2c" size={14} style={{ marginRight: 6 }} />
                    <Text className="text-forest font-bold text-xs">
                      {job.applicants} / {job.maxApplicants || 50} {job.applicants === 1 ? 'Applicant' : 'Applicants'}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Text className="text-forest font-bold text-xs mr-1">View Candidates</Text>
                    <ChevronRight color="#113c2c" size={13} />
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Post a Job Modal (Role-Restricted) */}
      {isModalVisible && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 border ${
                  currentRole === 'ceo' ? 'bg-indigo-950 border-indigo-700/60' : 'bg-mint/20 border-mint/40'
                }`}>
                  {currentRole === 'ceo' ? (
                    <Award color="#818cf8" size={20} />
                  ) : (
                    <Briefcase color="#113c2c" size={20} />
                  )}
                </View>
                <View>
                  <Text className="text-xl font-bold text-slate-900">
                    {currentRole === 'ceo' ? 'Executive Requisition' : 'Create Job Requisition'}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {currentRole === 'ceo' 
                      ? 'Publishing with CEO Executive Authority' 
                      : 'Live requisition published directly to candidate portal'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="space-y-4 mb-5">
              <View>
                <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Role Title Needed</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Bilingual Customer Success Specialist"
                  placeholderTextColor="#94a3b8"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium mb-3"
                />
              </View>

              <View>
                <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Company Name</Text>
                <TextInput
                  value={newCompany}
                  onChangeText={setNewCompany}
                  placeholder="e.g. HireBloom Inc."
                  placeholderTextColor="#94a3b8"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium mb-3"
                />
              </View>

              <View>
                <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Location / Hours</Text>
                <TextInput
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="e.g. Remote (US Eastern Time)"
                  placeholderTextColor="#94a3b8"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium mb-3"
                />
              </View>

              <View className="flex-row space-x-3 mb-3">
                <View className="flex-1">
                  <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Engagement</Text>
                  <View className="flex-row gap-2">
                    {['Full-time', 'Contract'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setNewType(t)}
                        className={`flex-1 py-2.5 rounded-xl items-center border ${
                          newType === t ? (currentRole === 'ceo' ? 'bg-indigo-900 border-indigo-700' : 'bg-forest border-forest') : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Text className={`font-bold text-xs ${newType === t ? 'text-white' : 'text-slate-600'}`}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Requirement Tags (Comma Separated)</Text>
                <TextInput
                  value={newTags}
                  onChangeText={setNewTags}
                  placeholder="e.g. Zendesk, BYU-Pathway, English C1"
                  placeholderTextColor="#94a3b8"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium mb-3"
                />
              </View>

              <View className="flex-row space-x-3 mb-3">
                <View className="flex-1 mr-2">
                  <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Applicant Limit (Cap)</Text>
                  <TextInput
                    value={newMaxApplicants}
                    onChangeText={setNewMaxApplicants}
                    placeholder="e.g. 50"
                    keyboardType="numeric"
                    placeholderTextColor="#94a3b8"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Application Deadline</Text>
                  <TextInput
                    value={newDeadline}
                    onChangeText={setNewDeadline}
                    placeholder="e.g. Oct 30, 2026"
                    placeholderTextColor="#94a3b8"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                  />
                </View>
              </View>

              {/* Priority Toggle */}
              <TouchableOpacity
                onPress={() => setIsCeoPriority(!isCeoPriority)}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                  isCeoPriority 
                    ? currentRole === 'ceo' ? 'bg-indigo-950/20 border-indigo-500' : 'bg-mint/15 border-mint' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <Award size={16} color={isCeoPriority ? (currentRole === 'ceo' ? '#6366f1' : '#113c2c') : '#64748b'} style={{ marginRight: 8 }} />
                  <View className="flex-1">
                    <Text className="font-bold text-xs text-slate-900">
                      {currentRole === 'ceo' ? 'Executive Priority Requisition' : 'Mark as Urgent Requisition'}
                    </Text>
                    <Text className="text-slate-500 text-[10px]">
                      {currentRole === 'ceo' ? 'Highlights with Executive badge and prioritizes candidate matching' : 'Fast-tracks applicant review with the recruitment team'}
                    </Text>
                  </View>
                </View>
                <View className={`w-6 h-6 rounded-full items-center justify-center ${
                  isCeoPriority ? (currentRole === 'ceo' ? 'bg-indigo-600' : 'bg-forest') : 'bg-slate-200'
                }`}>
                  <CheckCircle size={14} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Pricing note */}
            <View className="bg-mint/10 border border-mint/25 rounded-2xl p-3 mb-5 flex-row items-center">
              <CheckCircle size={16} color="#113c2c" style={{ marginRight: 8 }} />
              <Text className="text-forest text-[11px] font-medium leading-snug flex-1">
                Embedded teams standard flat rate: <Text className="font-bold">$13.00/hour</Text>. Published live to talent portal with full candidate tracking.
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleCreateJob}
              disabled={isPublishing}
              className={`w-full py-4 rounded-2xl items-center justify-center active:opacity-90 shadow-md ${
                currentRole === 'ceo' ? 'bg-indigo-950 shadow-indigo-950/20' : 'bg-forest shadow-forest/20'
              }`}
            >
              <Text className="text-white font-bold text-sm">
                {isPublishing 
                  ? 'Submitting Requisition...' 
                  : currentRole === 'ceo' 
                  ? 'Publish Executive Opening' 
                  : 'Publish Job Requisition'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      )}

      {/* Unauthorized Access Modal with 1-Tap Upgrade */}
      {isUnauthorizedModalVisible && (
        <Modal
          visible={isUnauthorizedModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsUnauthorizedModalVisible(false)}
        >
        <View className="flex-1 bg-black/75 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-200 items-center">
            <View className="w-14 h-14 rounded-full bg-indigo-100 items-center justify-center mb-4">
              <ShieldCheck color="#4338ca" size={28} />
            </View>

            <Text className="text-xl font-bold text-slate-900 text-center mb-2">
              Activate Hiring Authority
            </Text>

            <Text className="text-slate-600 text-xs text-center leading-relaxed mb-5">
              You are currently testing in <Text className="font-bold text-slate-900 uppercase">{currentRole}</Text> mode. As the app owner or hiring manager, activate your authority below to publish job openings immediately.
            </Text>

            <TouchableOpacity
              onPress={() => handleElevateAndPost('ceo')}
              className="w-full bg-indigo-950 py-3.5 rounded-xl items-center justify-center active:opacity-90 mb-2.5 shadow-sm"
            >
              <Text className="text-white font-bold text-xs">Activate CEO / Owner Authority</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleElevateAndPost('employer')}
              className="w-full bg-forest py-3 rounded-xl items-center justify-center active:opacity-90 mb-2 shadow-sm"
            >
              <Text className="text-white font-bold text-xs">Activate Employer Authority</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsUnauthorizedModalVisible(false)}
              className="py-2 items-center"
            >
              <Text className="text-slate-400 font-medium text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      )}

      {/* Applicants View Modal */}
      {isApplicantsModalVisible && selectedJobForApplicants && (
        <Modal
          visible={isApplicantsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsApplicantsModalVisible(false)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200 max-h-[85%]">
              {/* Header */}
              <View className="flex-row justify-between items-start mb-4 pb-3 border-b border-slate-100">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center mb-1">
                    <View className="w-2 h-2 rounded-full bg-mint mr-2" />
                    <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      {selectedJobForApplicants.company}
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedJobForApplicants.title}
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    {jobApplicantsList.length} {jobApplicantsList.length === 1 ? 'Candidate Applied' : 'Candidates Applied'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsApplicantsModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X color="#64748b" size={16} />
                </TouchableOpacity>
              </View>

              {/* Applicants List */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {jobApplicantsList.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <View className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3">
                      <Users color="#94a3b8" size={26} />
                    </View>
                    <Text className="text-slate-800 font-bold text-base mb-1">No Applications Yet</Text>
                    <Text className="text-slate-500 text-xs text-center px-4 leading-relaxed">
                      When candidates apply to this position from iPhone or Android, their verified applications will appear here in real-time.
                    </Text>
                  </View>
                ) : (
                  jobApplicantsList.map((applicant) => (
                    <View
                      key={applicant.id}
                      className="bg-slate-50 rounded-2xl p-4 mb-3 border border-slate-200/70"
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-row items-center flex-1 pr-2">
                          <View className="w-10 h-10 rounded-full bg-mint/20 border border-mint/40 items-center justify-center mr-3">
                            <Text className="text-forest font-bold text-sm">
                              {applicant.candidateInitials || 'AP'}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-slate-900 font-bold text-sm">{applicant.candidateName}</Text>
                            <Text className="text-slate-500 text-[11px]">{applicant.candidateEmail}</Text>
                            {applicant.candidatePhone && (
                              <Text className="text-slate-500 text-[11px]">{applicant.candidatePhone}</Text>
                            )}
                          </View>
                        </View>
                        <View className="bg-white px-2.5 py-1 rounded-full border border-slate-200">
                          <Text className="text-forest font-bold text-[10px]">{applicant.status}</Text>
                        </View>
                      </View>

                      {applicant.notes && (
                        <View className="bg-white p-2.5 rounded-xl border border-slate-100 my-2">
                          <Text className="text-slate-600 text-xs leading-relaxed italic">
                            "{applicant.notes}"
                          </Text>
                        </View>
                      )}

                      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                        {applicant.loomUrl ? (
                          <TouchableOpacity
                            onPress={() => Linking.openURL(applicant.loomUrl!)}
                            className="bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-lg flex-row items-center"
                          >
                            <Video color="#4338ca" size={13} style={{ marginRight: 4 }} />
                            <Text className="text-indigo-900 font-bold text-[11px]">Watch Loom Pitch</Text>
                          </TouchableOpacity>
                        ) : (
                          <View />
                        )}

                        <TouchableOpacity
                          onPress={() => {
                            setIsApplicantsModalVisible(false);
                            router.push('/employer/candidates');
                          }}
                          className="bg-forest px-3.5 py-1.5 rounded-lg flex-row items-center shadow-sm"
                        >
                          <Text className="text-white font-bold text-[11px] mr-1">Review in Desk</Text>
                          <ChevronRight color="#ffffff" size={13} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
