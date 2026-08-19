import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation } from 'react-native';
import { Check, X, ArrowRight, DollarSign, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const PRICING_TAGS = [
  { text: 'Flat hourly rate', active: true, desc: 'Starting at just $13/hour. You pay only for hours worked.' },
  { text: 'No acquisition costs', active: true, desc: 'Zero upfront fees to source, interview, and match talent.' },
  { text: 'No hidden fees', active: true, desc: 'Contracts are fully transparent. Software & support included.' },
  { text: 'Flexible agreements', active: true, desc: 'No long-term locks. Standard 30-day notice periods.' },
  { text: 'No finder\'s fees', active: true, desc: 'We do not charge buyout or finder placement percentages.' },
  { text: 'No implementation fees', active: true, desc: 'Setup, onboarding coordination, and support are free.' },
];

export default function PricingSection() {
  const router = useRouter() as any;
  const [selectedTag, setSelectedTag] = useState(PRICING_TAGS[0]);

  const handleTagPress = (tag: typeof PRICING_TAGS[0]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedTag(tag);
  };

  return (
    <View className="bg-cream px-6 py-16">
      {/* Title block */}
      <Text className="text-xs font-semibold text-emerald-700 uppercase tracking-widest text-center mb-2">
        Pricing plans
      </Text>
      <Text className="text-3xl font-extrabold text-forest text-center tracking-tight mb-4">
        Cost-savings without{'\n'}the compromise.
      </Text>
      <Text className="text-sm text-zinc-500 text-center mb-10 max-w-[280px] self-center">
        Transparent pricing with no surprises. Starting at $13/hour.
      </Text>

      {/* Floating features horizontal slider */}
      <View className="mb-8">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 12 }}
        >
          {PRICING_TAGS.map((tag, idx) => {
            const isSelected = selectedTag.text === tag.text;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleTagPress(tag)}
                className={`flex-row items-center px-4 py-2.5 rounded-full mr-3 shadow-sm ${
                  isSelected ? 'bg-forest border border-mint' : 'bg-white border border-zinc-200'
                }`}
                activeOpacity={0.8}
              >
                <Check size={12} color={isSelected ? '#8ecfa9' : '#113c2c'} style={{ marginRight: 6 }} />
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-forest'}`}>
                  {tag.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feature description tooltip box */}
        <View className="bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-mint/15 items-center justify-center mr-3">
            <DollarSign size={16} color="#113c2c" />
          </View>
          <View className="flex-1">
            <Text className="text-forest font-bold text-xs uppercase tracking-wider mb-0.5">Benefit details</Text>
            <Text className="text-[11px] text-zinc-500 leading-relaxed">{selectedTag.desc}</Text>
          </View>
        </View>
      </View>

      {/* Pricing comparison cards */}
      <View className="space-y-8">
        
        {/* Card 1: Embedded Teams */}
        <View className="bg-forest rounded-3xl p-6 shadow-xl border border-mint/20 relative overflow-hidden">
          <View className="absolute top-0 right-0 bg-mint px-4 py-1 rounded-bl-xl">
            <Text className="text-forest font-bold text-[9px] uppercase tracking-wider">Most Popular</Text>
          </View>

          <Text className="text-white font-bold text-xl mb-1">Embedded Teams</Text>
          <View className="flex-row items-baseline mb-1">
            <Text className="text-white font-extrabold text-3xl">$13</Text>
            <Text className="text-mintLight font-medium text-sm">/hour</Text>
          </View>
          <Text className="text-mintLight font-medium text-xs mb-6">Managed by you</Text>

          <TouchableOpacity 
            onPress={() => router.push('/employer')}
            className="w-full bg-mint py-4 rounded-xl flex-row items-center justify-center active:opacity-90 mb-6"
          >
            <Text className="text-forest font-bold text-sm mr-2">Start Hiring</Text>
            <ArrowRight size={16} color="#113C2C" />
          </TouchableOpacity>

          {/* Features Checkbox */}
          <View className="space-y-4 border-t border-white/10 pt-6">
            {[
              { label: 'Where you get', val: 'Direct team member oversight' },
              { label: 'Talent pool', val: 'Exclusive access to BYU-Pathway students/grads with US-accredited credentials' },
              { label: 'Vetting & Screening', val: 'Thorough English assessment, live interviews & home-office checks' },
              { label: 'Hiring & Payroll', val: 'Hirebloom handles US contracts & foreign payroll' },
              { label: 'Team Management', val: 'You direct daily tasks and project execution' },
              { label: 'Customer Success', val: 'Dedicated coordinator to monitor performance' },
              { label: 'Scale', val: 'From 3 to 100+ team members' },
              { label: 'Timeline', val: 'Get started within a few days' },
            ].map((feat, i) => (
              <View key={i} className="flex-row items-start">
                <Check size={14} color="#8ecfa9" style={{ marginTop: 2, marginRight: 8 }} />
                <View className="flex-1">
                  <Text className="text-mint font-bold text-[10px] uppercase tracking-wide">{feat.label}</Text>
                  <Text className="text-zinc-200 text-xs mt-0.5 leading-relaxed">{feat.val}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Card 2: Managed Teams */}
        <View className="bg-white rounded-3xl p-6 shadow-md border border-zinc-200/50">
          <Text className="text-forest font-bold text-xl mb-1">Managed Teams</Text>
          <Text className="text-forest font-extrabold text-2xl mb-1">Flat-Rate</Text>
          <Text className="text-zinc-500 font-medium text-xs mb-6">Managed by us</Text>

          <TouchableOpacity 
            onPress={() => router.push('/employer')}
            className="w-full bg-forest py-4 rounded-xl flex-row items-center justify-center active:opacity-90 mb-6"
          >
            <Text className="text-white font-bold text-sm mr-2">Contact Us</Text>
            <ArrowRight size={16} color="white" />
          </TouchableOpacity>

          {/* Features Checkbox */}
          <View className="space-y-4 border-t border-zinc-100 pt-6">
            {[
              { label: 'What you get', val: 'Professional outsourced management' },
              { label: 'Talent pool', val: 'Exclusive access to BYU-Pathway students/grads with US-accredited credentials' },
              { label: 'Vetting & Screening', val: 'Thorough English assessment, live interviews & set up in PCI-compliant office' },
              { label: 'Hiring & Payroll', val: 'Hirebloom handles sourcing, contracts & foreign payroll' },
              { label: 'Team Management', val: 'Hirebloom leads daily management & QA reporting' },
              { label: 'Customer Success', val: 'On-site operational lead and executive oversight' },
              { label: 'Scale', val: 'Enterprise scaling from 10+ members' },
              { label: 'Timeline', val: 'Get started within a few weeks' },
            ].map((feat, i) => (
              <View key={i} className="flex-row items-start">
                <Check size={14} color="#113c2c" style={{ marginTop: 2, marginRight: 8 }} />
                <View className="flex-1">
                  <Text className="text-forest font-bold text-[10px] uppercase tracking-wide">{feat.label}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{feat.val}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </View>
    </View>
  );
}
