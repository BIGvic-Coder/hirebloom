import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { Mail, Lock, ArrowRight, Check, KeyRound, RefreshCw, ShieldCheck, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { auth, db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ApplicationsService } from '@/services/applicationsService';

// Safely load native Google Sign-in to avoid crashes in environments like Expo Go where it's not present
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.warn('Google Sign-in native module not available in this build.');
}

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
  const [authLoading, setAuthLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'emailCode' | 'password'>('emailCode');
  const [otpStep, setOtpStep] = useState<'enterEmail' | 'enterCode'>('enterEmail');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedCodeHint, setGeneratedCodeHint] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Configure Google SDK client on mount
  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '32893466508-gdfbel1mf5gc2vlgtqpp6e9s3jpr97j4.apps.googleusercontent.com',
          offlineAccess: false,
        });
      } catch (e) {
        console.warn('Google Sign-in configuration failed:', e);
      }
    }
  }, []);

  const handleUserRouting = async (user: any) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let role = 'candidate';
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData && userData.role) {
          role = userData.role;
        }
      } else {
        role = 'candidate';
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || 'Candidate User',
          email: user.email || '',
          role: role,
          createdAt: new Date().toISOString()
        });
      }
      
      router.push(role === 'employer' ? '/employer' : role === 'recruiter' ? '/recruiter' : '/candidate');
    } catch (err: any) {
      console.log('Error checking user role:', err);
      router.push('/candidate');
    }
  };

  // 1. Send Email Verification Code (OTP) Flow
  const handleSendEmailOtp = async () => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address to receive your verification code.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await ApplicationsService.sendEmailOtp(cleanEmail);
      if (res.success) {
        setGeneratedCodeHint(res.code);
        setOtpStep('enterCode');
        Alert.alert(
          "Verification Code Sent",
          `We sent a 6-digit verification code to:\n${cleanEmail}\n\n(Demo Testing Code: ${res.code})`
        );
      } else {
        Alert.alert("Error", res.message || "Failed to send verification code.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to send code.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Verify OTP Code and Enter Portal
  const handleVerifyOtp = async () => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (otpCode || '').trim();

    if (!cleanCode || cleanCode.length < 4) {
      Alert.alert("Incomplete Code", "Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await ApplicationsService.verifyEmailOtp(cleanEmail, cleanCode);
      if (res.success) {
        router.push('/candidate');
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
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    setAuthLoading(true);
    try {
      if (IS_MOCK_FIREBASE) {
        setTimeout(() => {
          setAuthLoading(false);
          router.push('/candidate');
        }, 800);
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      await handleUserRouting(userCredential.user);
    } catch (error: any) {
      const errCode = error?.code || '';
      const errMsg = error?.message || '';

      if (errCode === 'auth/invalid-credential' || errMsg.includes('invalid-credential')) {
        Alert.alert("Sign-In Error", "Invalid email or password.\n\nTap 'Sign up' to create an account, or try signing in with Email Verification Code!");
      } else if (errCode === 'auth/user-not-found' || errMsg.includes('user-not-found')) {
        Alert.alert("Account Not Found", "No account found with this email.\n\nTap 'Sign up' to register a new account.");
      } else if (errCode === 'auth/wrong-password' || errMsg.includes('wrong-password')) {
        Alert.alert("Incorrect Password", "Please check your password and try again.");
      } else {
        Alert.alert("Sign-In Failed", errMsg || error.toString());
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Google Sign In
  const handleGoogleSignIn = async () => {
    if (!GoogleSignin) {
      Alert.alert("Notice", "Google Sign-In requires native build. You can sign in using Email Code, Password, or quick demo portals.");
      return;
    }
    setAuthLoading(true);
    try {
      if (IS_MOCK_FIREBASE) {
        setTimeout(() => {
          setAuthLoading(false);
          router.push('/candidate');
        }, 1000);
        return;
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      if (!idToken) throw new Error("Google authentication failed (No ID Token returned)");

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      await handleUserRouting(userCredential.user);
    } catch (error: any) {
      const errStr = String(error?.message || error || '');
      const errCode = String(error?.code || '');

      if (errCode === '12501' || errStr.includes('SIGN_IN_CANCELLED') || errStr.includes('cancelled')) {
        console.log('User cancelled Google Sign-in dialog');
      } else {
        Alert.alert('Google Sign-In', error.message || error.toString());
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f2eb" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }} showsVerticalScrollIndicator={false}>
        
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

                  {/* Auto-fill test code if generated */}
                  {generatedCodeHint ? (
                    <TouchableOpacity 
                      onPress={() => setOtpCode(generatedCodeHint)}
                      className="bg-mint/20 border border-mint/40 rounded-xl p-2.5 mb-4 flex-row items-center justify-between"
                    >
                      <Text className="text-forest font-semibold text-xs">
                        Tap to autofill demo code: <Text className="font-mono font-bold">{generatedCodeHint}</Text>
                      </Text>
                      <Text className="text-forest font-bold text-xs">Use Code</Text>
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
                <TouchableOpacity onPress={() => router.push('/register')}>
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

          {/* Quick Demo Portals for Review */}
          <View className="border-t border-zinc-100 pt-5 mt-5">
            <Text className="text-zinc-400 font-bold text-[9px] text-center uppercase tracking-widest mb-3">
              Explore Demo Portals
            </Text>
            <View className="flex-row justify-between space-x-2">
              <TouchableOpacity 
                onPress={() => router.push('/candidate')}
                className="flex-1 bg-zinc-50 border border-zinc-200 py-2 rounded-xl items-center justify-center active:opacity-70 mr-1.5"
              >
                <Text className="text-forest font-extrabold text-[10px]">Talent Portal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/employer')}
                className="flex-1 bg-zinc-50 border border-zinc-200 py-2 rounded-xl items-center justify-center active:opacity-70 mr-1.5"
              >
                <Text className="text-forest font-extrabold text-[10px]">Employer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/recruiter')}
                className="flex-1 bg-zinc-50 border border-zinc-200 py-2 rounded-xl items-center justify-center active:opacity-70"
              >
                <Text className="text-forest font-extrabold text-[10px]">Recruiter</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
