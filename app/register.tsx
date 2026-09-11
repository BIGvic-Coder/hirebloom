import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Platform
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
  ShieldCheck
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

// Safely load native Google Sign-in to avoid crashes in Expo Go / Web
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch {
  // Silent fallback for Expo Go / Web preview
  GoogleSignin = null;
}

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

  const [role, setRole] = useState<'candidate' | 'employer'>(
    params.role === 'employer' ? 'employer' : 'candidate'
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync email param if passed from Login redirect
  useEffect(() => {
    if (params.email && !email) {
      setEmail(params.email);
    }
  }, [params.email]);

  // Initialize Google Sign-in on mount
  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId:
            process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
            '32893466508-gdfbel1mf5gc2vlgtqpp6e9s3jpr97j4.apps.googleusercontent.com',
          offlineAccess: false,
        });
      } catch {
        // Handled silently
      }
    }
  }, []);

  // Update role if params change
  useEffect(() => {
    if (params.role === 'employer') {
      setRole('employer');
    } else if (params.role === 'candidate') {
      setRole('candidate');
    }
  }, [params.role]);

  // Helper to persist user profile & session
  const saveUserProfileAndRoute = async (user: any, nameToUse: string, userRole: 'candidate' | 'employer') => {
    const cleanEmail = (user.email || email).trim().toLowerCase();

    try {
      if (!IS_MOCK_FIREBASE && db) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: nameToUse,
          email: cleanEmail,
          role: userRole,
          company: userRole === 'employer' ? companyName.trim() : null,
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Handled silently
    }

    try {
      await ApplicationsService.setCurrentUser({
        uid: user.uid,
        name: nameToUse,
        email: cleanEmail,
        role: userRole,
        initials: ApplicationsService.getInitials(nameToUse, cleanEmail),
      });

      // Register into user index so subsequent logins use OTP verification
      await ApplicationsService.registerNewUser({
        uid: user.uid,
        name: nameToUse,
        email: cleanEmail,
        role: userRole,
        company: userRole === 'employer' ? companyName.trim() : undefined,
      });
    } catch {
      // Handled silently
    }

    router.replace(userRole === 'employer' ? '/employer' : '/candidate');
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

      if (IS_MOCK_FIREBASE) {
        setTimeout(() => {
          setAuthLoading(false);
          router.replace(role === 'employer' ? '/employer' : '/candidate');
        }, 1000);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      await updateProfile(userCredential.user, { displayName: fullName });
      await saveUserProfileAndRoute(userCredential.user, fullName, role);
    } catch (error: any) {
      console.log('Registration Error:', error);
      const errCode = error?.code || '';
      const errMsg = error?.message || '';

      if (errCode === 'auth/email-already-in-use' || errMsg.includes('email-already-in-use')) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists.\n\nPlease go to the Sign In page to log in.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/login') }
          ]
        );
      } else if (errCode === 'auth/weak-password' || errMsg.includes('weak-password')) {
        Alert.alert('Weak Password', 'Password is too weak. Please use at least 6 characters.');
      } else if (errCode === 'auth/invalid-email' || errMsg.includes('invalid-email')) {
        Alert.alert('Invalid Email', 'The email address format is invalid.');
      } else {
        Alert.alert('Registration Failed', errMsg || error.toString());
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Register with Google (1-Tap Registration)
  const handleGoogleRegister = async () => {
    if (!GoogleSignin) {
      // In Expo Go or Web where native GoogleSignin is not available, provide preview verification
      Alert.alert(
        'Google Registration',
        `Would you like to register as a verified Google ${role === 'employer' ? 'Employer' : 'Candidate'} now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue with Google',
            onPress: async () => {
              const previewUser = {
                uid: `google-${Date.now()}`,
                displayName: firstName.trim() || 'Alex Morgan',
                email: email.trim() || 'alex.morgan.talent@gmail.com',
              };
              await saveUserProfileAndRoute(
                previewUser,
                previewUser.displayName,
                role
              );
            },
          },
        ]
      );
      return;
    }

    setAuthLoading(true);
    try {
      if (IS_MOCK_FIREBASE) {
        setTimeout(() => {
          setAuthLoading(false);
          router.replace(role === 'employer' ? '/employer' : '/candidate');
        }, 1000);
        return;
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      if (!idToken) throw new Error('Google registration failed (No ID Token returned).');

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const displayName =
        userCredential.user.displayName ||
        (firstName ? `${firstName} ${lastName}`.trim() : 'Hire Bloom Member');

      await saveUserProfileAndRoute(userCredential.user, displayName, role);
    } catch (error: any) {
      const errStr = String(error?.message || error || '');
      const errCode = String(error?.code || '');

      if (errCode === '12501' || errStr.includes('SIGN_IN_CANCELLED') || errStr.includes('cancelled')) {
        console.log('User cancelled Google registration dialog');
      } else {
        Alert.alert('Google Registration Error', error.message || error.toString());
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
          onPress={() => router.back()}
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

          {/* Role Switcher */}
          <View className="flex-row gap-3 mb-5">
            <TouchableOpacity
              onPress={() => setRole('candidate')}
              className={`flex-1 p-3.5 rounded-2xl border flex-row items-center justify-center ${
                role === 'candidate'
                  ? 'bg-mint/15 border-forest shadow-sm'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <Briefcase
                color={role === 'candidate' ? '#113c2c' : '#94a3b8'}
                size={18}
                style={{ marginRight: 6 }}
              />
              <View>
                <Text
                  className={`font-bold text-xs ${
                    role === 'candidate' ? 'text-forest' : 'text-zinc-500'
                  }`}
                >
                  Candidate
                </Text>
                <Text className="text-[10px] text-zinc-400">$13/hr standard</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('employer')}
              className={`flex-1 p-3.5 rounded-2xl border flex-row items-center justify-center ${
                role === 'employer'
                  ? 'bg-mint/15 border-forest shadow-sm'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <Building2
                color={role === 'employer' ? '#113c2c' : '#94a3b8'}
                size={18}
                style={{ marginRight: 6 }}
              />
              <View>
                <Text
                  className={`font-bold text-xs ${
                    role === 'employer' ? 'text-forest' : 'text-zinc-500'
                  }`}
                >
                  Employer
                </Text>
                <Text className="text-[10px] text-zinc-400">Hire talent</Text>
              </View>
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
    </SafeAreaView>
  );
}
