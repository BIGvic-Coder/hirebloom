import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export default function HireBloomLogoMark({ size = 26 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 50 50">
        <Path
          d="M 15 42 C 6 38, 2 28, 2 16 C 2 6, 15 2, 34 2 C 39 2, 42 5, 42 10 C 42 22, 32 40, 15 42 Z"
          fill="none"
          stroke="#113C2C"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M 12 40 L 4 46"
          stroke="#113C2C"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <Path d="M 16 34 L 16 26" stroke="#8ECFA9" strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="16" cy="20" r="3.5" fill="#8ECFA9" />

        <Path d="M 25 34 L 25 20" stroke="#8ECFA9" strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="25" cy="14" r="3.5" fill="#8ECFA9" />

        <Path d="M 34 34 L 34 24" stroke="#8ECFA9" strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="34" cy="18" r="3.5" fill="#8ECFA9" />
      </Svg>
    </View>
  );
}

export { HireBloomLogoMark };
