/**
 * Hire Bloom Official Design System Tokens
 * Aligned with Hire Bloom's brand aesthetic: confident, human, trustworthy, clean.
 */

export const HireBloomColors = {
  // Brand Primaries
  forest: '#113C2C',         // Deep forest green (headers, navigation, primary CTAs)
  forestDark: '#0B2C1F',     // Deepest forest green
  forestLight: '#1C543E',    // Subtle active/hover state
  
  // Accents
  mint: '#8ECFA9',           // Primary accent & positive highlights
  mintLight: '#D1F0DD',      // Background tint for badges and highlights
  mintDark: '#5EAC80',       // Accessible text on light backgrounds
  
  // Canvas & Surfaces
  canvas: '#F7F9F7',         // App background (very light neutral green-gray)
  surface: '#FFFFFF',        // Card, modal, input surface
  surfaceMuted: '#F0F4F1',   // Secondary elevated background
  
  // Typography Colors
  ink: '#17352D',            // High-contrast dark green-black for primary text
  inkMuted: '#66736D',       // Secondary descriptive text
  inkSubtle: '#94A39B',      // Placeholders, disabled states
  
  // Structural Lines
  border: '#E2E8E2',         // Subtle card and divider borders
  borderMuted: '#EFF3EF',    // Inset borders
  
  // Public Workflow & Status Colors
  stages: {
    intro: {
      color: '#0F172A',
      bg: '#F1F5F9',
      border: '#CBD5E1',
      label: 'Intro',
    },
    match: {
      color: '#0369A1',
      bg: '#E0F2FE',
      border: '#BAE6FD',
      label: 'Match',
    },
    interview: {
      color: '#6D28D9',
      bg: '#EDE9FE',
      border: '#DDD6FE',
      label: 'Interview',
    },
    onboard: {
      color: '#065F46',
      bg: '#D1FAE5',
      border: '#A7F3D0',
      label: 'Onboard',
    },
    declined: {
      color: '#991B1B',
      bg: '#FEE2E2',
      border: '#FECACA',
      label: 'Closed',
    },
  },

  // Verified Business Metrics
  metrics: {
    startingRate: '$13/hr',
    talentPoolSize: '1,000+',
    collegeEducatedPct: '74%',
    firstYearRetentionPct: '70%',
    applicantApprovalPct: '~9%',
  }
} as const;

export const HireBloomRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const HireBloomSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
