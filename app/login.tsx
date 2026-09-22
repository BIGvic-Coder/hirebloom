import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, Check, KeyRound, RefreshCw, ShieldCheck, ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { auth, db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ApplicationsService } from '@/services/applicationsService';
import { GoogleSignin, statusCodes, isGoogleSigninAvailable } from '@/services/googleAuth';
import ExecutivePasscodeModal from '@/components/ui/ExecutivePasscodeModal';

// Custom Official Google Multi-Colored Vector Logo
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

export default function Login() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ email?: string }>();
  const [authLoading, setAuthLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'emailCode' | 'password'>('emailCode');
  const [otpStep, setOtpStep] = useState<'enterEmail' | 'enterCode'>('enterEmail');
  const [isCeoPasscodeVisible, setIsCeoPasscodeVisible] = useState(false);

  const [email, setEmail] = useState(params.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [generatedCodeHint, setGeneratedCodeHint] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sync params if passed
  useEffect(() => {
    if (params.email && !email) {
      setEmail(params.email);
    }
  }, [params.email]);

  // Configure Google SDK client on mount
  useEffect(() => {
    if (Platform.OS !== 'web' && GoogleSignin?.configure) {
      try {
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '32893466508-gdfbel1mf5gc2vlgtqpp6e9s3jpr97j4.apps.googleusercontent.com',
          offlineAccess: false,
        });
      } catch (err) {
        console.warn('GoogleSignin configure error:', err);
      }
    }
  }, []);

  const handleUserRouting = async (user: any) => {
    let role = 'candidate';
    let displayName = user.displayName;

    const cleanUserEmail = (user.email || '').trim().toLowerCase();
    if (cleanUserEmail === 'getinbig6@gmail.com' || cleanUserEmail === 'ceo@hirebloom.com') {
      role = 'ceo';
      displayName = 'Victor Taiwo (Admin / CEO)';
      await ApplicationsService.setCeoAuthenticated(true);
    } else {
      try {
        // Check existing registered user to restore name and role
        const check = await ApplicationsService.checkUserExists(cleanUserEmail);
        if (check.user?.name) {
          displayName = check.user.name;
        }
        if (check.user?.role) {
          role = check.user.role;
        }

      if (!IS_MOCK_FIREBASE && db) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData?.role) {
            role = userData.role;
          }
          if (userData?.name && !displayName) {
            displayName = userData.name;
          }
        } else {
          try {
            await setDoc(userDocRef, {
              uid: user.uid,
              name: displayName || user.email?.split('@')[0] || 'Candidate',
              email: user.email || '',
              role: role,
              createdAt: new Date().toISOString()
            }, { merge: true });
          } catch {
            // Firestore write handled gracefully
          }
        }
      }
    } catch {
      // Handled gracefully
    }
  }

    if (!displayName) {
      const prefix = user.email?.split('@')[0] || 'Candidate';
      displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    // 1. Clear any prior cached session first
    try {
      await ApplicationsService.clearCurrentUser();
    } catch {}

    // 2. Set current user session
    try {
      await ApplicationsService.setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        name: displayName,
        role: role as any,
        initials: ApplicationsService.getInitials(displayName, user.email)
      });
      await ApplicationsService.registerNewUser({
        uid: user.uid,
        email: user.email || '',
        name: displayName,
        role: role as any,
      });
    } catch {
      // Handled silently
    }
    
    router.replace(role === 'employer' || role === 'ceo' ? '/employer' : role === 'recruiter' ? '/recruiter' : '/candidate');
  };

  // 1. Send Email Verification Code (OTP) Flow (Old vs New User Detection)
  const handleSendEmailOtp = async () => {
    const cleanEmail = ApplicationsService.normalizeEmail(email);
    if (cleanEmail !== email) {
      setEmail(cleanEmail);
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address to continue.");
      return;
    }

    setAuthLoading(true);
    try {
      // Check if user is an existing / old user
      const check = await ApplicationsService.checkUserExists(cleanEmail);

      if (!check.exists) {
        // NEW USER DETECTED: Offer instant registration
        setAuthLoading(false);
        Alert.alert(
          "New to Hire Bloom?",
          `We couldn't find an existing account for "${cleanEmail}".\n\nWould you like to register as a new user?`,
          [
            { text: "Try Another Email", style: "cancel" },
            {
              text: "Register as New User",
              onPress: () => {
                router.push({
                  pathname: '/register',
                  params: { email: cleanEmail }
                });
              }
            }
          ]
        );
        return;
      }

      // EXISTING / OLD USER: Send 6-digit OTP verification code
      const res = await ApplicationsService.sendEmailOtp(cleanEmail);
      if (res.success) {
        setGeneratedCodeHint(res.code);
        setOtpStep('enterCode');
        Alert.alert(
          `Welcome Back${check.user?.name ? `, ${check.user.name}` : ''}!`,
          `We verified your account. A 6-digit verification code has been sent to:\n${cleanEmail}\n\n(Testing Code: ${res.code})`
        );
      } else {
        Alert.alert("Error", res.message || "Failed to send verification code.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to verify account.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Verify OTP Code and Enter Portal
  const handleVerifyOtp = async () => {
    const cleanEmail = ApplicationsService.normalizeEmail(email);
    const cleanCode = (otpCode || '').trim();

    if (!cleanCode || cleanCode.length < 4) {
      Alert.alert("Incomplete Code", "Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await ApplicationsService.verifyEmailOtp(cleanEmail, cleanCode);
      if (res.success && res.user) {
        const userRole = res.user.role;
        router.replace(userRole === 'employer' || userRole === 'ceo' ? '/employer' : userRole === 'recruiter' ? '/recruiter' : '/candidate');
      } else {
        Alert.alert("Verification Failed", res.error || "Invalid verification code.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not verify code.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Password Sign In
  const handleEmailSignIn = async () => {
    const cleanEmail = ApplicationsService.normalizeEmail(email);
    if (cleanEmail !== email) {
      setEmail(cleanEmail);
    }
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    setAuthLoading(true);
    try {
      if (!IS_MOCK_FIREBASE && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          await handleUserRouting(userCredential.user);
          return;
        } catch (firebaseErr: any) {
          console.warn('Firebase signInWithEmailAndPassword warning:', firebaseErr);
          const errCode = firebaseErr?.code || '';
          if (errCode === 'auth/wrong-password') {
            Alert.alert("Incorrect Password", "Please check your password and try again.");
            return;
          }
        }
      }

      // Check registered users in local/Firestore storage
      const check = await ApplicationsService.checkUserExists(cleanEmail);
      if (check.exists && check.user) {
        if ((check.user as any).password && (check.user as any).password !== cleanPassword) {
          Alert.alert("Incorrect Password", "Please check your password and try again.");
          return;
        }
        await handleUserRouting({
          uid: check.user.uid,
          email: cleanEmail,
          displayName: check.user.name,
        });
        return;
      }

      Alert.alert(
        "Account Not Found",
        `No account found with "${cleanEmail}".\n\nTap 'Sign up' to register a new account.`
      );
    } catch (error: any) {
      Alert.alert("Sign-In Failed", error?.message || error.toString());
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web' || !isGoogleSigninAvailable) {
      Alert.alert(
        "Google Sign-In",
        "Native Google Sign-In runs in the Android APK. In Expo Go or Web, please use Email Verification Code or Password to sign in."
      );
      return;
    }

    setAuthLoading(true);
    try {
      // 1. Verify Google Play Services is available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 2. Sign out any existing session first so that Google Play Services always displays the native "Choose an account" dialog on Android
      try {
        await GoogleSignin.signOut();
      } catch {
        // Safe to ignore if already signed out
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
      const userName = googleUser?.name || userEmail.split('@')[0] || 'HireBloom Member';
      const userUid = googleUser?.id || `google-${Date.now()}`;

      if (!userEmail && !idToken) {
        throw new Error("No Google account selected.");
      }

      // Authenticate with Firebase if connected
      let firebaseUser: any = null;
      if (!IS_MOCK_FIREBASE && auth && idToken) {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          firebaseUser = userCredential.user;
        } catch (fbErr: any) {
          console.warn('Firebase credential sign-in warning:', fbErr);
        }
      }

      const authenticatedUser = {
        uid: firebaseUser?.uid || userUid,
        email: firebaseUser?.email || userEmail,
        displayName: firebaseUser?.displayName || userName,
      };

      await handleUserRouting(authenticatedUser);
    } catch (error: any) {
      const errStr = String(error?.message || error || '');
      const errCode = String(error?.code || '');

      // User cancelled account chooser - dismiss silently
      if (
        errCode === '12501' ||
        errCode === statusCodes?.SIGN_IN_CANCELLED ||
        errStr.includes('SIGN_IN_CANCELLED') ||
        errStr.includes('cancelled') ||
        errStr.includes('12501')
      ) {
        console.log('User dismissed Google account picker');
      } else if (errCode === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services is not available or outdated on this device.');
      } else {
        Alert.alert('Google Sign-In Error', error?.message || error.toString());
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f2eb" />

      {/* Top Navigation Bar */}
      <View className="px-6 pt-3 pb-2 flex-row items-center justify-between">
        {router.canGoBack() ? (
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 items-center justify-center shadow-sm active:opacity-70"
          >
            <ChevronLeft size={20} color="#113c2c" />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10 rounded-full bg-mint/15 items-center justify-center border border-mint/30">
            <ShieldCheck size={18} color="#059669" />
          </View>
        )}

        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-forest tracking-tight">bloom</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          className="px-3 py-1.5 rounded-full bg-forest shadow-sm active:opacity-85"
        >
          <Text className="text-xs font-bold text-white">Register</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Brand Logo Container */}
        <View className="flex-row items-center mb-6 self-center">
          <View className="w-11 h-11 justify-center items-center mr-2.5">
            <Svg width="40" height="40" viewBox="0 0 50 50">
              <Path
                d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
                fill="none"
                stroke="#059669"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M 12 40 L 4 46"
                stroke="#059669"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <Path d="M 16 34 L 16 26" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="16" cy="20" r="3.5" fill="#059669" />
              
              <Path d="M 25 34 L 25 20" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="25" cy="14" r="3.5" fill="#059669" />

              <Path d="M 34 34 L 34 24" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="34" cy="18" r="3.5" fill="#059669" />
            </Svg>
          </View>
          <Text className="text-3xl font-bold text-forest tracking-tight">
            hire bloom
          </Text>
        </View>

        {/* Main Card */}
        <View className="bg-white p-7 rounded-3xl border border-zinc-200/70 shadow-lg">
          
          {/* Method Switcher Tabs */}
          <View className="flex-row bg-zinc-100 p-1 rounded-2xl mb-6">
            <TouchableOpacity 
              onPress={() => { setLoginMethod('emailCode'); setOtpStep('enterEmail'); }}
              className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${loginMethod === 'emailCode' ? 'bg-white shadow-sm' : ''}`}
            >
              <KeyRound size={14} color={loginMethod === 'emailCode' ? '#113c2c' : '#94a3b8'} style={{ marginRight: 6 }} />
              <Text className={`text-xs font-bold ${loginMethod === 'emailCode' ? 'text-forest' : 'text-zinc-500'}`}>
                Email Code (OTP)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setLoginMethod('password')}
              className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${loginMethod === 'password' ? 'bg-white shadow-sm' : ''}`}
            >
              <Lock size={14} color={loginMethod === 'password' ? '#113c2c' : '#94a3b8'} style={{ marginRight: 6 }} />
              <Text className={`text-xs font-bold ${loginMethod === 'password' ? 'text-forest' : 'text-zinc-500'}`}>
                Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= METHOD 1: EMAIL CODE (OTP) ================= */}
          {loginMethod === 'emailCode' && (
            <>
              {otpStep === 'enterEmail' ? (
                <>
                  <Text className="text-2xl font-extrabold text-slate-900 mb-1">
                    Welcome to Bloom talent
                  </Text>
                  <Text className="text-zinc-500 text-xs mb-6">
                    Continue with your preferred method
                  </Text>

                  {/* Email Input */}
                  <View className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 flex-row items-center mb-3.5">
                    <Mail color="#113c2c" size={18} style={{ marginRight: 10 }} />
                    <TextInput 
                      placeholder="Enter email address" 
                      className="flex-1 text-slate-900 font-medium text-sm"
                      placeholderTextColor="#94a3b8"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Stay logged in for 14 days */}
                  <TouchableOpacity 
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center mb-6 pl-1"
                  >
                    <View className={`w-5 h-5 rounded-md border items-center justify-center mr-2.5 ${rememberMe ? 'bg-forest border-forest' : 'border-zinc-300 bg-white'}`}>
                      {rememberMe && <Check size={12} color="white" strokeWidth={3} />}
                    </View>
                    <Text className="text-xs text-zinc-600 font-medium">
                      Stay logged in for 14 days
                    </Text>
                  </TouchableOpacity>

                  {/* Continue Button */}
                  <TouchableOpacity 
                    onPress={handleSendEmailOtp}
                    disabled={authLoading}
                    className="w-full bg-forest py-4 rounded-full flex-row items-center justify-center shadow-md active:opacity-90 mb-5"
                  >
                    <Text className="text-white font-bold text-base mr-2">
                      {authLoading ? 'Sending code...' : 'Continue'}
                    </Text>
                    <ArrowRight color="white" size={18} />
                  </TouchableOpacity>
                </>
              ) : (
                /* STEP 2: ENTER CODE */
                <>
                  <TouchableOpacity 
                    onPress={() => setOtpStep('enterEmail')}
                    className="flex-row items-center mb-4"
                  >
                    <ChevronLeft size={16} color="#113c2c" />
                    <Text className="text-forest font-bold text-xs ml-1">Change email</Text>
                  </TouchableOpacity>

                  <Text className="text-2xl font-extrabold text-slate-900 mb-1">
                    Check your email
                  </Text>
                  <Text className="text-zinc-500 text-xs mb-1">
                    We sent a 6-digit verification code to:
                  </Text>
                  <Text className="text-forest font-bold text-xs mb-5">
                    {email}
                  </Text>

                  {/* Code Input */}
                  <View className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-4 flex-row items-center mb-3">
                    <ShieldCheck color="#059669" size={20} style={{ marginRight: 10 }} />
                    <TextInput 
                      placeholder="Enter 6-digit code" 
                      className="flex-1 text-slate-900 font-mono font-bold text-lg tracking-widest"
                      placeholderTextColor="#94a3b8"
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  {/* Quick Code Autofill */}
                  {generatedCodeHint ? (
                    <TouchableOpacity 
                      onPress={() => setOtpCode(generatedCodeHint)}
                      className="bg-mint/15 border border-mint/40 rounded-xl p-2.5 mb-4 flex-row items-center justify-between"
                    >
                      <Text className="text-forest font-medium text-xs">
                        Verification code: <Text className="font-mono font-bold">{generatedCodeHint}</Text>
                      </Text>
                      <Text className="text-forest font-bold text-xs">Insert</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Verify Button */}
                  <TouchableOpacity 
                    onPress={handleVerifyOtp}
                    disabled={authLoading}
                    className="w-full bg-forest py-4 rounded-full flex-row items-center justify-center shadow-md active:opacity-90 mb-3"
                  >
                    <Text className="text-white font-bold text-base mr-2">
                      {authLoading ? 'Verifying...' : 'Verify & Enter Portal'}
                    </Text>
                    <ArrowRight color="white" size={18} />
                  </TouchableOpacity>

                  {/* Resend Code */}
                  <TouchableOpacity 
                    onPress={handleSendEmailOtp}
                    disabled={authLoading}
                    className="py-2 items-center flex-row justify-center mb-2"
                  >
                    <RefreshCw size={12} color="#64748b" style={{ marginRight: 5 }} />
                    <Text className="text-zinc-500 font-medium text-xs">Didn&apos;t receive code? Resend</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* ================= METHOD 2: STANDARD PASSWORD ================= */}
          {loginMethod === 'password' && (
            <>
              <Text className="text-2xl font-extrabold text-slate-900 mb-1">
                Welcome back
              </Text>
              <Text className="text-zinc-500 text-xs mb-6">
                Sign in with your email and password
              </Text>

              <View className="space-y-3 mb-5">
                <View className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 flex-row items-center mb-3">
                  <Mail color="#113c2c" size={18} style={{ marginRight: 10 }} />
                  <TextInput 
                    placeholder="Email address" 
                    className="flex-1 text-slate-900 font-medium text-sm"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 flex-row items-center">
                  <Lock color="#113c2c" size={18} style={{ marginRight: 10 }} />
                  <TextInput 
                    placeholder="Password" 
                    className="flex-1 text-slate-900 font-medium text-sm"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-forest py-4 rounded-full flex-row items-center justify-center shadow-md active:opacity-90 mb-5"
                onPress={handleEmailSignIn}
                disabled={authLoading}
              >
                <Text className="text-white font-bold text-base mr-2">
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </Text>
                <ArrowRight color="white" size={18} />
              </TouchableOpacity>

              <View className="flex-row items-center justify-center mb-2">
                <Text className="text-zinc-500 font-medium text-xs">Don&apos;t have an account? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/register')}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  activeOpacity={0.7}
                  className="py-1 px-1.5"
                >
                  <Text className="text-forest font-extrabold text-xs">Sign up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Separator Divider */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-[1px] bg-zinc-200" />
            <Text className="text-zinc-400 text-xs font-normal mx-3">or</Text>
            <View className="flex-1 h-[1px] bg-zinc-200" />
          </View>

          {/* Google SSO Button matching HireBloom Web */}
          <TouchableOpacity 
            onPress={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full bg-white border border-slate-900 py-3.5 rounded-full flex-row items-center justify-center active:opacity-85 shadow-sm mb-4"
          >
            <GoogleLogo />
            <Text className="text-slate-900 font-medium text-sm">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <Text className="text-zinc-400 text-[11px] text-center leading-tight">
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>

      {/* CEO Executive Passcode Modal */}
      {isCeoPasscodeVisible && (
        <ExecutivePasscodeModal
          visible={isCeoPasscodeVisible}
          onClose={() => setIsCeoPasscodeVisible(false)}
          onSuccess={async () => {
            await ApplicationsService.setCeoAuthenticated(true);
            await ApplicationsService.elevateRoleTo('ceo');
            router.replace('/employer');
          }}
          title="CEO Executive Access"
          subtitle="Enter Master Key (2026) to enter Owner Mode"
          targetRole="ceo"
        />
      )}
    </SafeAreaView>
  );
}
