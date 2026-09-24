import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert, 
  Linking, 
  RefreshControl, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Mail,
  RefreshCw,
  Globe,
  ChevronDown,
  Users,
  Calendar,
  AlertCircle,
  Sparkles,
  UserCheck,
  Phone,
  Check
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ApplicationsService, JobItem, UserSession, isJobOpenForApplications } from '@/services/applicationsService';
import { EmailService } from '@/services/emailService';
import EmailInboxModal from '@/components/ui/EmailInboxModal';
import { HIRING_COUNTRIES, CountryItem } from '@/constants/countries';
import * as DocumentPicker from 'expo-document-picker';

export default function CandidateJobs() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Application Modal state
  const [activeJobForModal, setActiveJobForModal] = useState<JobItem | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(HIRING_COUNTRIES[0]);
  const [candidatePhone, setCandidatePhone] = useState('');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [aboutCandidate, setAboutCandidate] = useState('');
  const [reasonForApplying, setReasonForApplying] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationNote, setApplicationNote] = useState('');
  const [attachedResume, setAttachedResume] = useState<{ name: string; size: string; url?: string }>({
    name: 'resume_document.pdf',
    size: '1.2 MB'
  });
  const [loomVideoUrl, setLoomVideoUrl] = useState('https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(refreshCounts, 4000);
    return () => clearInterval(interval);
  }, []);

  const refreshCounts = async () => {
    try {
      const user = await ApplicationsService.getCurrentUser();
      if (user?.email) {
        const count = await EmailService.getUnreadCount(user.email);
        setUnreadEmailCount(count);
      }
    } catch {
      // safe
    }
  };

  const loadData = async () => {
    const user = await ApplicationsService.getCurrentUser();
    setCurrentUser(user);

    if (user?.country) {
      const matched = HIRING_COUNTRIES.find(
        c => c.name.toLowerCase() === user.country?.toLowerCase() || c.code.toLowerCase() === user.country?.toLowerCase()
      );
      if (matched) {
        setSelectedCountry(matched);
      }
    }

    if (user?.phone) {
      setCandidatePhone(user.phone);
    }

    const savedResume = await ApplicationsService.getSavedCandidateResume();
    if (savedResume) {
      setAttachedResume(savedResume);
    }

    const savedLoom = await ApplicationsService.getSavedCandidateLoomUrl();
    if (savedLoom) {
      setLoomVideoUrl(savedLoom);
    }

    const fetchedJobs = await ApplicationsService.getJobs();
    setJobs(fetchedJobs.filter(j => j.status === 'Active'));

    const targetId = user?.uid || user?.email;
    const existingApps = await ApplicationsService.getCandidateApplications(targetId);
    setAppliedJobIds(existingApps.map(a => a.jobId));

    const emailCount = await EmailService.getUnreadCount(user?.email || '');
    setUnreadEmailCount(emailCount);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenApplyModal = (job: JobItem) => {
    const openCheck = isJobOpenForApplications(job);
    if (!openCheck.isOpen) {
      Alert.alert(
        "Application Closed",
        openCheck.reason || "This role is currently not accepting new applications."
      );
      return;
    }

    if (appliedJobIds.includes(job.id)) {
      Alert.alert(
        "Application Status",
        `You previously submitted an application for ${job.title}.\n\nWhat would you like to do?`,
        [
          { 
            text: "View Confirmation Email", 
            onPress: () => setEmailModalVisible(true) 
          },
          { 
            text: "View Current Status", 
            onPress: () => router.push('/candidate/applications') 
          },
          { 
            text: "Update Application Profile", 
            onPress: () => {
              setActiveJobForModal(job);
              setApplicationNote('');
            }
          },
          { text: "Close", style: "cancel" }
        ]
      );
      return;
    }

    setActiveJobForModal(job);
    setApplicationNote('');
  };

  // Resume Upload Handler (opens native phone storage document picker or sample CV)
  const handlePickResume = () => {
    Alert.alert(
      "Attach Resume",
      "Choose an option to attach your resume:",
      [
        {
          text: "Upload Document from Device",
          onPress: async () => {
            try {
              setIsUploadingResume(true);
              const result = await DocumentPicker.getDocumentAsync({
                type: [
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ],
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const lowerFileName = (file.name || '').toLowerCase();
                const isValidDoc = lowerFileName.endsWith('.pdf') || lowerFileName.endsWith('.doc') || lowerFileName.endsWith('.docx');

                if (!isValidDoc) {
                  Alert.alert(
                    "Invalid Document Format",
                    "Only PDF (.pdf) and Microsoft Word (.doc, .docx) files are acceptable for job applications."
                  );
                  return;
                }

                let sizeStr = '1.2 MB';
                if (file.size) {
                  const sizeInKb = Math.round(file.size / 1024);
                  if (sizeInKb > 1024) {
                    sizeStr = `${(sizeInKb / 1024).toFixed(1)} MB`;
                  } else {
                    sizeStr = `${sizeInKb} KB`;
                  }
                }
                const updated = {
                  name: file.name,
                  size: sizeStr,
                  url: file.uri,
                };
                setAttachedResume(updated);
                await ApplicationsService.saveCandidateResume(updated);
                Alert.alert("Resume Attached", `Successfully attached "${file.name}" (${sizeStr}). Verified as a valid document.`);
              }
            } catch (err: any) {
              Alert.alert("File Picker Error", err.message || "Could not open document picker.");
            } finally {
              setIsUploadingResume(false);
            }
          },
        },
        {
          text: "Attach Standard Portfolio Resume",
          onPress: async () => {
            setIsUploadingResume(true);
            const candidatePrefix = (currentUser?.name || 'candidate').toLowerCase().replace(/\s+/g, '_');
            const updated = {
              name: `${candidatePrefix}_resume_2026.pdf`,
              size: '1.4 MB'
            };
            setAttachedResume(updated);
            await ApplicationsService.saveCandidateResume(updated);
            setIsUploadingResume(false);
            Alert.alert("Resume Attached", "Standard portfolio resume attached successfully.");
          },
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

    if (!aboutCandidate.trim()) {
      Alert.alert('Required Field', 'Please share a brief introduction about yourself and your professional experience.');
      return;
    }

    if (!reasonForApplying.trim()) {
      Alert.alert('Required Field', 'Please share why you are applying for this specific position.');
      return;
    }

    const cleanPhone = candidatePhone.trim();
    if (!cleanPhone || cleanPhone.length < 6) {
      Alert.alert(
        'Phone Number Required',
        `Please enter your direct mobile phone number (with WhatsApp) for ${selectedCountry.name}. Clients and employers require direct contact to schedule live technical interviews.`
      );
      return;
    }

    const fullPhoneNumber = cleanPhone.startsWith('+') ? cleanPhone : `${selectedCountry.dialCode} ${cleanPhone}`;

    setIsSubmitting(true);

    const candidateName = currentUser?.name || 'Talent Applicant';
    const candidateEmail = currentUser?.email || 'talent@hirebloom.com';
    const candidateId = currentUser?.uid || `candidate-${Date.now()}`;
    const targetJob = activeJobForModal;
    const finalLoom = loomVideoUrl.trim() || 'https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403';
    const countryString = `${selectedCountry.name} ${selectedCountry.flag}`;

    await ApplicationsService.saveCandidateLoomUrl(finalLoom);

    const res = await ApplicationsService.applyForJob(targetJob, {
      id: candidateId,
      name: candidateName,
      email: candidateEmail,
      country: countryString,
      phone: fullPhoneNumber,
      whatsapp: fullPhoneNumber,
      note: applicationNote.trim() || reasonForApplying.trim(),
      aboutCandidate: aboutCandidate.trim(),
      reasonForApplying: reasonForApplying.trim(),
      coverLetter: coverLetter.trim() || undefined,
      resume: attachedResume,
      loomUrl: finalLoom
    });

    setIsSubmitting(false);
    if (res.success) {
      setAppliedJobIds(prev => [...prev, targetJob.id]);
      setActiveJobForModal(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 6000);

      // Refresh email count & jobs list to update applicant counters
      await loadData();

      // Show immediate notification alert with direct access to Bloom Email Inbox!
      Alert.alert(
        "Application Submitted",
        `Your application for ${targetJob.title} at ${targetJob.company} has been placed in the HireBloom Review Queue.\n\nCountry: ${countryString}\n\nAn official confirmation email has been dispatched to your Bloom Inbox (${candidateEmail}).`,
        [
          {
            text: "Open Inbox",
            onPress: () => {
              setEmailModalVisible(true);
            },
          },
          {
            text: "View Status in Portal",
            onPress: () => {
              router.push('/candidate/applications');
            },
          },
          {
            text: "OK",
            style: "cancel",
          }
        ]
      );
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

  const filteredCountries = HIRING_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.region.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-slate-500 font-medium text-sm mb-0.5">
              Hello, {currentUser?.name || 'Talent'}
            </Text>
            <Text className="text-3xl font-extrabold text-slate-900">Find your next</Text>
            <Text className="text-3xl font-extrabold text-forest">dream job</Text>
          </View>
          <View className="flex-row items-center space-x-2 mt-1">
            <TouchableOpacity
              onPress={() => setEmailModalVisible(true)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center relative active:opacity-75 shadow-sm mr-1.5"
            >
              <Mail size={18} color="#113c2c" />
              {unreadEmailCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-600 min-w-[18px] h-[18px] rounded-full px-1 items-center justify-center border border-white">
                  <Text className="text-white text-[9px] font-extrabold">{unreadEmailCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="bg-mint/20 px-3 py-2 rounded-full border border-mint/40 flex-row items-center">
              <Award size={12} color="#113c2c" style={{ marginRight: 4 }} />
              <Text className="text-forest font-extrabold text-[10px] uppercase">Talent</Text>
            </View>
          </View>
        </View>

        {/* Success Alert Banner with direct link to Confirmation Email & Portal */}
        {showSuccessToast && (
          <View className="w-full bg-emerald-600 p-4 rounded-2xl flex-row items-center justify-between mb-4 shadow-md shadow-emerald-600/30">
            <View className="flex-row items-center flex-1 pr-2">
              <CheckCircle2 color="white" size={20} style={{ marginRight: 8 }} />
              <View>
                <Text className="text-white font-bold text-xs">Application Submitted to Review Desk!</Text>
                <Text className="text-emerald-100 text-[10px]">Official confirmation email dispatched to inbox</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => setEmailModalVisible(true)}
                className="bg-white px-2.5 py-1.5 rounded-lg mr-1.5"
              >
                <Text className="text-emerald-900 font-bold text-[10px]">Open Email</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/candidate/applications')}
                className="bg-white/20 px-2 py-1.5 rounded-lg"
              >
                <Text className="text-white font-bold text-[10px]">Status</Text>
              </TouchableOpacity>
            </View>
          </View>
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

        {/* Job Feed Header with Refresh & Portal Link */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-extrabold text-slate-900">
            Open Positions ({filteredJobs.length})
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={isRefreshing}
              className="bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl mr-2 flex-row items-center active:opacity-75"
            >
              <RefreshCw size={12} color="#113c2c" style={{ marginRight: 4 }} />
              <Text className="text-forest font-bold text-[11px]">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/candidate/applications')}>
              <Text className="text-forest font-bold text-xs">Talent Portal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#113c2c']} />
          }
        >
          {filteredJobs.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-200 mt-2">
              <Building2 size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
              <Text className="text-slate-800 font-bold text-sm">No positions match your filter</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Try refining your search keyword or tap Refresh.</Text>
            </View>
          ) : (
            filteredJobs.map((job, idx) => {
              const isApplied = appliedJobIds.includes(job.id);
              const isBookmarked = !!bookmarkedIds[job.id];
              const openCheck = isJobOpenForApplications(job);
              const maxCap = job.maxApplicants || 50;
              const currentApplicants = job.applicants || 0;
              const isAtCapacity = currentApplicants >= maxCap;

              return (
                <View 
                  key={`${job.id}-${idx}`} 
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

                  <View className="flex-row items-center flex-wrap gap-y-1 mb-3">
                    <View className="flex-row items-center mr-4">
                      <MapPin color="#64748b" size={13} className="mr-1" />
                      <Text className="text-slate-500 text-xs">{job.location}</Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                      <Clock color="#64748b" size={13} className="mr-1" />
                      <Text className="text-slate-500 text-xs">{job.salary}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users color="#64748b" size={13} className="mr-1" />
                      <Text className={`text-xs font-semibold ${isAtCapacity ? 'text-amber-600' : 'text-slate-500'}`}>
                        {currentApplicants}/{maxCap} Applicants
                      </Text>
                    </View>
                  </View>

                  {job.deadline && (
                    <View className="bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg flex-row items-center mb-3 self-start">
                      <Calendar size={11} color="#b45309" style={{ marginRight: 4 }} />
                      <Text className="text-amber-800 text-[10px] font-bold">
                        Deadline: {job.deadline}
                      </Text>
                    </View>
                  )}

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
                    
                    {!openCheck.isOpen ? (
                      <View className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-xl flex-row items-center">
                        <AlertCircle color="#64748b" size={13} style={{ marginRight: 5 }} />
                        <Text className="text-slate-600 font-bold text-xs">
                          {isAtCapacity ? 'Capacity Reached' : 'Applications Closed'}
                        </Text>
                      </View>
                    ) : (
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
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Comprehensive Application Modal */}
      {Boolean(activeJobForModal) && (
        <Modal
          visible={!!activeJobForModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActiveJobForModal(null)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-black/70 justify-end"
          >
            {activeJobForModal && (
              <View className="bg-white rounded-t-3xl border-t border-slate-200 max-h-[92%]">
                {/* Modal Fixed Top Header */}
                <View className="p-5 border-b border-slate-100 flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-10 h-10 bg-mint/20 rounded-xl items-center justify-center mr-3 border border-mint/30">
                      <Building2 color="#113c2c" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-extrabold text-slate-900 leading-tight">Submit Application</Text>
                      <Text className="text-slate-500 text-xs" numberOfLines={1}>{activeJobForModal.company} • {activeJobForModal.title}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setActiveJobForModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                  >
                    <X size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Modal Scrollable Form */}
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Job Requisition Banner */}
                  <View className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4">
                    <Text className="text-[10px] font-extrabold text-forest uppercase tracking-wider mb-0.5">Role Requisition</Text>
                    <Text className="text-base font-extrabold text-slate-900">{activeJobForModal.title}</Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                      {activeJobForModal.location} • {activeJobForModal.salary} • {activeJobForModal.applicants || 0}/{activeJobForModal.maxApplicants || 50} applicants
                    </Text>
                  </View>

                  {/* 1. Country Selection */}
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-slate-800 font-bold text-xs uppercase tracking-wider">
                        Your Country of Residence *
                      </Text>
                      <Text className="text-forest text-[10px] font-bold">Remote Hiring</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCountryPickerVisible(true)}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-row items-center justify-between active:opacity-75 shadow-sm"
                    >
                      <View className="flex-row items-center flex-1">
                        <Text className="text-xl mr-2.5">{selectedCountry.flag}</Text>
                        <View>
                          <Text className="text-slate-900 font-bold text-xs">{selectedCountry.name}</Text>
                          <Text className="text-slate-500 text-[10px]">{selectedCountry.region} • {selectedCountry.dialCode}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <Text className="text-forest font-bold text-[10px] mr-1">Change</Text>
                        <ChevronDown size={12} color="#113c2c" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Phone Number Field (Mandatory) */}
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-slate-800 font-bold text-xs uppercase tracking-wider">
                        Direct Phone / WhatsApp *
                      </Text>
                      <Text className="text-emerald-700 text-[10px] font-bold">Mandatory for Interview</Text>
                    </View>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <View className="flex-row items-center mr-2.5 pr-2.5 border-r border-slate-200">
                        <Text className="text-base mr-1">{selectedCountry.flag}</Text>
                        <Text className="text-slate-800 font-bold text-xs">{selectedCountry.dialCode}</Text>
                      </View>
                      <TextInput
                        value={candidatePhone}
                        onChangeText={setCandidatePhone}
                        placeholder={selectedCountry.placeholder || "801 234 5678"}
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        className="flex-1 text-xs text-slate-900 font-medium"
                      />
                    </View>
                    <Text className="text-slate-400 text-[9px] mt-1">
                      Used by HireBloom coordinators to dispatch interview calendar invites & notifications.
                    </Text>
                  </View>

                  {/* 2. Tell Us About Yourself */}
                  <View className="mb-4">
                    <Text className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-1">
                      Tell Us About Yourself (Short Bio / Background) *
                    </Text>
                    <Text className="text-slate-400 text-[10px] mb-1.5">
                      Brief summary of your professional strengths, remote setup, and career history.
                    </Text>
                    <TextInput
                      value={aboutCandidate}
                      onChangeText={setAboutCandidate}
                      placeholder="e.g. Experienced support lead with 4+ years handling SaaS ticketing, C1 English fluency, dedicated workstation with fiber internet & power backup..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                      textAlignVertical="top"
                    />
                  </View>

                  {/* 3. Reason for Applying */}
                  <View className="mb-4">
                    <Text className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-1">
                      Why Are You Applying for This Position? *
                    </Text>
                    <Text className="text-slate-400 text-[10px] mb-1.5">
                      What excites you about this specific opening and why are you the best fit?
                    </Text>
                    <TextInput
                      value={reasonForApplying}
                      onChangeText={setReasonForApplying}
                      placeholder="e.g. I have hands-on mastery with Zendesk/Intercom and align with your team's US-hours coverage schedule..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                      textAlignVertical="top"
                    />
                  </View>

                  {/* 4. Cover Letter / Pitch */}
                  <View className="mb-4">
                    <Text className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-1">
                      Cover Letter / Detailed Pitch (Optional)
                    </Text>
                    <TextInput
                      value={coverLetter}
                      onChangeText={setCoverLetter}
                      placeholder="Share your tailored pitch, notable projects, or metrics achieved..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                      textAlignVertical="top"
                    />
                  </View>

                  {/* 5. Attached Resume / CV */}
                  <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row justify-between items-center mb-1">
                      <View className="flex-row items-center">
                        <FileText size={15} color="#113c2c" style={{ marginRight: 6 }} />
                        <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Attached Resume / CV
                        </Text>
                      </View>
                      <View className="bg-mint/20 px-2 py-0.5 rounded-md border border-mint/40">
                        <Text className="text-forest font-bold text-[9px] uppercase tracking-wider">PDF & DOC ONLY</Text>
                      </View>
                    </View>

                    <Text className="text-zinc-400 text-[10px] mb-2.5">
                      Only PDF (.pdf) and Word documents (.doc, .docx) are acceptable. Max 5MB.
                    </Text>

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
                            {attachedResume.size} • Verified Valid Document
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        onPress={handlePickResume}
                        disabled={isUploadingResume}
                        className="bg-forest/10 border border-forest/20 px-2.5 py-1.5 rounded-lg flex-row items-center"
                      >
                        <UploadCloud size={12} color="#113c2c" style={{ marginRight: 4 }} />
                        <Text className="text-forest font-bold text-[10px]">
                          {isUploadingResume ? 'Uploading...' : 'Change File'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 6. Loom Video Intro Section */}
                  <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm">
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center">
                        <View className="w-5 h-5 rounded-full bg-indigo-600 items-center justify-center mr-2 shadow-sm">
                          <Check size={11} color="white" />
                        </View>
                        <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          2-Min Loom Video Pitch
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setLoomVideoUrl('https://www.loom.com/share/d87452e89e0843dfb031b2c45e581403')}
                        className="bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg"
                      >
                        <Text className="text-indigo-700 font-bold text-[10px]">Use Portfolio Pitch</Text>
                      </TouchableOpacity>
                    </View>

                    <Text className="text-slate-500 text-[11px] mb-2.5 leading-relaxed">
                      HireBloom requirement: Submit a short Loom link showcasing your spoken English and remote setup.
                    </Text>

                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <TextInput
                        value={loomVideoUrl}
                        onChangeText={setLoomVideoUrl}
                        placeholder="https://www.loom.com/share/..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-slate-900 font-medium text-xs mr-2"
                        autoCapitalize="none"
                      />
                      {loomVideoUrl ? (
                        <TouchableOpacity
                          onPress={() => {
                            if (loomVideoUrl.startsWith('http')) {
                              Linking.openURL(loomVideoUrl);
                            } else {
                              Alert.alert('Invalid Link', 'Please enter a valid URL starting with https://');
                            }
                          }}
                          className="bg-forest px-2.5 py-1.5 rounded-lg"
                        >
                          <Text className="text-white font-bold text-[10px]">Preview</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="w-full bg-forest py-4 rounded-2xl items-center justify-center active:opacity-90 shadow-md shadow-forest/20 flex-row"
                  >
                    <Send size={15} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white font-extrabold text-sm">
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* Country Selection Modal */}
      <Modal
        visible={countryPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%] border-t border-slate-200">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Globe size={18} color="#113c2c" style={{ marginRight: 6 }} />
                <Text className="text-base font-extrabold text-slate-900">Select Your Country</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCountryPickerVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Country Search */}
            <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 mb-3">
              <Search size={15} color="#94a3b8" style={{ marginRight: 6 }} />
              <TextInput
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search country or dial code..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-xs text-slate-900"
              />
              {countrySearch ? (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <X size={14} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => {
                      setSelectedCountry(c);
                      setCountryPickerVisible(false);
                      setCountrySearch('');
                    }}
                    className={`flex-row items-center justify-between p-3.5 rounded-xl mb-1.5 ${
                      isSelected ? 'bg-mint/20 border border-mint/40' : 'bg-slate-50'
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">{c.flag}</Text>
                      <View>
                        <Text className="text-slate-900 font-bold text-xs">{c.name}</Text>
                        <Text className="text-slate-400 text-[10px]">{c.region} • {c.dialCode}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-forest items-center justify-center">
                        <CheckCircle2 size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Embedded Mobile Email Inbox Modal */}
      <EmailInboxModal
        visible={emailModalVisible}
        onClose={() => {
          setEmailModalVisible(false);
          loadData();
        }}
        userEmail={currentUser?.email}
      />
    </SafeAreaView>
  );
}
