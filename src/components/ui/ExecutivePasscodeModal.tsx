import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { Crown, Lock, X, Delete, Sparkles } from 'lucide-react-native';
import { ApplicationsService } from '@/services/applicationsService';

interface ExecutivePasscodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  targetRole?: 'ceo';
}

export const EXECUTIVE_MASTER_PASSCODE = '2026';

export default function ExecutivePasscodeModal({
  visible,
  onClose,
  onSuccess,
  title = 'Executive Command Access',
  subtitle = 'Enter Master Passcode to unlock Owner & CEO Authority',
  targetRole = 'ceo',
}: ExecutivePasscodeModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (visible) {
      setPin('');
      setErrorMsg('');
      setIsVerifying(false);
    }
  }, [visible]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const verifyPin = async (candidatePin: string) => {
    setIsVerifying(true);
    setTimeout(async () => {
      if (candidatePin === EXECUTIVE_MASTER_PASSCODE) {
        try {
          await ApplicationsService.elevateRoleTo(targetRole);
        } catch {}
        setIsVerifying(false);
        onSuccess();
        onClose();
      } else {
        if (Platform.OS !== 'web') {
          try {
            Vibration.vibrate(200);
          } catch {}
        }
        setIsVerifying(false);
        setErrorMsg('Access Denied: Incorrect Master Passcode. Exclusive to Platform Owner.');
        setPin('');
      }
    }, 250);
  };

  const handleAutofillMasterKey = () => {
    setPin(EXECUTIVE_MASTER_PASSCODE);
    verifyPin(EXECUTIVE_MASTER_PASSCODE);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/85 items-center justify-center px-6">
        <View className="w-full max-w-sm bg-[#0a1f16] rounded-3xl p-6 border border-[#8ecfa9]/30 shadow-2xl">
          
          {/* Top Bar with Close */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center bg-[#8ecfa9]/15 border border-[#8ecfa9]/30 px-3 py-1 rounded-full">
              <Crown size={12} color="#8ecfa9" style={{ marginRight: 5 }} />
              <Text className="text-[#8ecfa9] text-[10px] font-black uppercase tracking-wider">
                Restricted Owner Area
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center active:opacity-70"
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Icon & Title */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-2xl bg-[#0d281e] border-2 border-[#8ecfa9]/40 items-center justify-center mb-3 shadow-lg">
              <Lock size={28} color="#8ecfa9" />
            </View>
            <Text className="text-white font-extrabold text-xl text-center">
              {title}
            </Text>
            <Text className="text-zinc-400 text-xs text-center mt-1 px-4 leading-relaxed">
              {subtitle}
            </Text>
          </View>

          {/* 4-Digit Indicator */}
          <View className="flex-row justify-center items-center gap-4 mb-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <View
                  key={index}
                  className={`w-12 h-14 rounded-2xl items-center justify-center border-2 transition-all ${
                    isFilled
                      ? 'border-[#8ecfa9] bg-[#8ecfa9]/20 shadow-md'
                      : errorMsg
                      ? 'border-red-500/60 bg-red-500/10'
                      : 'border-zinc-700 bg-white/5'
                  }`}
                >
                  <Text className="text-white text-2xl font-mono font-bold">
                    {isFilled ? '●' : '—'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View className="bg-red-950/70 border border-red-500/40 rounded-xl p-2.5 mb-4">
              <Text className="text-red-300 text-center text-xs font-semibold">
                {errorMsg}
              </Text>
            </View>
          ) : null}

          {/* Quick Demo Key Helper */}
          <TouchableOpacity
            onPress={handleAutofillMasterKey}
            className="bg-[#8ecfa9]/10 border border-[#8ecfa9]/30 rounded-xl p-2.5 mb-5 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center">
              <Sparkles size={14} color="#8ecfa9" style={{ marginRight: 6 }} />
              <Text className="text-[#8ecfa9] text-xs font-semibold">
                Demo Key: <Text className="font-mono font-black tracking-wider text-white">2026</Text>
              </Text>
            </View>
            <Text className="text-[#8ecfa9] text-xs font-bold underline">
              Tap to Unlock
            </Text>
          </TouchableOpacity>

          {/* Keypad */}
          <View className="space-y-2 mb-2">
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['clear', '0', 'backspace'],
            ].map((row, rowIdx) => (
              <View key={rowIdx} className="flex-row justify-between gap-2 mb-2">
                {row.map((btn) => {
                  if (btn === 'clear') {
                    return (
                      <TouchableOpacity
                        key={btn}
                        onPress={handleClear}
                        className="flex-1 h-12 rounded-xl bg-white/5 items-center justify-center active:opacity-60"
                      >
                        <Text className="text-zinc-400 font-bold text-xs uppercase">
                          Clear
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  if (btn === 'backspace') {
                    return (
                      <TouchableOpacity
                        key={btn}
                        onPress={handleDelete}
                        className="flex-1 h-12 rounded-xl bg-white/5 items-center justify-center active:opacity-60"
                      >
                        <Delete size={18} color="#94a3b8" />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={btn}
                      onPress={() => handleKeyPress(btn)}
                      className="flex-1 h-12 rounded-xl bg-white/10 items-center justify-center active:bg-[#8ecfa9]/30 border border-white/5"
                    >
                      <Text className="text-white text-xl font-bold font-mono">
                        {btn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Footer note */}
          <Text className="text-zinc-500 text-[10px] text-center mt-2">
            Differentiates standard applicants & clients from the platform owner.
          </Text>

        </View>
      </View>
    </Modal>
  );
}
