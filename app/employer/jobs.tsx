import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Plus, MapPin, Clock, Users, ChevronRight, MoreVertical, X, Briefcase, DollarSign, CheckCircle, ShieldAlert, ShieldCheck, Crown } from 'lucide-react-native';
import { ApplicationsService, JobItem, canUserPostJob } from '@/services/applicationsService';
import { auth, db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function EmployerJobs() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Active' | 'Drafts' | 'Closed'>('Active');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUnauthorizedModalVisible, setIsUnauthorizedModalVisible] = useState(false);

  // User Role (Admin, CEO, Owner, Employer)
  const [currentRole, setCurrentRole] = useState<string>('ceo'); // default executive tester

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Remote (US Hours)');
  const [newType, setNewType] = useState('Full-time');
  const [newRate, setNewRate] = useState('$13 - $15 / hr');
  const [newTags, setNewTags] = useState('BYU-Pathway, Customer Support, English C1');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadJobs();
    resolveUserRole();
  }, []);

  const loadJobs = async () => {
    const fetched = await ApplicationsService.getJobs();
    setJobs(fetched);
  };

  const resolveUserRole = async () => {
    try {
      if (!IS_MOCK_FIREBASE && auth?.currentUser && db) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role) {
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

  const handleCreateJob = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Field', 'Please enter a job title');
      return;
    }

    setIsPublishing(true);
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);

    const result = await ApplicationsService.createJob({
      title: newTitle.trim(),
      company: 'TechNova Inc.',
      location: newLocation.trim() || 'Remote (US Hours)',
      salary: newRate.trim() || '$13 - $15 / hr',
      type: newType,
      tags: tagsArray.length > 0 ? tagsArray : ['BYU-Pathway', 'Remote'],
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
            className="w-11 h-11 bg-forest rounded-2xl items-center justify-center shadow-lg shadow-forest/20 active:opacity-90"
          >
            <Plus color="#8ecfa9" size={24} />
          </TouchableOpacity>
        </View>

        {/* Role Permission Bar */}
        <View className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-7 h-7 rounded-lg bg-mint/20 items-center justify-center mr-2.5">
              <Crown size={14} color="#113c2c" />
            </View>
            <View>
              <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Poster Authority</Text>
              <Text className="text-forest font-extrabold text-xs capitalize">{currentRole} • Authorized</Text>
            </View>
          </View>

          {/* Quick Role Tester switcher */}
          <View className="flex-row gap-1">
            {['ceo', 'employer', 'candidate'].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setCurrentRole(r)}
                className={`px-2 py-1 rounded-md border ${
                  currentRole === r ? 'bg-forest border-forest' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className={`text-[9px] font-bold uppercase ${currentRole === r ? 'text-white' : 'text-slate-500'}`}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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

                <View className="flex-row items-center justify-between mt-2 pt-3.5 border-t border-slate-100">
                  <View className="flex-row items-center bg-mint/15 px-2.5 py-1 rounded-lg border border-mint/30">
                    <Users color="#113c2c" size={14} style={{ marginRight: 5 }} />
                    <Text className="text-forest font-bold text-xs">{job.applicants} Applicants</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-xs mr-1">Posted by {job.postedByRole || 'Admin'}</Text>
                    <ChevronRight color="#94a3b8" size={14} />
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Post a Job Modal (Role-Restricted) */}
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
                <View className="w-10 h-10 bg-mint/20 rounded-xl items-center justify-center mr-3 border border-mint/40">
                  <Briefcase color="#113c2c" size={20} />
                </View>
                <View>
                  <Text className="text-xl font-bold text-slate-900">Post New Role</Text>
                  <Text className="text-slate-400 text-xs">Publishing with authority: <Text className="font-bold text-forest uppercase">{currentRole}</Text></Text>
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
                <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">Role Title</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Bilingual Customer Success Specialist"
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
                          newType === t ? 'bg-forest border-forest' : 'bg-slate-50 border-slate-200'
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                />
              </View>
            </View>

            {/* Pricing note */}
            <View className="bg-mint/10 border border-mint/25 rounded-2xl p-3 mb-5 flex-row items-center">
              <CheckCircle size={16} color="#113c2c" style={{ marginRight: 8 }} />
              <Text className="text-forest text-[11px] font-medium leading-snug flex-1">
                Embedded teams standard flat rate: <Text className="font-bold">$13.00/hour</Text>. Published directly to verified candidate matching.
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleCreateJob}
              disabled={isPublishing}
              className="w-full bg-forest py-4 rounded-2xl items-center justify-center active:opacity-90 shadow-md shadow-forest/20"
            >
              <Text className="text-white font-bold text-sm">
                {isPublishing ? 'Publishing Requisition...' : 'Publish Opening Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Unauthorized Access Modal (Candidate barrier) */}
      <Modal
        visible={isUnauthorizedModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsUnauthorizedModalVisible(false)}
      >
        <View className="flex-1 bg-black/75 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-200 items-center">
            <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-4">
              <ShieldAlert color="#dc2626" size={28} />
            </View>

            <Text className="text-xl font-bold text-slate-900 text-center mb-2">
              Permission Restricted
            </Text>

            <Text className="text-slate-600 text-xs text-center leading-relaxed mb-6">
              Only verified <Text className="font-bold text-slate-900">Admins</Text>, <Text className="font-bold text-slate-900">CEOs</Text>, <Text className="font-bold text-slate-900">Owners</Text>, or <Text className="font-bold text-slate-900">Employers</Text> have authorization to publish job openings.
              {'\n\n'}
              Your current account role is <Text className="font-bold text-red-600 uppercase">{currentRole}</Text>.
            </Text>

            <TouchableOpacity
              onPress={() => setIsUnauthorizedModalVisible(false)}
              className="w-full bg-forest py-3.5 rounded-xl items-center justify-center active:opacity-90"
            >
              <Text className="text-white font-bold text-xs">Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
