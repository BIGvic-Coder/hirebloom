// Type definitions for custom className props

import 'react';
import 'react-native';

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string;
    }
  }
}

declare module 'react-native' {
  interface ViewProps { className?: string; }
  interface TextProps { className?: string; }
  interface TouchableOpacityProps { className?: string; }
  interface ScrollViewProps { className?: string; }
  interface TextInputProps { className?: string; }
}
