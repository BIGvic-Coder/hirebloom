import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Mail, Lock, User, ArrowRight, Building2, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { auth, db, IS_MOCK_FIREBASE } from '@/constants/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const router = useRouter() as any;
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    setAuthLoading(true);
    try {
      if (IS_MOCK_FIREBASE) {
        console.log("Mock Mode: Skipping real credentials registration");
        // Simulate a successful verification delay for client demonstration
        setTimeout(() => {
          setAuthLoading(false);
          router.push(role === 'employer' ? '/employer' : '/candidate');
        }, 1000);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Store user's full name securely in Firebase Auth's displayName profile property
      await updateProfile(userCredential.user, { displayName: fullName });
      
      // Store user profile details and role in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: fullName,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });

      router.push(role === 'employer' ? '/employer' : '/candidate');
    } catch (error: any) {
      console.log('Registration Error:', error);
      alert('Registration Failed: ' + (error.message || error));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f2eb" />
      <View className="flex-1 px-6 pt-12 justify-center">
        
        {/* Brand Logo Container */}
        <View className="flex-row items-center mb-8 self-center">
          <View className="w-10 h-10 justify-center items-center mr-2.5">
            {/* Custom SVG leaf with three blooming figures inside */}
            <Svg width="36" height="36" viewBox="0 0 50 50">
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
          <Text className="text-3xl font-bold text-forest tracking-tight">
            bloom
          </Text>
        </View>

        <View className="bg-white p-6 rounded-3xl border border-zinc-200/50 shadow-md">
          <Text className="text-2xl font-bold text-forest mb-1">Create Account</Text>
          <Text className="text-zinc-500 text-xs mb-6">Join the bloom ecosystem today.</Text>

          {/* Role Selection */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity 
              onPress={() => setRole('candidate')}
              className={`flex-1 p-3.5 rounded-xl border flex-row items-center justify-center ${
                role === 'candidate' ? 'bg-mintLight/40 border-mint' : 'bg-white border-zinc-200'
              }`}
            >
              <Briefcase color={role === 'candidate' ? '#113c2c' : '#94a3b8'} size={18} style={{ marginRight: 6 }} />
              <Text className={`font-bold text-xs ${role === 'candidate' ? 'text-forest' : 'text-zinc-400'}`}>Candidate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setRole('employer')}
              className={`flex-1 p-3.5 rounded-xl border flex-row items-center justify-center ${
                role === 'employer' ? 'bg-mintLight/40 border-mint' : 'bg-white border-zinc-200'
              }`}
            >
              <Building2 color={role === 'employer' ? '#113c2c' : '#94a3b8'} size={18} style={{ marginRight: 6 }} />
              <Text className={`font-bold text-xs ${role === 'employer' ? 'text-forest' : 'text-zinc-400'}`}>Employer</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 mb-6">
            <View className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-3.5 flex-row items-center">
              <User color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput 
                placeholder={role === 'employer' ? "Company Name" : "Full Name"}
                className="flex-1 text-forest font-medium text-sm"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-3.5 flex-row items-center">
              <Mail color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput 
                placeholder="Work Email" 
                className="flex-1 text-forest font-medium text-sm"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-3.5 flex-row items-center">
              <Lock color="#113c2c" size={18} style={{ marginRight: 10 }} />
              <TextInput 
                placeholder="Create Password" 
                className="flex-1 text-forest font-medium text-sm"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            className="w-full bg-forest py-4 rounded-xl flex-row items-center justify-center shadow active:opacity-95 mb-6"
            onPress={handleRegister}
            disabled={authLoading}
          >
            <Text className="text-white font-bold text-base mr-2">
              {authLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
            <ArrowRight color="white" size={18} />
          </TouchableOpacity>

          <View className="flex-row items-center justify-center">
            <Text className="text-zinc-500 font-medium text-xs">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-forest font-extrabold text-xs">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
