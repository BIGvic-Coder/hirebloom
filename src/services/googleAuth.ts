import { Platform } from 'react-native';

/**
 * Safe wrapper for @react-native-google-signin/google-signin.
 * Prevents "TurboModuleRegistry.getEnforcing: 'RNGoogleSignin' could not be found"
 * crashes when running inside Expo Go or environments without the native binary linked.
 */

let GoogleSignin: any = {
  configure: () => {},
  hasPlayServices: async () => false,
  signIn: async () => {
    throw new Error('Native Google Sign-In is only available in the standalone APK build. In Expo Go, please use Email Verification Code or Password.');
  },
  signOut: async () => {},
};

let statusCodes: any = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

let isGoogleSigninAvailable = false;

try {
  // Only attempt native require on mobile platforms
  if (Platform.OS !== 'web') {
    const GoogleSigninPackage = require('@react-native-google-signin/google-signin');
    if (GoogleSigninPackage && GoogleSigninPackage.GoogleSignin) {
      GoogleSignin = GoogleSigninPackage.GoogleSignin;
      statusCodes = GoogleSigninPackage.statusCodes || statusCodes;
      isGoogleSigninAvailable = true;
    }
  }
} catch (error) {
  // Gracefully caught in Expo Go where native binary is not bundled
  isGoogleSigninAvailable = false;
}

export { GoogleSignin, statusCodes, isGoogleSigninAvailable };
