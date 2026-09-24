export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  region: string;
  placeholder: string;
}

export const HIRING_COUNTRIES: CountryItem[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', region: 'Africa', placeholder: '801 234 5678' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', region: 'Americas', placeholder: '(555) 123-4567' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', region: 'Europe', placeholder: '7911 123456' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', region: 'Americas', placeholder: '(555) 123-4567' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', region: 'Asia-Pacific', placeholder: '917 123 4567' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233', region: 'Africa', placeholder: '24 123 4567' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', region: 'Africa', placeholder: '712 345678' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', region: 'Africa', placeholder: '82 123 4567' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', region: 'Asia-Pacific', placeholder: '98765 43210' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', region: 'Europe', placeholder: '151 12345678' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', region: 'Latin America', placeholder: '11 91234-5678' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', region: 'Asia-Pacific', placeholder: '412 345 678' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', region: 'Middle East', placeholder: '10 1234 5678' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92', region: 'Asia-Pacific', placeholder: '300 1234567' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', region: 'Latin America', placeholder: '55 1234 5678' },
  { code: 'GLOBAL', name: 'Worldwide Remote', flag: '🌍', dialCode: '+1', region: 'Global', placeholder: 'Phone number' },
];
