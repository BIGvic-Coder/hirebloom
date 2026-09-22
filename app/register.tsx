import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  ChevronLeft,
  ShieldCheck,
  Crown,
  Globe,
  ChevronDown,
  Search,
  Check,
  X,
  Phone,
  MessageSquare
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { auth, db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ApplicationsService } from '@/services/applicationsService';
import { GoogleSignin, statusCodes, isGoogleSigninAvailable } from '@/services/googleAuth';

export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  region: string;
  placeholder: string;
}

export const HIRING_COUNTRIES: CountryItem[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', region: 'Africa', placeholder: '801 234 5678' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', region: 'Americas', placeholder: '(555) 123-4567' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', region: 'Europe', placeholder: '7911 123456' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', region: 'Americas', placeholder: '(555) 123-4567' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', region: 'Asia-Pacific', placeholder: '917 123 4567' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233', region: 'Africa', placeholder: '24 123 4567' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', region: 'Africa', placeholder: '712 345678' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', region: 'Africa', placeholder: '82 123 4567' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', region: 'Asia-Pacific', placeholder: '98765 43210' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', region: 'Europe', placeholder: '151 12345678' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', region: 'Latin America', placeholder: '11 91234-5678' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', region: 'Asia-Pacific', placeholder: '412 345 678' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', region: 'Middle East', placeholder: '10 1234 5678' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92', region: 'Asia-Pacific', placeholder: '300 1234567' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', region: 'Latin America', placeholder: '55 1234 5678' },
  { code: 'GLOBAL', name: 'Other / Worldwide Remote', flag: '🌍', dialCode: '+1', region: 'Global', placeholder: 'Phone number' },
];

