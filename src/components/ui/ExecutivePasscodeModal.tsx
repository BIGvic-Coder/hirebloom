import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Vibration,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { ShieldCheck, Lock, X, Delete, Sparkles, KeyRound } from 'lucide-react-native';
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
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setPin('');
      setErrorMsg('');
      setIsVerifying(false);
      // Auto focus after modal opens
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
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

  const handleTextChange = (text: string) => {
    // Only accept numeric digits
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(cleaned);
    setErrorMsg('');
    if (cleaned.length === 4) {
      verifyPin(cleaned);
    }
  };

  const verifyPin = async (candidatePin: string) => {
    setIsVerifying(true);
    if (candidatePin === EXECUTIVE_MASTER_PASSCODE) {
      try {
        await ApplicationsService.setCeoAuthenticated(true);
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
  };

  const handleInstantUnlock = async () => {
    setPin(EXECUTIVE_MASTER_PASSCODE);
    try {
      await ApplicationsService.setCeoAuthenticated(true);
      await ApplicationsService.elevateRoleTo(targetRole);
    } catch {}
    onSuccess();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          
          {/* Top Bar with Close */}
          <View style={styles.topBar}>
            <View style={styles.badge}>
              <ShieldCheck size={12} color="#8ecfa9" style={{ marginRight: 5 }} />
              <Text style={styles.badgeText}>Restricted Owner Area</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <X size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Icon & Title */}
          <View style={styles.header}>
            <View style={styles.lockIconBox}>
              <Lock size={26} color="#8ecfa9" />
            </View>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </View>

          {/* Clickable 4-Digit Display & Hidden Input */}
          <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View style={styles.pinDisplayRow}>
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinBox,
                      isFilled ? styles.pinBoxFilled : styles.pinBoxEmpty,
                      errorMsg ? styles.pinBoxError : null,
                    ]}
                  >
                    <Text style={styles.pinDigitText}>
                      {isFilled ? '●' : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </TouchableWithoutFeedback>

          {/* Hidden/Native TextInput for keyboard typing */}
          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={false}
            style={styles.hiddenInput}
            caretHidden={true}
          />

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* One-Tap Unlock Button */}
          <TouchableOpacity
            onPress={handleInstantUnlock}
            activeOpacity={0.8}
            style={styles.oneTapButton}
          >
            <Sparkles size={16} color="#071912" style={{ marginRight: 8 }} />
            <Text style={styles.oneTapButtonText}>
              One-Tap Unlock: Master Key <Text style={{ fontWeight: '900' }}>2026</Text>
            </Text>
          </TouchableOpacity>

          {/* On-Screen Keypad with Explicit Styles */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['clear', '0', 'backspace'],
            ].map((row, rowIdx) => (
              <View key={rowIdx} style={styles.keypadRow}>
                {row.map((btn) => {
                  if (btn === 'clear') {
                    return (
                      <TouchableOpacity
                        key={btn}
                        onPress={handleClear}
                        activeOpacity={0.6}
                        style={[styles.keypadBtn, styles.specialKeypadBtn]}
                      >
                        <Text style={styles.specialKeypadText}>Clear</Text>
                      </TouchableOpacity>
                    );
                  }
                  if (btn === 'backspace') {
                    return (
                      <TouchableOpacity
                        key={btn}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                        style={[styles.keypadBtn, styles.specialKeypadBtn]}
                      >
                        <Delete size={20} color="#94a3b8" />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={btn}
                      onPress={() => handleKeyPress(btn)}
                      activeOpacity={0.6}
                      style={styles.keypadBtn}
                    >
                      <Text style={styles.keypadDigitText}>{btn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Footer */}
          <Text style={styles.footerNote}>
            Differentiates standard applicants & clients from the platform owner.
          </Text>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0a1f16',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(142, 207, 169, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 207, 169, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(142, 207, 169, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#8ecfa9',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lockIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#0d281e',
    borderWidth: 1.5,
    borderColor: 'rgba(142, 207, 169, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  pinDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pinBox: {
    width: 50,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxEmpty: {
    borderColor: '#334155',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  pinBoxFilled: {
    borderColor: '#8ecfa9',
    backgroundColor: 'rgba(142, 207, 169, 0.2)',
  },
  pinBoxError: {
    borderColor: 'rgba(239, 68, 68, 0.7)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pinDigitText: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0.01,
    width: 1,
    height: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(153, 27, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  oneTapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8ecfa9',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#8ecfa9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  oneTapButtonText: {
    color: '#071912',
    fontSize: 13,
    fontWeight: '800',
  },
  keypad: {
    marginBottom: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  keypadDigitText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  specialKeypadBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  specialKeypadText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerNote: {
    color: '#64748b',
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 4,
  },
});
