import React from 'react';
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface WorkflowStepperProps {
  currentStep: number; // 1: Intro, 2: Match, 3: Interview, 4: Onboard
  isDeclined?: boolean;
}

const STEPS = [
  { step: 1, label: 'Intro' },
  { step: 2, label: 'Match' },
  { step: 3, label: 'Interview' },
  { step: 4, label: 'Onboard' },
];

export default function WorkflowStepper({ currentStep, isDeclined = false }: WorkflowStepperProps) {
  return (
    <View className="py-2 px-1">
      <View className="flex-row items-center justify-between relative">
        {/* Background Connecting Line */}
        <View className="absolute left-6 right-6 top-[15px] h-[2px] bg-slate-200 -z-0" />

        {STEPS.map((s, idx) => {
          const isCompleted = !isDeclined && currentStep > s.step;
          const isCurrent = !isDeclined && currentStep === s.step;

          return (
            <View key={s.step} className="items-center z-10">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-forest border-forest shadow-sm scale-105'
                    : isCompleted
                    ? 'bg-mintDark border-mintDark'
                    : isDeclined
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-white border-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check size={14} color="white" strokeWidth={3} />
                ) : (
                  <Text
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {s.step}
                  </Text>
                )}
              </View>

              <Text
                className={`text-[11px] mt-1.5 font-bold ${
                  isCurrent
                    ? 'text-forest'
                    : isCompleted
                    ? 'text-mintDark'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