// Official Google Multi-Colored Vector Logo
const GoogleLogo = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-5.29-4.53z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export default function Register() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ role?: string; email?: string }>();

  const [role, setRole] = useState<'candidate' | 'employer' | 'ceo'>(
    params.role === 'ceo' ? 'ceo' : params.role === 'employer' ? 'employer' : 'candidate'
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(HIRING_COUNTRIES[0]); // Default Nigeria
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Sync email param if passed from Login redirect
  useEffect(() => {
    if (params.email && !email) {
      setEmail(params.email);
    }
  }, [params.email]);

  // Initialize Google Sign-in on mount
  useEffect(() => {
    if (Platform.OS !== 'web' && GoogleSignin?.configure) {
      try {
        GoogleSignin.configure({
          webClientId:
            process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
            '32893466508-gdfbel1mf5gc2vlgtqpp6e9s3jpr97j4.apps.googleusercontent.com',
          offlineAccess: false,
        });
      } catch (err) {
        console.warn('GoogleSignin configure error:', err);
      }
    }
  }, []);

  // Update role if params change
  useEffect(() => {
    if (params.role === 'ceo') {
      setRole('ceo');
    } else if (params.role === 'employer') {
      setRole('employer');
    } else if (params.role === 'candidate') {
      setRole('candidate');
    }
  }, [params.role]);

  // Helper to persist user profile & session
  const saveUserProfileAndRoute = async (user: any, nameToUse: string, userRole: 'candidate' | 'employer' | 'ceo') => {
    const cleanEmail = (user.email || email).trim().toLowerCase();
    const fullPhone = phoneNumber.trim() ? `${selectedCountry.dialCode} ${phoneNumber.trim()}` : undefined;
    const fullWhatsApp = sameAsPhone
      ? fullPhone
      : whatsAppNumber.trim()
      ? `${selectedCountry.dialCode} ${whatsAppNumber.trim()}`
      : fullPhone;

    // 1. Clear any prior cached session first so there is zero bleed-over
    try {
      await ApplicationsService.clearCurrentUser();
    } catch {}

    // 2. Set active user session
    try {
      await ApplicationsService.setCurrentUser({
        uid: user.uid,
        name: nameToUse,
        email: cleanEmail,
        role: userRole,
        initials: ApplicationsService.getInitials(nameToUse, cleanEmail),
        country: selectedCountry.name,
        phone: fullPhone,
        whatsapp: fullWhatsApp,
      });

      // 3. Register into persistent user database
      await ApplicationsService.registerNewUser({
        uid: user.uid,
        name: nameToUse,
        email: cleanEmail,
        role: userRole,
        company: userRole === 'employer' ? companyName.trim() : userRole === 'ceo' ? (companyName.trim() || 'HireBloom HQ') : undefined,
        password: password.trim(),
        country: selectedCountry.name,
        phone: fullPhone,
        whatsapp: fullWhatsApp,
      });
    } catch (e) {
      console.warn('Local session/registration storage error:', e);
    }

    // 4. Also sync to Firestore 'users' collection
    try {
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            uid: user.uid,
            name: nameToUse,
            email: cleanEmail,
            role: userRole,
            company: userRole === 'employer' ? companyName.trim() : userRole === 'ceo' ? (companyName.trim() || 'HireBloom HQ') : null,
            country: selectedCountry.name,
            phone: fullPhone || null,
            whatsapp: fullWhatsApp || null,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Firestore setDoc user warning:', e);
    }

    router.replace(userRole === 'employer' || userRole === 'ceo' ? '/employer' : '/candidate');
  };

  // 1. Register with Names, Email & Password
  const handleEmailRegister = async () => {
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanCompany = companyName.trim();

    if (!cleanFirst || !cleanLast) {
      Alert.alert('Missing Name', 'Please enter both your first name and last name.');
      return;
    }

    if (role === 'employer' && !cleanCompany) {
      Alert.alert('Missing Company', 'Please enter your company or organization name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);
    const fullName = `${cleanFirst} ${cleanLast}`;

    try {
      // Check if user is already an existing user
      const existingCheck = await ApplicationsService.checkUserExists(cleanEmail);
      if (existingCheck.exists) {
        setAuthLoading(false);
        Alert.alert(
          'Account Already Exists',
          `An account with "${cleanEmail}" already exists.\n\nSign in with your email verification code!`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In with OTP',
              onPress: () => {
                router.push({
                  pathname: '/login',
                  params: { email: cleanEmail }
                });
              }
            }
          ]
        );
        return;
      }

      let createdUser: any = null;
      // Try Firebase Auth if available
      if (!IS_MOCK_FIREBASE && auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          createdUser = userCredential.user;
          try {
            await updateProfile(userCredential.user, { displayName: fullName });
          } catch {}
        } catch (firebaseAuthErr: any) {
          console.warn('Firebase createUserWithEmailAndPassword warning:', firebaseAuthErr);
          const errCode = firebaseAuthErr?.code || '';
          if (errCode === 'auth/email-already-in-use') {
            setAuthLoading(false);
            Alert.alert(
              'Account Exists',
              'An account with this email already exists.\n\nPlease go to the Sign In page to log in.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => router.push('/login') }
              ]
            );
            return;
          }
          // If offline or permission issue, fallback gracefully to locally persisted account
          createdUser = {
            uid: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            email: cleanEmail,
            displayName: fullName,
          };
        }
      } else {
        createdUser = {
          uid: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          email: cleanEmail,
          displayName: fullName,
        };
      }

      await saveUserProfileAndRoute(createdUser, fullName, role);
    } catch (error: any) {
      console.log('Registration Error:', error);
      Alert.alert('Registration Failed', error?.message || error.toString());
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Register with Google (Native Android Account Picker)
  const handleGoogleRegister = async () => {
    if (Platform.OS === 'web' || !isGoogleSigninAvailable) {
      Alert.alert(
        'Google Registration',
        'Native Google Registration runs in the Android APK. In Expo Go or Web, please enter your details to create an account.'
      );
      return;
    }

    setAuthLoading(true);
    try {
      // 1. Verify Google Play Services is available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 2. Sign out any existing session first to ensure the native Android Account Chooser dialog pops up every single time
      try {
        await GoogleSignin.signOut();
      } catch {
        // Safe to ignore if not signed in
      }

      // 3. Prompt user with native Google Account Chooser bottom sheet
      const response = await GoogleSignin.signIn();

      if (response && (response as any).type === 'cancelled') {
        setAuthLoading(false);
        return;
      }

      const resData: any = (response as any)?.data || response;
      const idToken = resData?.idToken;
      const googleUser = resData?.user || {};

      const userEmail = googleUser?.email || '';
      const fallbackName = (firstName ? `${firstName} ${lastName}`.trim() : '') || userEmail.split('@')[0] || 'HireBloom Member';
      const userName = googleUser?.name || fallbackName;
      const userUid = googleUser?.id || `google-${Date.now()}`;

      if (!userEmail && !idToken) {
        throw new Error('No Google account selected.');
      }

      let firebaseUser: any = null;
      if (!IS_MOCK_FIREBASE && auth && idToken) {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          firebaseUser = userCredential.user;
        } catch (fbErr: any) {
          console.warn('Firebase credential register warning:', fbErr);
        }
      }

      const registeredUser = {
        uid: firebaseUser?.uid || userUid,
        email: firebaseUser?.email || userEmail,
        displayName: firebaseUser?.displayName || userName,
      };

      await saveUserProfileAndRoute(registeredUser, registeredUser.displayName, role);
    } catch (error: any) {
      const errStr = String(error?.message || error || '');
      const errCode = String(error?.code || '');

      if (
        errCode === '12501' ||
        errCode === statusCodes?.SIGN_IN_CANCELLED ||
        errStr.includes('SIGN_IN_CANCELLED') ||
        errStr.includes('cancelled') ||
        errStr.includes('12501')
      ) {
        console.log('User dismissed Google registration picker');
      } else if (errCode === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services is not available or outdated on this device.');
      } else {
        Alert.alert('Google Registration Error', error?.message || error.toString());
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f2eb" />

      {/* Top Header */}
      <View className="px-6 pt-3 pb-2 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 items-center justify-center shadow-sm active:opacity-70"
        >
          <ChevronLeft size={20} color="#113c2c" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <View className="w-7 h-7 justify-center items-center mr-1.5">
            <Svg width="22" height="22" viewBox="0 0 50 50">
              <Path
                d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
                fill="none"
                stroke="#059669"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path d="M 12 40 L 4 46" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" />
              <Path d="M 16 34 L 16 26" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="16" cy="20" r="3.5" fill="#059669" />
              <Path d="M 25 34 L 25 20" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="25" cy="14" r="3.5" fill="#059669" />
              <Path d="M 34 34 L 34 24" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="34" cy="18" r="3.5" fill="#059669" />
            </Svg>
          </View>
          <Text className="text-xl font-bold text-forest tracking-tight">bloom</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="px-3 py-1.5 rounded-full bg-white border border-zinc-200/80"
        >
          <Text className="text-xs font-bold text-forest">Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 22,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Card Container */}
        <View className="bg-white p-6 rounded-3xl border border-zinc-200/70 shadow-lg">
          {/* Header Texts */}
          <Text className="text-2xl font-extrabold text-slate-900 mb-1">
            Create your account
          </Text>
          <Text className="text-zinc-500 text-xs mb-5">
            Join thousands of vetted remote professionals and leading companies.
          </Text>

          {/* Role Switcher (Candidate vs Employer) */}
          <View className="flex-row gap-3 mb-5">
            <TouchableOpacity
              onPress={() => setRole('candidate')}
              className={`flex-1 p-3.5 rounded-2xl border items-center justify-center ${
                role === 'candidate'
                  ? 'bg-mint/15 border-forest shadow-sm'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <Briefcase
                color={role === 'candidate' ? '#113c2c' : '#94a3b8'}
                size={18}
                style={{ marginBottom: 4 }}
              />
              <Text
                className={`font-bold text-xs ${
                  role === 'candidate' ? 'text-forest' : 'text-zinc-500'
                }`}
              >
                Candidate
              </Text>
              <Text className="text-[10px] text-zinc-400">Apply to roles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('employer')}
              className={`flex-1 p-3.5 rounded-2xl border items-center justify-center ${
                role === 'employer'
                  ? 'bg-mint/15 border-forest shadow-sm'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <Building2
                color={role === 'employer' ? '#113c2c' : '#94a3b8'}
                size={18}
                style={{ marginBottom: 4 }}
              />
              <Text
                className={`font-bold text-xs ${
                  role === 'employer' ? 'text-forest' : 'text-zinc-500'
                }`}
              >
                Employer
              </Text>
              <Text className="text-[10px] text-zinc-400">Hire verified talent</Text>
            </TouchableOpacity>
          </View>

          {/* ================= OPTION A: 1-TAP GOOGLE REGISTRATION ================= */}
          <TouchableOpacity
            onPress={handleGoogleRegister}
            disabled={authLoading}
            className="w-full bg-white border border-slate-900 py-3.5 rounded-2xl flex-row items-center justify-center active:opacity-85 shadow-sm mb-4"
          >
            <GoogleLogo />
            <Text className="text-slate-900 font-bold text-sm">
              Sign up with Google
            </Text>
          </TouchableOpacity>

          {/* Separator Divider */}
          <View className="flex-row items-center my-3">
            <View className="flex-1 h-[1px] bg-zinc-200" />
            <Text className="text-zinc-400 text-xs font-medium mx-3">
              or register with names & email
            </Text>
            <View className="flex-1 h-[1px] bg-zinc-200" />
          </View>

          {/* ================= OPTION B: NAMES + EMAIL + PASSWORD ================= */}
          <View className="space-y-3 mb-5">
            {/* First Name & Last Name in Row */}
            <View className="flex-row space-x-2.5 mb-2.5">
              <View className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3.5 py-3 flex-row items-center mr-2">
                <User color="#113c2c" size={16} style={{ marginRight: 6 }} />
                <TextInput
                  placeholder="First name"
                  className="flex-1 text-slate-900 font-medium text-xs"
                  placeholderTextColor="#94a3b8"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3.5 py-3 flex-row items-center">
                <TextInput
                  placeholder="Last name"
                  className="flex-1 text-slate-900 font-medium text-xs"
                  placeholderTextColor="#94a3b8"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* If Employer: Company Name */}
            {role === 'employer' && (
              <View className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 flex-row items-center mb-2.5">
                <Building2 color="#113c2c" size={18} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Company / Organization Name"
                  className="flex-1 text-slate-900 font-medium text-xs"
                  placeholderTextColor="#94a3b8"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>
            )}

            {/* Country / Hiring Region Selector */}
            <TouchableOpacity
              onPress={() => setIsCountryModalVisible(true)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 flex-row items-center justify-between mb-2.5 active:opacity-85"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <Globe color="#113c2c" size={18} style={{ marginRight: 10 }} />
                <View className="flex-1">
                  <Text className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Country / Hiring Region
                  </Text>
                  <Text className="text-slate-900 font-bold text-xs mt-0.5" numberOfLines={1}>
                    {selectedCountry.flag}  {selectedCountry.name} ({selectedCountry.region})
                  </Text>
                </View>
              </View>
              <ChevronDown size={16} color="#64748b" />
            </TouchableOpacity>

            {/* Phone Number with Country Code */}
            <View className="w-full mb-2">
              <View className="flex-row items-center gap-2">
                {/* Dial Code Button (Tapping opens Country Picker) */}
                <TouchableOpacity
                  onPress={() => setIsCountryModalVisible(true)}
                  className="bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3.5 py-3 flex-row items-center active:opacity-75"
                >
                  <Text className="text-base mr-1.5">{selectedCountry.flag}</Text>
                  <Text className="text-slate-900 font-extrabold text-xs">{selectedCountry.dialCode}</Text>
                  <ChevronDown size={12} color="#64748b" style={{ marginLeft: 3 }} />
                </TouchableOpacity>

                {/* Phone Input */}
                <View className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3.5 py-3 flex-row items-center">
                  <Phone color="#113c2c" size={16} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder={selectedCountry.placeholder || "Phone number"}
                    className="flex-1 text-slate-900 font-medium text-xs"
                    placeholderTextColor="#94a3b8"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* WhatsApp Same As Phone Toggle */}
            <TouchableOpacity
              onPress={() => setSameAsPhone(!sameAsPhone)}
              className="flex-row items-center mb-2 px-1 active:opacity-75"
            >
              <View className={`w-4 h-4 rounded border mr-2 items-center justify-center ${sameAsPhone ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-300 bg-white'}`}>
                {sameAsPhone && <Check size={11} color="white" strokeWidth={3} />}
              </View>
              <MessageSquare size={13} color="#059669" style={{ marginRight: 5 }} />
              <Text className="text-zinc-600 font-medium text-[11px]">
                WhatsApp number is same as phone
              </Text>
            </TouchableOpacity>

            {/* Separate WhatsApp Input (if not same) */}
            {!sameAsPhone && (
              <View className="w-full mb-2.5">
                <View className="flex-row items-center gap-2">
                  <View className="bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-3 flex-row items-center">
                    <Text className="text-base mr-1.5">{selectedCountry.flag}</Text>
                    <Text className="text-emerald-900 font-extrabold text-xs">{selectedCountry.dialCode}</Text>
                  </View>
                  <View className="flex-1 bg-emerald-50/40 border border-emerald-200 rounded-2xl px-3.5 py-3 flex-row items-center">
                    <MessageSquare color="#059669" size={16} style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="WhatsApp number"
                      className="flex-1 text-slate-900 font-medium text-xs"
                      placeholderTextColor="#94a3b8"
                      value={whatsAppNumber}
                      onChangeText={setWhatsAppNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Email Address */}
            <View className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 flex-row items-center mb-2.5">
              <Mail color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput
                placeholder={role === 'employer' ? 'Work email address' : 'Email address'}
                className="flex-1 text-slate-900 font-medium text-xs"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password with Show/Hide Toggle */}
            <View className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 flex-row items-center mb-1">
              <Lock color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Create password (6+ characters)"
                className="flex-1 text-slate-900 font-medium text-xs"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                {showPassword ? (
                  <EyeOff size={16} color="#64748b" />
                ) : (
                  <Eye size={16} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="w-full bg-forest py-4 rounded-2xl flex-row items-center justify-center shadow active:opacity-90 mb-4"
            onPress={handleEmailRegister}
            disabled={authLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm mr-2">
              {authLoading ? 'Creating Account...' : `Register as ${role === 'employer' ? 'Employer' : 'Candidate'}`}
            </Text>
            <ArrowRight color="white" size={16} />
          </TouchableOpacity>

          {/* Privacy Note */}
          <Text className="text-zinc-400 text-[10px] text-center leading-tight mb-4">
            By registering, you agree to Hire Bloom&apos;s Terms of Service, pre-screening rubric, and Privacy Policy.
          </Text>

          {/* Bottom Redirect to Sign In */}
          <View className="flex-row items-center justify-center pt-2 border-t border-zinc-100">
            <Text className="text-zinc-500 font-medium text-xs">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-forest font-extrabold text-xs">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Country Selection Modal */}
      <Modal
        visible={isCountryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[82%] border-t border-zinc-200">
            {/* Header */}
            <View className="flex-row justify-between items-center pb-3 border-b border-zinc-100 mb-4">
              <View className="flex-row items-center">
                <Globe size={18} color="#113c2c" style={{ marginRight: 8 }} />
                <View>
                  <Text className="text-slate-900 font-extrabold text-base">Select Your Country</Text>
                  <Text className="text-zinc-400 text-[10px]">Required for employer regional matching</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsCountryModalVisible(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center active:opacity-75"
              >
                <X size={16} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="bg-zinc-50 border border-zinc-200 rounded-2xl px-3.5 py-2.5 flex-row items-center mb-4">
              <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search country or region (e.g. Nigeria, US, UK)..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-900 text-xs font-medium"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCorrect={false}
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <X size={14} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Country List */}
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {HIRING_COUNTRIES.filter(
                (c) =>
                  c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                  c.region.toLowerCase().includes(countrySearch.toLowerCase())
              ).map((country) => {
                const isSelected = selectedCountry.code === country.code;
                return (
                  <TouchableOpacity
                    key={country.code}
                    onPress={() => {
                      setSelectedCountry(country);
                      setIsCountryModalVisible(false);
                      setCountrySearch('');
                    }}
                    className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                      isSelected
                        ? 'bg-mint/15 border-forest shadow-sm'
                        : 'bg-zinc-50/70 border-zinc-200/60 active:bg-zinc-100'
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">{country.flag}</Text>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className={`font-bold text-xs mr-2 ${isSelected ? 'text-forest' : 'text-slate-800'}`}>
                            {country.name}
                          </Text>
                          <View className="bg-zinc-200/70 px-1.5 py-0.5 rounded">
                            <Text className="text-zinc-600 font-black text-[9px]">{country.dialCode}</Text>
                          </View>
                        </View>
                        <Text className="text-zinc-400 text-[10px] mt-0.5">{country.region}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 rounded-full bg-forest items-center justify-center">
                        <Check size={14} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
