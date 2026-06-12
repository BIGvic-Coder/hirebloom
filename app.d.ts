// Type definitions for custom className props
import 'react-native';

declare module 'react-native' {
  interface ViewProps { className?: string; }
  interface TextProps { className?: string; }
  interface TouchableOpacityProps { className?: string; }
  interface ScrollViewProps { className?: string; }
  interface TextInputProps { className?: string; }
}

// Add support for lucide-react-native icons
declare module 'react-native-svg' {
  interface SvgProps { className?: string; }
}
