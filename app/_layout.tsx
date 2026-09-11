import { Stack } from 'expo-router';
import '../src/global.css';
import { StyleSheet, LogBox } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Ignore non-critical development warnings in Metro / terminal
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Google Sign-in native module not available',
  'Missing or insufficient permissions',
  'Error fetching',
  '[Reanimated]',
  'Encountered two children with the same key',
]);

// Disable Reanimated strict mode development render warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

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
      <Stack.Screen name="notifications" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
