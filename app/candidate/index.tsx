import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  Bookmark, 
  CheckCircle2, 
  X, 
  Send, 
  Award, 
  FileText, 
  UploadCloud, 
  Check 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ApplicationsService, JobItem, UserSession } from '@/services/applicationsService';

export default function CandidateJobs() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Application Modal state
  const [activeJobForModal, setActiveJobForModal] = useState<JobItem | null>(null);
  const [applicationNote, setApplicationNote] = useState('');
  const [attachedResume, setAttachedResume] = useState<{ name: string; size: string; url?: string }>({
    name: 'victor_resume_2026.pdf',
    size: '1.4 MB'
  });
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await ApplicationsService.getCurrentUser();
    setCurrentUser(user);

    const savedResume = await ApplicationsService.getSavedCandidateResume();
    if (savedResume) {
      setAttachedResume(savedResume);
    }

    const fetchedJobs = await ApplicationsService.getJobs();
    setJobs(fetchedJobs.filter(j => j.status === 'Active'));

    const existingApps = await ApplicationsService.getCandidateApplications();
    setAppliedJobIds(existingApps.map(a => a.jobId));
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetTestApplications = async () => {
    Alert.alert(
      "Reset Applications for Testing",
      "This will clear all application caches so all positions (including Senior Customer Support Lead) become clean and unapplied. Ready to test fresh?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Clean",
          style: "destructive",
          onPress: async () => {
            await ApplicationsService.resetTestApplications();
            setAppliedJobIds([]);
            await loadData();
            Alert.alert("Reset Completed", "All job positions are now fresh and ready for new test applications!");
          }
        }
      ]
    );
  };

  const handleOpenApplyModal = (job: JobItem) => {
    if (appliedJobIds.includes(job.id)) {
      Alert.alert(
        "Application Status",
        `You previously submitted an application for ${job.title}.\n\nWhat would you like to do?`,
        [
          { text: "View Current Status", onPress: () => router.push('/candidate/applications') },
          { 
            text: "Apply Again (Test Fresh Apply)", 
            onPress: () => {
              setActiveJobForModal(job);
              setApplicationNote('');
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }
    setActiveJobForModal(job);
    setApplicationNote('');
  };

  // Resume Upload Handler (allows selecting or simulating upload of updated CV)
  const handlePickResume = () => {
    Alert.alert(
      "Attach Resume",
      "Choose a document from your device or select an existing resume profile:",
      [
        {
          text: "Upload Standard CV (PDF)",
          onPress: () => {
            setIsUploadingResume(true);
            setTimeout(() => {
              const updated = { name: `${(currentUser?.name || 'Victor').toLowerCase()}_resume_2026.pdf`, size: '1.4 MB' };
              setAttachedResume(updated);
              ApplicationsService.saveCandidateResume(updated);
              setIsUploadingResume(false);
              Alert.alert("Resume Attached", "Your PDF resume has been attached to this application.");
            }, 600);
          }
        },
        {
          text: "Upload Tailored Support CV (DOCX)",
          onPress: () => {
            setIsUploadingResume(true);
            setTimeout(() => {
              const updated = { name: `${(currentUser?.name || 'Victor').toLowerCase()}_support_specialist_cv.docx`, size: '890 KB' };
              setAttachedResume(updated);
              ApplicationsService.saveCandidateResume(updated);
              setIsUploadingResume(false);
              Alert.alert("Resume Attached", "Tailored support resume attached successfully.");
            }, 600);
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleSubmitApplication = async () => {
    if (!activeJobForModal) return;
    setIsSubmitting(true);

    const candidateName = currentUser?.name || 'Victor Taiwo';
    const candidateEmail = currentUser?.email || 'victor@hirebloom.com';
    const candidateId = currentUser?.uid || 'demo-candidate-1';

    const res = await ApplicationsService.applyForJob(activeJobForModal, {
      id: candidateId,
      name: candidateName,
      email: candidateEmail,
      note: applicationNote.trim() || 'Excited to bring my communication and technical background to this position.',
      resume: attachedResume
    });

    setIsSubmitting(false);
    if (res.success) {
      setAppliedJobIds(prev => [...prev, activeJobForModal.id]);
      setActiveJobForModal(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
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
            <Text className="text-slate-500 font-medium text-sm mb-0.5">
              Hello, {currentUser?.name || 'Victor'} 👋
            </Text>
            <Text className="text-3xl font-extrabold text-slate-900">Find your next</Text>
            <Text className="text-3xl font-extrabold text-forest">dream job</Text>
          </View>
          <View className="bg-mint/20 px-3 py-1 rounded-full border border-mint/40 flex-row items-center mt-1">
            <Award size={12} color="#113c2c" style={{ marginRight: 4 }} />
            <Text className="text-forest font-extrabold text-[10px] uppercase">Talent Network</Text>
          </View>
        </View>

        {/* Success Alert Banner with direct link to Talent Portal Status */}
        {showSuccessToast && (
          <TouchableOpacity 
            onPress={() => router.push('/candidate/applications')}
            className="w-full bg-emerald-600 p-4 rounded-2xl flex-row items-center justify-between mb-4 shadow-md shadow-emerald-600/30"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <CheckCircle2 color="white" size={20} style={{ marginRight: 8 }} />
              <View>
                <Text className="text-white font-bold text-xs">Application Submitted to Hiring Team!</Text>
                <Text className="text-emerald-100 text-[10px]">Tap to view your Talent Portal status</Text>
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
              <X color="#94a3b8" size={16} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-11">
          {['All', 'Support', 'Full-time', 'Contract', 'Engineering', 'Operations'].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full mr-2 border ${
                  isSelected ? 'bg-forest border-forest' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Job Feed Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-extrabold text-slate-900">
            Open Positions ({filteredJobs.length})
          </Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={handleResetTestApplications}
              className="bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg mr-2 active:opacity-75"
            >
              <Text className="text-emerald-900 font-bold text-[11px]">🔄 Reset Test</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/candidate/applications')}>
              <Text className="text-forest font-bold text-xs">Talent Portal Status</Text>
            </TouchableOpacity>
          </View>
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

      {/* Application Confirmation Modal with Resume Upload */}
      <Modal
        visible={!!activeJobForModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveJobForModal(null)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          {activeJobForModal && (
            <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-4">
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

              {/* Job Info Banner */}
              <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
                <Text className="text-xs font-bold text-forest uppercase tracking-wider mb-1">Applying for</Text>
                <Text className="text-base font-extrabold text-slate-900 mb-1">{activeJobForModal.title}</Text>
                <Text className="text-slate-500 text-xs">{activeJobForModal.location} • {activeJobForModal.salary}</Text>
              </View>

              {/* Attached Resume Section */}
              <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-2.5">
                  <View className="flex-row items-center">
                    <FileText size={15} color="#113c2c" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Attached Resume / CV
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={handlePickResume}
                    disabled={isUploadingResume}
                    className="flex-row items-center"
                  >
                    <UploadCloud size={14} color="#059669" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-700 font-bold text-xs">
                      {isUploadingResume ? 'Uploading...' : 'Change File'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-2.5 border border-red-200">
                      <FileText size={16} color="#dc2626" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold text-xs" numberOfLines={1}>
                        {attachedResume.name}
                      </Text>
                      <Text className="text-zinc-500 text-[10px]">
                        {attachedResume.size} • Ready for hiring team
                      </Text>
                    </View>
                  </View>

                  <View className="bg-emerald-100 px-2 py-0.5 rounded-md flex-row items-center">
                    <Check size={11} color="#059669" strokeWidth={3} style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-emerald-800">Attached</Text>
                  </View>
                </View>
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
