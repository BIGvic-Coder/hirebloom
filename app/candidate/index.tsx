import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Search, MapPin, Building2, Clock, Bookmark, Sparkles, CheckCircle2, ArrowRight, X, Send, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ApplicationsService, JobItem } from '@/services/applicationsService';

export default function CandidateJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Application Modal state
  const [activeJobForModal, setActiveJobForModal] = useState<JobItem | null>(null);
  const [applicationNote, setApplicationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fetchedJobs = await ApplicationsService.getJobs();
    setJobs(fetchedJobs.filter(j => j.status === 'Active'));

    const existingApps = await ApplicationsService.getCandidateApplications();
    setAppliedJobIds(existingApps.map(a => a.jobId));
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenApplyModal = (job: JobItem) => {
    if (appliedJobIds.includes(job.id)) {
      router.push('/candidate/applications');
      return;
    }
    setActiveJobForModal(job);
    setApplicationNote('');
  };

  const handleSubmitApplication = async () => {
    if (!activeJobForModal) return;
    setIsSubmitting(true);

    const res = await ApplicationsService.applyForJob(activeJobForModal, {
      id: 'demo-candidate-1',
      name: 'Alex Morgan',
      email: 'alex.morgan@hirebloom.com',
      note: applicationNote.trim() || 'Excited to bring my BYU-Pathway accredited communication skills to this position.',
    });

    setIsSubmitting(false);
    if (res.success) {
      setAppliedJobIds(prev => [...prev, activeJobForModal.id]);
      setActiveJobForModal(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } else {
      Alert.alert('Application Notice', res.error || 'Could not submit application.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                          job.company.toLowerCase().includes(search.toLowerCase()) ||
                          job.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && (job.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) || job.title.toLowerCase().includes(selectedCategory.toLowerCase()));
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-slate-500 font-medium text-sm mb-0.5">Hello, Alex 👋</Text>
            <Text className="text-3xl font-extrabold text-slate-900">Find your next</Text>
            <Text className="text-3xl font-extrabold text-forest">dream job</Text>
          </View>
          <View className="bg-mint/20 px-3 py-1 rounded-full border border-mint/40 flex-row items-center mt-1">
            <Award size={12} color="#113c2c" style={{ marginRight: 4 }} />
            <Text className="text-forest font-extrabold text-[10px] uppercase">BYU-Pathway Vetted</Text>
          </View>
        </View>

        {/* Success Alert Banner */}
        {showSuccessToast && (
          <TouchableOpacity 
            onPress={() => router.push('/candidate/applications')}
            className="w-full bg-emerald-600 p-4 rounded-2xl flex-row items-center justify-between mb-4 shadow-md shadow-emerald-600/30"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <CheckCircle2 color="white" size={20} style={{ marginRight: 8 }} />
              <View>
                <Text className="text-white font-bold text-xs">Application Submitted Successfully!</Text>
                <Text className="text-emerald-100 text-[10px]">Track review progress in real-time</Text>
              </View>
            </View>
            <View className="bg-white/20 px-2.5 py-1 rounded-lg">
              <Text className="text-white font-bold text-[10px]">View Status</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5 shadow-sm mb-5">
          <Search color="#94a3b8" size={18} className="mr-3" />
          <TextInput 
            value={search}
            onChangeText={setSearch}
            placeholder="Search roles, skills, or companies..." 
            className="flex-1 text-slate-900 font-medium text-sm"
            placeholderTextColor="#94a3b8"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* AI Call to Action */}
        <TouchableOpacity 
          onPress={() => router.push('/candidate/ai-matching')}
          className="w-full bg-forest p-4 rounded-2xl flex-row items-center justify-between mb-6 shadow-md shadow-forest/20 active:opacity-90"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-mint/20 rounded-xl items-center justify-center mr-3 border border-mint/30">
              <Sparkles color="#8ecfa9" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm mb-0.5">Let Bloom match your profile</Text>
              <Text className="text-zinc-300 text-xs">Personalized BYU-Pathway employer recommendations</Text>
            </View>
          </View>
          <ArrowRight color="#8ecfa9" size={16} />
        </TouchableOpacity>

        {/* Categories */}
        <Text className="text-base font-bold text-slate-900 mb-3">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-12">
          {['All', 'Support', 'Success', 'Backend', 'Admin'].map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity 
                key={category} 
                onPress={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full mr-2.5 justify-center border ${
                  isSelected ? 'bg-forest border-forest' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Jobs List */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-bold text-slate-900">Available Requisitions ({filteredJobs.length})</Text>
          <TouchableOpacity onPress={() => router.push('/candidate/applications')}>
            <Text className="text-forest font-bold text-xs">Track Applications</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredJobs.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-200 mt-2">
              <Building2 size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
              <Text className="text-slate-800 font-bold text-sm">No positions match your filter</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Try refining your search keyword.</Text>
            </View>
          ) : (
            filteredJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
              const isBookmarked = !!bookmarkedIds[job.id];

              return (
                <View 
                  key={job.id} 
                  className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center flex-1 pr-2">
                      <View className="w-12 h-12 bg-mint/10 rounded-2xl items-center justify-center mr-3 border border-mint/25">
                        <Building2 color="#113c2c" size={20} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-slate-900 leading-tight mb-0.5">{job.title}</Text>
                        <Text className="text-slate-500 font-medium text-xs">{job.company}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => toggleBookmark(job.id)} className="p-1">
                      <Bookmark 
                        color={isBookmarked ? '#113c2c' : '#cbd5e1'} 
                        fill={isBookmarked ? '#113c2c' : 'transparent'} 
                        size={20} 
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <View className="flex-row items-center mr-4">
                      <MapPin color="#64748b" size={13} className="mr-1" />
                      <Text className="text-slate-500 text-xs">{job.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock color="#64748b" size={13} className="mr-1" />
                      <Text className="text-slate-500 text-xs">{job.salary}</Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-1.5 mb-4">
                    {job.tags.map((tag, i) => (
                      <View key={i} className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Text className="text-slate-600 font-medium text-[10px]">{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View className="border-t border-slate-100 pt-3 flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs">Posted {job.posted}</Text>
                    <TouchableOpacity
                      onPress={() => handleOpenApplyModal(job)}
                      className={`px-5 py-2.5 rounded-xl flex-row items-center ${
                        isApplied ? 'bg-mint/30 border border-mint' : 'bg-forest'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 color="#113c2c" size={14} style={{ marginRight: 5 }} />
                          <Text className="text-forest font-bold text-xs">Applied • View Status</Text>
                        </>
                      ) : (
                        <>
                          <Send color="white" size={14} style={{ marginRight: 5 }} />
                          <Text className="text-white font-bold text-xs">Apply Now</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* 1-Click Application Confirmation Modal */}
      <Modal
        visible={!!activeJobForModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveJobForModal(null)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          {activeJobForModal && (
            <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200">
              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-mint/20 rounded-xl items-center justify-center mr-3 border border-mint/30">
                    <Building2 color="#113c2c" size={20} />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-slate-900">Submit Application</Text>
                    <Text className="text-slate-400 text-xs">{activeJobForModal.company}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setActiveJobForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
                <Text className="text-xs font-bold text-forest uppercase tracking-wider mb-1">Applying for</Text>
                <Text className="text-base font-extrabold text-slate-900 mb-1">{activeJobForModal.title}</Text>
                <Text className="text-slate-500 text-xs">{activeJobForModal.location} • {activeJobForModal.salary}</Text>
              </View>

              {/* Applicant Snapshot */}
              <View className="bg-mint/10 border border-mint/30 p-3.5 rounded-2xl mb-4">
                <View className="flex-row items-center mb-1">
                  <Award size={14} color="#113c2c" style={{ marginRight: 6 }} />
                  <Text className="text-forest font-bold text-xs">Vetted BYU-Pathway Profile Attached</Text>
                </View>
                <Text className="text-zinc-600 text-[11px] leading-tight">
                  Alex Morgan • C1 English Verified • Camera & Power Backup Confirmed
                </Text>
              </View>

              {/* Optional Note */}
              <View className="mb-5">
                <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wider">
                  Intro Note to Hiring Manager (Optional)
                </Text>
                <TextInput
                  value={applicationNote}
                  onChangeText={setApplicationNote}
                  placeholder="Share any specific tools or past experiences you bring..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmitApplication}
                disabled={isSubmitting}
                className="w-full bg-forest py-4 rounded-2xl items-center justify-center active:opacity-90 shadow-md shadow-forest/20"
              >
                <Text className="text-white font-bold text-sm">
                  {isSubmitting ? 'Submitting Application...' : 'Confirm & Apply'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
