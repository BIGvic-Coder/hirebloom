import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

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

  // Configure Google SDK client on mount
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1234567890-mockwebclientid.apps.googleusercontent.com',
      });
    } catch (e) {
      console.warn('Google Sign-in configuration failed:', e);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      if (IS_MOCK_FIREBASE) {
        console.log("Mock Mode: Skipping real credentials authentication");
        // Simulate a successful verification delay
        setTimeout(() => {
          setAuthLoading(false);
          router.push('/candidate');
        }, 1200);
        return;
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Handle the new nested layout of user credentials from Expo SDK
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      if (!idToken) throw new Error("Google authentication failed (No ID Token returned)");

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      // Routing fallback (e.g. standard candidate dashboard)
      router.push('/candidate');
    } catch (error: any) {
      console.log('Authentication Error:', error);
      alert('Sign-In Failed: ' + (error.message || error));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f2eb" />
      <View className="flex-1 px-6 pt-16 justify-center">
        
        {/* Brand Logo Container */}
        <View className="flex-row items-center mb-10 self-center">
          <View className="w-12 h-12 justify-center items-center mr-3">
            <Svg width="44" height="44" viewBox="0 0 50 50">
              <Path
                d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
                fill="none"
                stroke="#8ecfa9"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M 12 40 L 4 46"
                stroke="#8ecfa9"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <Path d="M 16 34 L 16 26" stroke="#8ecfa9" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="16" cy="20" r="3.5" fill="#8ecfa9" />
              
              <Path d="M 25 34 L 25 20" stroke="#8ecfa9" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="25" cy="14" r="3.5" fill="#8ecfa9" />

              <Path d="M 34 34 L 34 24" stroke="#8ecfa9" strokeWidth="3.5" strokeLinecap="round" />
              <Circle cx="34" cy="18" r="3.5" fill="#8ecfa9" />
            </Svg>
          </View>
          <Text className="text-4xl font-bold text-forest tracking-tight">
            bloom
          </Text>
        </View>
        
        <View className="bg-white p-6 rounded-3xl border border-zinc-200/50 shadow-md">
          <Text className="text-2xl font-bold text-forest mb-1.5">Welcome back</Text>
          <Text className="text-zinc-500 text-xs mb-6">Sign in to continue to Hirebloom.</Text>

          {/* Google SSO Button */}
          <TouchableOpacity 
            onPress={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full bg-white border border-zinc-200 py-3.5 rounded-xl flex-row items-center justify-center active:opacity-85 shadow-sm mb-5"
          >
            <GoogleLogo />
            <Text className="text-forest font-bold text-sm">
              {authLoading ? 'Connecting...' : 'Sign In with Google'}
            </Text>
          </TouchableOpacity>

          {/* Separator Divider */}
          <View className="flex-row items-center mb-5">
            <View className="flex-1 h-[1px] bg-zinc-100" />
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mx-3">or</Text>
            <View className="flex-1 h-[1px] bg-zinc-100" />
          </View>

          {/* Custom Credentials Form */}
          <View className="space-y-4 mb-6">
            <View className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-3.5 flex-row items-center mb-3">
              <Mail color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput 
                placeholder="Email address" 
                className="flex-1 text-forest font-medium text-sm"
                placeholderTextColor="#94a3b8"
                defaultValue="Victor Talabi"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-3.5 flex-row items-center">
              <Lock color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput 
                placeholder="Password" 
                className="flex-1 text-forest font-medium text-sm"
                placeholderTextColor="#94a3b8"
                defaultValue="••••••••••"
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity className="self-end mt-1">
              <Text className="text-forest font-bold text-xs">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className="w-full bg-forest py-4 rounded-xl flex-row items-center justify-center shadow active:opacity-95 mb-6"
            onPress={() => router.push('/')}
          >
            <Text className="text-white font-bold text-base mr-2">Sign In</Text>
            <ArrowRight color="white" size={18} />
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mb-6">
            <Text className="text-zinc-500 font-medium text-xs">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-forest font-extrabold text-xs">Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Portals for Review */}
          <View className="border-t border-zinc-100 pt-6">
            <Text className="text-zinc-400 font-bold text-[9px] text-center uppercase tracking-widest mb-3">
              Explore Demo Portals
            </Text>
            <View className="flex-row justify-between space-x-2">
              <TouchableOpacity 
                onPress={() => router.push('/candidate')}
                className="flex-1 bg-zinc-50 border border-zinc-200/60 py-2.5 rounded-xl items-center justify-center active:opacity-70"
              >
                <Text className="text-forest font-extrabold text-[10px]">Candidate</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/employer')}
                className="flex-1 bg-zinc-50 border border-zinc-200/60 py-2.5 rounded-xl items-center justify-center active:opacity-70"
              >
                <Text className="text-forest font-extrabold text-[10px]">Employer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/recruiter')}
                className="flex-1 bg-zinc-50 border border-zinc-200/60 py-2.5 rounded-xl items-center justify-center active:opacity-70"
              >
                <Text className="text-forest font-extrabold text-[10px]">Recruiter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
