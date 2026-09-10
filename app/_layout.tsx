import { Stack } from 'expo-router';
import '../src/global.css';
import { StyleSheet } from 'react-native';

// Fix for react-native-css-interop dark mode exception on web
if (typeof (StyleSheet as any).setFlag === 'function') {
  (StyleSheet as any).setFlag('darkMode', 'class');
}


export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="candidate" />
      <Stack.Screen name="employer" />
      <Stack.Screen name="recruiter" />
    </Stack>
  );
}
